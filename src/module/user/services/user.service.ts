import { Inject, Injectable } from "@nestjs/common";
import { CACHE_SERVICE, EVENT_PUBLISHER } from "src/share/di-token";
import { IUserService } from "../ports/user.port";
import type { IUserMongoAuditRepository, IUserMongoOtpRepository, IUserRepository } from "../ports/user.port";
import {Requester, AppError, type ICacheService, UserRole, type IAccessTokenProvider, type IRefreshTokenProvider,type IEventPublisher, AccessTokenPayload, ErrInvalidRequest, ErrTokenInvalid, ErrNotFound, RefreshTokenPayload } from "src/share";
import { ACCESS_TOKEN_PROVIDER, REFRESH_TOKEN_PROVIDER, USER_MONGO_AUDIT_REPOSITORY, USER_MONGO_OTP_REPOSITORY, USER_REPOSITORY } from "../user.di-token";
import { UserUpdateDTO, userUpdateDTOSchema } from "../dtos/user.dto";
import { ErrEmailAlreadyExists, ErrUserBanned, ErrUserInactive, ErrUsernameAlreadyExists, ErrUserNotFound, ErrUserPending, User, UserStatus } from "../models/user.model";
import { v7 } from "uuid";
import bcrypt from "bcrypt";
import { AdminCreateUserEvent, UserCompleteChangePasswordEvent, UserCreatedEvent, UserDeletedEvent, UserForgotPasswordEvent, UserUpdateProfileEvent, UserVerifyEvent } from "src/share/event";
import { CreateStaffDTO, createStaffDTOSchema } from "../dtos/user.dto";


// Lớp UserService cung cấp các phương thức liên quan đến người dùng
@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(USER_MONGO_AUDIT_REPOSITORY) private readonly userAuditRepo: IUserMongoAuditRepository,
    @Inject(USER_MONGO_OTP_REPOSITORY) private readonly userOtpRepo: IUserMongoOtpRepository,
    @Inject(ACCESS_TOKEN_PROVIDER) private readonly accessTokenProvider: IAccessTokenProvider,
    @Inject(REFRESH_TOKEN_PROVIDER) private readonly refreshTokenProvider: IRefreshTokenProvider,
    @Inject(CACHE_SERVICE) private readonly redis: ICacheService,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
  ) {}

  // Phương thức tạo người dùng mới cho Staff/Kitchen
  async createStart(requester: Requester, dto: CreateStaffDTO, ip: string, userAgent: string): Promise<string> {
    // 1. Kiểm tra dữ liệu đầu vào
    const data = createStaffDTOSchema.parse(dto);

    // 2. Kiểm tra nếu email hoặc username đã tồn tại
    const existingByEmail = await this.userRepo.findByCondOr({ email: data.email, username: data.username });
    if (existingByEmail) {
      if (existingByEmail.email === data.email) {
        throw AppError.from(ErrEmailAlreadyExists, 400);
      }
      if (existingByEmail.username === data.username) {
        throw AppError.from(ErrUsernameAlreadyExists, 400);
      }
    }

    // 3. Tạo người dùng mới
    const userId = v7();
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(`${data.password}.${salt}`, 10);

    const newUser: User = {
      id: userId,
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      birthday: data.birthday,
      salt: salt,
      password: hashedPassword,
      role: data.role,
      status: UserStatus.ACTIVE,
      rankId: null,
      mongoUserId: null,
      currentPoints: 0,
      fcmToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.userRepo.insert(newUser);

    // 4. Phát hành sự kiện nhân viên được tạo
    await this.eventPublisher.publish(AdminCreateUserEvent.create({userId: userId, email: data.email,  username: data.username}, requester.sub));

    // Lưu log tạo nhân viên thành công
    await this.userAuditRepo.logUserAudit({
      userId: requester.sub,
      action: 'CREATE_STAFF_SUCCESS',
      success: true,
      ip: ip,
      userAgent: userAgent,
      metaData: { createdUserId: userId, createdUsername: data.username }
    });
    
    return userId;
  }

  // Phương thức lấy thông tin hồ sơ người dùng
  async profile(userId: string): Promise<Omit<User, 'password' | 'salt'>> {
    
    // 1. Lấy thông tin người dùng từ cơ sở dữ liệu
    const user = await this.userRepo.get(userId);

    // 2. Kiểm tra nếu không tìm thấy người dùng
    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    // 3. Trả về thông tin người dùng (loại bỏ password và salt)
    const { password, salt, ...profile } = user;
    return profile;
  }

  // Phương thức cập nhật thông tin người dùng
  async update(requester: Requester, userId: string, dto: UserUpdateDTO, ip?: string, userAgent?: string): Promise<Omit<User, 'password' | 'salt'>> {
    // 1. Kiểm tra dữ liệu cập nhật
    const data = userUpdateDTOSchema.parse(dto);

    // 2. Kiểm tra nếu người dùng tồn tại
    const user = await this.userRepo.get(userId);
    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    // 3. Cập nhật thông tin người dùng
    await this.userRepo.update(userId, data);

    // 4. Phát hành sự kiện cập nhật hồ sơ người dùng
    await this.eventPublisher.publish(UserUpdateProfileEvent.create({userId: userId, email: user.email, username: data.username || user.username}, requester.sub)); // Phát hành sự kiện cập nhật hồ sơ người dùng

    // 5. Lấy lại thông tin người dùng sau khi cập nhật
    const updatedUser = await this.userRepo.get(userId);
    if (!updatedUser) {
      throw AppError.from(ErrUserNotFound, 404);
    }
    const { password, salt, ...rest } = updatedUser;

    // Lưu log cập nhật hồ sơ thành công
    await this.userAuditRepo.logUserAudit({
      userId: userId,
      action: 'UPDATE_PROFILE_SUCCESS',
      success: true,
      ip: ip,
      userAgent: userAgent,
      metaData: { updatedFields: Object.keys(data) }
    });
    return rest;
  }

  // Phương thức xoá tài khoản người dùng
  async deleteAccount(requester: Requester, userId: string, ip: string | undefined, userAgent: string | undefined): Promise<void> {
    // 1. Kiểm tra nếu người dùng tồn tại
    const user = await this.userRepo.get(userId);
    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    // 2. Xoá người dùng khỏi cơ sở dữ liệu
    await this.userRepo.delete(userId);

    // 3. Phát hành sự kiện người dùng bị xoá
    await this.eventPublisher.publish(UserDeletedEvent.create({userId: userId, email: user.email, username: user.username}, requester.sub)); // Phát hành sự kiện người dùng bị xoá
    
    // Lưu log xoá tài khoản thành công
    await this.userAuditRepo.logUserAudit({
      userId: userId,
      action: 'DELETE_ACCOUNT_SUCCESS',
      success: true,
      ip: ip,
      userAgent: userAgent,
      metaData: { deletedAt: new Date().toISOString() }
    });
  }

  // Phương thức thêm FCM token cho người dùng
  async addFcmToken(userId: string, fcmToken: string, ip: string | undefined, userAgent: string | undefined): Promise<void> {
    // 1. Kiểm tra nếu người dùng tồn tại
    const user = await this.userRepo.get(userId);
    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    // 2. Thêm FCM token vào người dùng
    const existingTokens = user.fcmToken ? user.fcmToken.split(',') : [];
    if (!existingTokens.includes(fcmToken)) {
      existingTokens.push(fcmToken);
      const updatedTokens = existingTokens.join(',');
      await this.userRepo.update(userId, { fcmToken: updatedTokens });
    }
  }

  // Phương thức xoá FCM token cho người dùng
  async removeFcmToken(userId: string, fcmToken: string, ip: string | undefined, userAgent: string | undefined): Promise<void> {
    // 1. Kiểm tra nếu người dùng tồn tại
    const user = await this.userRepo.get(userId);
    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    // 2. Xoá FCM token khỏi người dùng
    const existingTokens = user.fcmToken ? user.fcmToken.split(',') : [];
    const filteredTokens = existingTokens.filter(token => token !== fcmToken);
    const updatedTokens = filteredTokens.join(',');
    await this.userRepo.update(userId, { fcmToken: updatedTokens });
  } 
}