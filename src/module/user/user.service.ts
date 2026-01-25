import { Inject, Injectable } from "@nestjs/common";
import { CACHE_SERVICE, EVENT_PUBLISHER } from "src/share/di-token";
import { IUserService } from "./user.port";
import type { IUserMongoAuditRepository, IUserMongoOtpRepository, IUserRepository } from "./user.port";
import {Requester, AppError, type ICacheService, UserRole, type IAccessTokenProvider, type IRefreshTokenProvider,type IEventPublisher, AccessTokenPayload, ErrInvalidRequest, ErrTokenInvalid, ErrNotFound, RefreshTokenPayload } from "src/share";
import { ACCESS_TOKEN_PROVIDER, REFRESH_TOKEN_PROVIDER, USER_MONGO_AUDIT_REPOSITORY, USER_MONGO_OTP_REPOSITORY, USER_REPOSITORY } from "./user.di-token";
import { UserAuthDTO, UserChangePasswordDTO, userChangePasswordDTOSchema, UserLoginDTO, userLoginDTOSchema, UserRegistrationDTO, userRegistrationDTOSchema, UserResetPasswordDTO, userResetPasswordDTOSchema, UserUpdateDTO, userUpdateDTOSchema } from "./user.dto";
import { ErrEmailAlreadyExists, ErrUserBanned, ErrUserInactive, ErrUsernameAlreadyExists, ErrUserNotFound, ErrUserPending, User, UserStatus } from "./user.model";
import { v7 } from "uuid";
import bcrypt from "bcrypt";
import { UserCompleteChangePasswordEvent, UserCreatedEvent, UserDeletedEvent, UserForgotPasswordEvent, UserUpdateProfileEvent, UserVerifyEvent } from "src/share/event";


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

  // Phương thức đăng ký người dùng mới
  async register(dto: UserRegistrationDTO, ip?: string, userAgent?: string): Promise<string> {
    const data = userRegistrationDTOSchema.parse(dto);

    // 1. Kiểm tra xem email đã được sử dụng chưa
    const userEmail = await this.userRepo.findByCond({ email: data.email });
    if (userEmail) {
      // TH1: Lưu log email đã tồn tại
      await this.userAuditRepo.logUserAudit({
        userId: userEmail.id,
        action: 'REGISTER_FAILED_EMAIL_EXISTS',
        success: false,
        ip,
        userAgent,
        metaData: { reason: 'Email already exists' }
      })
      throw AppError.from(ErrEmailAlreadyExists, 409);
    }

    // 2. Kiểm tra xem username đã được sử dụng chưa
    const userUsername = await this.userRepo.findByCond({ username: data.username });
    if (userUsername) {
      // TH2: Lưu log username đã tồn tại
      await this.userAuditRepo.logUserAudit({
        userId: userUsername.id,
        action: 'REGISTER_FAILED_USERNAME_EXISTS',
        success: false,
        ip,
        userAgent,
        metaData: { reason: 'Username already exists' }
      })
      throw AppError.from(ErrUsernameAlreadyExists, 409);
    }

    // 3. Tạo salt và hash mật khẩu
    const salt = bcrypt.genSaltSync(8);
    const hashPassword = bcrypt.hashSync(`${data.password}.${salt}`, 10);

    // 4. Tạo người dùng mới
    const newId = v7();
    const newUser = {
      ...data,
      id: newId,
      salt: salt,
      password: hashPassword,
      role: UserRole.CUSTOMER,
      rankId: null,
      mongoUserId: null,
      currentPoints: 0,
      status: UserStatus.PENDING,
      fcmToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 5. Lưu người dùng mới vào cơ sở dữ liệu
    await this.userRepo.insert(newUser);

    // TH3: Lưu log đăng ký thành công
    await this.userAuditRepo.logUserAudit({
      userId: newId,
      action: 'REGISTER_SUCCESS',
      success: true,
      ip,
      userAgent,
      metaData: { email: data.email, username: data.username }
    });
    return data.email;
  }

  // Phương thức yêu cầu kích hoạt tài khoản (khi token hết hạn)
  async activateAccount(email: string, ip?: string, userAgent?: string): Promise<void> {
    // 1. Kiểm tra xem email có tồn tại không
    const user = await this.userRepo.findByCond({ email });
    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }
    // 2. Kiểm tra trạng thái người dùng
    if (user.status !== UserStatus.PENDING) {
      // TH4: Lưu log kích hoạt tài khoản thất bại do tài khoản đã được kích hoạt
      await this.userAuditRepo.logUserAudit({
        userId: user.id,
        action: 'ACTIVATE_ACCOUNT_FAILED_USER_ALREADY_ACTIVE',
        success: false,
        ip,
        userAgent,
        metaData: { reason: 'User already verified' }
      });

      throw AppError.from(new Error('User already verified'), 400);
    }

    // Lưu log yêu cầu kích hoạt tài khoản
    await this.userAuditRepo.logUserAudit({
      userId: user.id,
      action: 'ACTIVATE_ACCOUNT_REQUESTED',
      success: true,
      ip,
      userAgent,
      metaData: { email: user.email, username: user.username }
    });

  }

  // Phương thức tạo mã OTP để xác minh tài khoản
  async genarateOTPAccount(email: string): Promise<{sessionId: string, expiry: number} | null> {
    // 1. Kiểm tra xem email có tồn tại không
    const user = await this.userRepo.findByCond({ email });
    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    // 2. Tạo và gửi mã OTP (6 chữ số) đến email người dùng
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const hash = bcrypt.hashSync(otp, 10);

    // 3. Tạo phiên làm việc với token
    const token = v7();

    // 4. Lưu phiên làm việc vào Redis với thời gian hết hạn
    await this.redis.set(`verify-account:session:${token}`, JSON.stringify({ email: email, purpose: 'verify-account', status: 'OTP_PENDING', createdAt: new Date() }), 60 * 60 ) // 60 phút

    // 5. Lưu mã OTP băm vào Redis với thời gian hết hạn
    await this.redis.set(`verify-account:${token}`, JSON.stringify({ email: email, otp: hash, createdAt: new Date() }), 5 * 60 ) // 5 phút

    // 6. Lưu rate limit vào Redis với thời gian hết hạn
    await this.redis.set(`verify-account:rate:${token}`, JSON.stringify({ count: 1}), 10 * 60 ) // chỉ được gửi 5 email trong 10 phút

    // 7. Bắn RabbitMQ qua MailService để gửi email chứa mã OTP (bỏ qua phần triển khai gửi email
    await this.eventPublisher.publish(UserCreatedEvent.create({userId: user.id, email: email, username: user.username, otp: otp}, user.id));

    // Lưu log tạo mã OTP thành công
    await this.userOtpRepo.logOTPAttempt({
      identifier: email,
      type: 'VERIFY_ACCOUNT',
      action: 'GENERATE_OTP_ACCOUNT_SUCCESS',
      success: true,
      ip: undefined,
      userAgent: undefined,
      metaData: { email: email, username: user.username }
    });

    // 8. Trả về token và thời gian hết hạn
    return { sessionId: token, expiry: Date.now() + 60 * 60 * 1000 }; // 60 phút
  }

  // Phương thức gửi lại mã xác minh tài khoản
  async resendVerifyAccount(token: string): Promise<void> {
    console.log('Resend verify account called with token:', token);
    // 1. Lấy dữ liệu phiên làm việc từ Redis
    const sessionStr = await this.redis.get(`verify-account:session:${token}`);
    if (!sessionStr) {
      await this.userOtpRepo.logOTPAttempt({
        identifier: 'unknown',
        type: 'RESEND_VERIFY_ACCOUNT',
        action: 'RESEND_VERIFY_ACCOUNT_FAILED_INVALID_OR_EXPIRED_TOKEN',
        success: false,
        ip: undefined,
        userAgent: undefined,
        metaData: { reason: 'Invalid or expired token' }
      });

      throw AppError.from(new Error('Invalid or expired token'), 400);
    }

    // 2. Lấy thông tin email từ phiên làm việc
    const sessionData = JSON.parse(sessionStr) as { email: string; purpose: string; status: string; createdAt: Date };

    // 3. Lấy người dùng từ cơ sở dữ liệu
    const user = await this.userRepo.findByCond({ email: sessionData.email });
    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    // 4. Kiểm tra trạng thái người dùng
    if (user.status !== UserStatus.PENDING) {
      await this.userAuditRepo.logUserAudit({
        userId: user.id,
        action: 'VERIFY_ACCOUNT_FAILED_ALREADY_VERIFIED',
        success: false,
        ip: undefined,
        userAgent: undefined,
        metaData: { reason: 'User already verified' }
      });

      throw AppError.from(new Error('User already verified'), 400);
    }

    // 5. Kiểm tra mục đích của phiên làm việc
    if (sessionData.purpose !== 'verify-account') {
      throw AppError.from(new Error('Invalid session purpose'), 400);
    }

    // 6. Kiểm tra trạng thái phiên làm việc
    if (sessionData.status !== 'OTP_PENDING') {
      throw AppError.from(new Error('OTP already verified or invalid session'), 400);
    }

    // 7. Kiểm tra mã OTP cũ còn hiệu lực không và xóa nó nếu có
    const oldOtpStr = await this.redis.get(`verify-account:${token}`);
    if (oldOtpStr) {
      // kiểm tra xem OTP đã qua 1 phút chưa, nếu chưa thì không cho gửi lại
      const oldOtpData = JSON.parse(oldOtpStr) as { email: string; otp: string, createdAt: Date };
      const now = new Date();
      const createdAt = new Date(oldOtpData.createdAt);
      const diff = (now.getTime() - createdAt.getTime()) / 1000;
      if (diff < 60) {
        // Lưu log gửi lại OTP quá nhanh
        await this.userOtpRepo.logOTPAttempt({
          identifier: user.email,
          type: 'RESEND_VERIFY_ACCOUNT',
          action: 'RESEND_VERIFY_ACCOUNT_FAILED_TOO_MANY_REQUESTS',
          success: false,
          ip: undefined,
          userAgent: undefined,
          metaData: { reason: 'Too many requests' }
        });

        throw AppError.from(new Error('Please wait before requesting a new OTP'), 400);
      }

      await this.redis.del(`verify-account:${token}`);
    }

    // 8. Kiểm tra rate limit
    const rateStr = await this.redis.get(`verify-account:rate:${token}`);
    let rateData = { count: 0 };

    if (rateStr) {
      rateData = JSON.parse(rateStr);
      if (rateData.count > 5) {
        // Lưu log vượt quá giới hạn gửi lại OTP
        await this.userOtpRepo.logOTPAttempt({
          identifier: user.email,
          type: 'RESEND_VERIFY_ACCOUNT',
          action: 'RESEND_VERIFY_ACCOUNT_FAILED_TOO_MANY_REQUESTS',
          success: false,
          ip: undefined,
          userAgent: undefined,
          metaData: { reason: 'Too many requests' }
        });
        throw AppError.from(new Error('Too many requests. Please try again later.'), 429);
      }
      rateData.count += 1;
      await this.redis.update(`verify-account:rate:${token}`, JSON.stringify(rateData)); // Cập nhật lại rate limit khongi thay doi thoi gian song
    } else {
      rateData.count = 1;
      await this.redis.set(`verify-account:rate:${token}`, JSON.stringify(rateData), 60 * 10 ) // chỉ được gửi 5 email trong 10 phút
    }

    // 9. Tạo và gửi mã OTP (6 chữ số) đến email người dùng
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = bcrypt.hashSync(otp, 10);

    // 10. Lưu mã OTP băm vào Redis với thời gian hết hạn
    await this.redis.set(`verify-account:${token}`, JSON.stringify({ email: sessionData.email, otp: hash, createdAt: new Date() }), 5 * 60 ) // 5 phút

    // 11. Bắn RabbitMQ qua MailService để gửi email chứa mã OTP
    await this.eventPublisher.publish(UserCreatedEvent.create({userId: user.id, email: sessionData.email, username: user.username, otp: otp}, user.id));
    
    // 12. Lưu log gửi lại mã OTP thành công
    await this.userOtpRepo.logOTPAttempt({
      identifier: user.email,
      type: 'RESEND_VERIFY_ACCOUNT',
      action: 'RESEND_VERIFY_ACCOUNT_SUCCESS',
      success: true,
      ip: undefined,
      userAgent: undefined,
      metaData: { email: user.email, username: user.username }
    });
  }

  // Phương thức xác minh tài khoản người dùng
  async verifyAccount(token: string, otp: string, ip: string, userAgent: string): Promise<void> {
    // 1. Lấy dữ liệu phiên làm việc từ Redis
    const sessionStr = await this.redis.get(`verify-account:session:${token}`);
    if (!sessionStr) {
      // 1. Phiên làm việc không tồn tại hoặc đã hết hạn
      throw AppError.from(new Error('Invalid or expired token'), 400);
    }

    // 2. Lấy thông tin email từ phiên làm việc
    const sessionData = JSON.parse(sessionStr) as { email: string; purpose: string; status: string; createdAt: Date };
    
    // 3. Lấy mã OTP băm từ Redis
    const otpStr = await this.redis.get(`verify-account:${token}`);

    if (!otpStr) {
      // 3. Mã OTP không tồn tại hoặc đã hết hạn
      await this.userOtpRepo.logOTPAttempt({
        identifier: sessionData.email,
        type: 'VERIFY_ACCOUNT',
        action: 'VERIFY_ACCOUNT_FAILED_OTP_EXPIRED',
        success: false,
        ip: ip,
        userAgent: userAgent,
        metaData: { reason: 'OTP expired' }
      });
      throw AppError.from(new Error('OTP expired. Please request a new one.'), 400);
    }

    const otpData = JSON.parse(otpStr) as { email: string; otp: string };

    // 4. So sánh mã OTP
    const isMatch = await bcrypt.compare(otp, otpData.otp);
    if (!isMatch) {
      // 4. Mã OTP không khớp
      await this.userOtpRepo.logOTPAttempt({
        identifier: sessionData.email,
        type: 'VERIFY_ACCOUNT',
        action: 'VERIFY_ACCOUNT_FAILED_INVALID_OTP',
        success: false,
        ip: ip,
        userAgent: userAgent,
        metaData: { reason: 'Invalid OTP' }
      });

      throw AppError.from(new Error('Invalid OTP'), 400);
    }

    // 5. Cập nhật trạng thái người dùng thành ACTIVE
    const user = await this.userRepo.findByCond({ email: sessionData.email });

    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    await this.userRepo.update(user.id, { status: UserStatus.ACTIVE });

    // 6. Xóa phiên làm việc và mã OTP khỏi Redis
    await this.redis.del(`verify-account:session:${token}`);
    await this.redis.del(`verify-account:${token}`);
    await this.redis.del(`verify-account:rate:${token}`);

    // 7. Phát hành sự kiện xác minh tài khoản thành công
    await this.eventPublisher.publish(UserVerifyEvent.create({userId: user.id, email: user.email, username: user.username}, user.id));
    
    // 8. Lưu log xác minh tài khoản thành công
    await this.userOtpRepo.logOTPAttempt({
      identifier: user.email,
      type: 'VERIFY_ACCOUNT',
      action: 'VERIFY_ACCOUNT_SUCCESS',
      success: true,
      ip: ip,
      userAgent: userAgent,
      metaData: { email: user.email, username: user.username }
    });
  }

  // Phương thức đăng nhập
  async login(dto: UserLoginDTO, ip: string, userAgent: string): Promise<UserAuthDTO> {
    const data = userLoginDTOSchema.parse(dto);

    // 1. Tìm người dùng theo email hoặc username
    const user = await this.userRepo.findByCondOr({ username: data.username, email: data.username }); 

    if (!user) {
      throw AppError.from(ErrUserNotFound, 404); // Không tìm thấy người dùng
    }

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(`${data.password}.${user.salt}`, user.password);
    if (!isMatch) {
      // Lưu log đăng nhập thất bại
      await this.userAuditRepo.logUserAudit({
        userId: user.id,
        action: 'LOGIN_FAILED_INVALID_PASSWORD',
        success: false,
        ip,
        userAgent,
        metaData: { reason: 'Invalid password' }
      });

      throw AppError.from(ErrUserNotFound, 404); // Không tìm thấy người dùng
    }

    // 3. Kiểm tra trạng thái người dùng
    if (user.status === UserStatus.PENDING) {
      // Lưu log đăng nhập thất bại do tài khoản chưa được kích hoạt
      await this.userAuditRepo.logUserAudit({
        userId: user.id,
        action: 'LOGIN_FAILED_USER_PENDING',
        success: false,
        ip,
        userAgent,
        metaData: { reason: 'User account pending activation' }
      });

      throw AppError.from(ErrUserPending, 403);
    }
    
    if (user.status === UserStatus.INACTIVE) {
      // Lưu log đăng nhập thất bại do tài khoản bị vô hiệu hóa
      await this.userAuditRepo.logUserAudit({
        userId: user.id,
        action: 'LOGIN_FAILED_USER_INACTIVE',
        success: false,
        ip,
        userAgent,
        metaData: { reason: 'User account inactive' }
      });

      throw AppError.from(ErrUserInactive, 403);
    }

    if (user.status === UserStatus.BANNED) {
      // Lưu log đăng nhập thất bại do tài khoản bị cấm
      await this.userAuditRepo.logUserAudit({
        userId: user.id,
        action: 'LOGIN_FAILED_USER_BANNED',
        success: false,
        ip,
        userAgent,
        metaData: { reason: 'User account banned' }
      });

      throw AppError.from(ErrUserBanned, 403);
    }

    // 4. Tạo access token và refresh token
    const role = user.role as UserRole;
    const accessToken = await this.accessTokenProvider.generateToken({ sub: user.id, role: role });
    const refreshToken = await this.refreshTokenProvider.generateToken({ sub: user.id, type: 'refresh', jti: v7() });

    // Lưu log đăng nhập thành công
    await this.userAuditRepo.logUserAudit({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      success: true,
      ip,
      userAgent,
      metaData: { email: user.email, username: user.username }
    });

    // 5. Trả về dữ liệu xác thực
    return {
      accessToken,
      refreshToken,
    };
  }

  // Phương thức đăng nhập bằng Google
  async googleLogin(idToken: string, ip: string, userAgent: string): Promise<UserAuthDTO> {
    return {
      accessToken: '',
      refreshToken: '',
    }
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

  // Phương thức cập nhật mật khẩu người dùng
  async updatePassword(requester: Requester, userId: string, dto: UserChangePasswordDTO, ip?: string, userAgent?: string): Promise<void> {
    // 1. Kiểm tra dữ liệu cập nhật mật khẩu
    const data = userChangePasswordDTOSchema.parse(dto);

    // 2. Kiểm tra nếu người dùng tồn tại
    const user = await this.userRepo.get(userId);
    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    // 3. Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(`${data.oldPassword}.${user.salt}`, user.password);
    if (!isMatch) {
      // Lưu log cập nhật mật khẩu thất bại do mật khẩu cũ không đúng
      await this.userAuditRepo.logUserAudit({
        userId: userId,
        action: 'CHANGE_PASSWORD_FAILED_INVALID_OLD_PASSWORD',
        success: false,
        ip,
        userAgent,
        metaData: { reason: 'Invalid old password' }
      });

      throw AppError.from(ErrUserNotFound, 404); // Không tìm thấy người dùng
    }

    // 4. Tạo salt và hash mật khẩu mới
    const salt = bcrypt.genSaltSync(8);
    const hashPassword = bcrypt.hash(`${data.newPassword}.${salt}`, 10);

    // 5. Cập nhật mật khẩu mới cho người dùng
    await this.userRepo.update(userId, { password: hashPassword, salt: salt });

    // 6. Phát hành sự kiện hoàn tất thay đổi mật khẩu
    await this.eventPublisher.publish(UserCompleteChangePasswordEvent.create({userId: userId, email: user.email, username: user.username}, requester.sub)); // Phát hành sự kiện hoàn tất thay đổi mật khẩu
    
    // Lưu log cập nhật mật khẩu thành công
    await this.userAuditRepo.logUserAudit({
      userId: userId,
      action: 'CHANGE_PASSWORD_SUCCESS',
      success: true,
      ip,
      userAgent,
      metaData: {}
    });

  }

  // Phương thức xử lý quên mật khẩu
  async forgotPassword(email: string, ip?: string, userAgent?: string): Promise<void> {
    // 1. Kiểm tra nếu người dùng tồn tại
    const user = await this.userRepo.findByCond({ email });
    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    // Lưu log yêu cầu quên mật khẩu
    await this.userAuditRepo.logUserAudit({
      userId: user.id,
      action: 'FORGOT_PASSWORD_REQUESTED',
      success: true,
      ip: ip,
      userAgent: userAgent,
      metaData: { email: email }
    });
  }

  // Phương thức tạo mã OTP để đặt lại mật khẩu
  async genarateOTPForgotPassword(email: string, ip?: string, userAgent?: string): Promise<{sessionId: string, expiry: number} | null> {
    // 1. Kiểm tra nếu người dùng tồn tại
    const user = await this.userRepo.findByCond({ email });
    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    // 2. Tạo và gửi mã OTP (6 chữ số) đến email người dùng
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const hash = bcrypt.hashSync(otp, 10);

    // 3. Tạo phiên làm việc với token
    const token = v7();

    // 4. Lưu phiên làm việc vào Redis với thời gian hết hạn
    await this.redis.set(`forgot-password:session:${token}`, JSON.stringify({ email: email, purpose: 'forgot-password', status: 'OTP_PENDING', createdAt: new Date() }), 60 * 60 ) // 60 phút

    // 5. Lưu mã OTP băm vào Redis với thời gian hết hạn
    await this.redis.set(`forgot-password:${token}`, JSON.stringify({ email: email, otp: hash, createdAt: new Date() }), 5 * 60 ) // 5 phút

    // 6. Lưu rate limit vào Redis với thời gian hết hạn
    await this.redis.set(`forgot-password:rate:${token}`, JSON.stringify({ count: 1}), 60 * 10 ) // chỉ được gửi 5 email trong 10 phút

    // 7. Bắn RabbitMQ qua MailService để gửi email chứa mã OTP
    await this.eventPublisher.publish(UserForgotPasswordEvent.create({userId: user.id, email: email, username: user.username, otp: otp}, user.id));

    // Lưu log gửi mã OTP đặt lại mật khẩu thành công
    await this.userOtpRepo.logOTPAttempt({
      identifier: user.email,
      type: 'FORGOT_PASSWORD',
      action: 'FORGOT_PASSWORD_OTP_SENT_SUCCESS',
      success: true,
      ip: ip,
      userAgent: userAgent,
      metaData: { email: user.email, username: user.username }
    });

    // 8. Trả về token và thời gian hết hạn
    return { sessionId: token, expiry: Date.now() + 60 * 60 * 1000 }; // 60 phút
  }

  // Phương thức gửi lại mã OTP đặt lại mật khẩu
  async resendForgotPasswordOTP(token: string, ip?: string, userAgent?: string): Promise<void> {
    // 1. Kiểm tra nếu người dùng tồn tại
    const sessionStr = await this.redis.get(`forgot-password:session:${token}`);
    if (!sessionStr) {
      // Lưu log gửi lại OTP đặt lại mật khẩu thất bại do token không hợp lệ hoặc đã hết hạn
      await this.userOtpRepo.logOTPAttempt({
        identifier: 'unknown',
        type: 'FORGOT_PASSWORD',
        action: 'FORGOT_PASSWORD_OTP_RESEND_FAILED_INVALID_TOKEN',
        success: false,
        ip: ip,
        userAgent: userAgent,
        metaData: { reason: 'Invalid or expired token' }
      });
      throw AppError.from(new Error('Invalid or expired token'), 400);
    }

    // 2. Kiểm tra mã OTP cũ còn hiệu lực không và xóa nó nếu có
    const oldOtpStr = await this.redis.get(`forgot-password:${token}`);
    if (oldOtpStr) {
      // kiểm tra xem OTP đã qua 1 phút chưa, nếu chưa thì không cho gửi lại
      const oldOtpData = JSON.parse(oldOtpStr) as { email: string; otp: string, createdAt: Date };
      const now = new Date();
      const createdAt = new Date(oldOtpData.createdAt);
      const diff = (now.getTime() - createdAt.getTime()) / 1000;
      if (diff < 60) {
        // Lưu log gửi lại OTP đặt lại mật khẩu quá nhanh
        await this.userOtpRepo.logOTPAttempt({
          identifier: oldOtpData.email,
          type: 'FORGOT_PASSWORD',
          action: 'FORGOT_PASSWORD_OTP_RESEND_FAILED_TOO_MANY_REQUESTS',
          success: false,
          ip: ip,
          userAgent: userAgent,
          metaData: { reason: 'Too many requests' }
        });
        
        throw AppError.from(new Error('Please wait before requesting a new OTP'), 400);
      }
      await this.redis.del(`forgot-password:${token}`);
    }

    // 3. Lấy thông tin email từ phiên làm việc
    const sessionData = JSON.parse(sessionStr) as { email: string; purpose: string; status: string; createdAt: Date };

    // 4. Lấy người dùng từ cơ sở dữ liệu
    const user = await this.userRepo.findByCond({ email: sessionData.email });
    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    // 5. Kiểm tra rate limit
    const rateStr = await this.redis.get(`forgot-password:rate:${token}`);
    let rateData = { count: 0 };

    if (rateStr) {
      rateData = JSON.parse(rateStr);
      if (rateData.count > 5) {
        // Lưu log gửi lại OTP đặt lại mật khẩu thất bại do vượt quá giới hạn
        await this.userOtpRepo.logOTPAttempt({
          identifier: sessionData.email,
          type: 'FORGOT_PASSWORD',
          action: 'FORGOT_PASSWORD_OTP_RESEND_FAILED_TOO_MANY_REQUESTS',
          success: false,
          ip: ip,
          userAgent: userAgent,
          metaData: {}
        });
        throw AppError.from(new Error('Too many requests. Please try again later.'), 429);
      }
      rateData.count += 1;
    } else {
      rateData.count = 1;
    }

    await this.redis.update(`forgot-password:rate:${token}`, JSON.stringify(rateData)); // Cập nhật giá trị rate limit còn thời gian sống không đổi

    // 6 Kiểm tra mục đích của phiên làm việc
    if (sessionData.purpose !== 'forgot-password') {
      throw AppError.from(new Error('Invalid session purpose'), 400);
    }

    // 7. Kiểm tra trạng thái phiên làm việc
    if (sessionData.status !== 'OTP_PENDING') {
      throw AppError.from(new Error('OTP already verified or invalid session'), 400);
    }

    // 8. Tạo và gửi mã OTP (6 chữ số) đến email người dùng
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = bcrypt.hashSync(otp, 10);

    // 9. Lưu mã OTP băm vào Redis với thời gian hết hạn
    await this.redis.set(`forgot-password:${token}`, JSON.stringify({ email: sessionData.email, otp: hash, createdAt: new Date() }), 5 * 60 ) // 5 phút

    // 10. Bắn RabbitMQ qua MailService để gửi email chứa mã OTP
    await this.eventPublisher.publish(UserForgotPasswordEvent.create({userId: user.id, email: sessionData.email, username: user.username, otp: otp}, user.id));
    
    // 11. Lưu log gửi lại mã OTP đặt lại mật khẩu thành công
    await this.userOtpRepo.logOTPAttempt({
      identifier: user.email,
      type: 'FORGOT_PASSWORD',
      action: 'FORGOT_PASSWORD_OTP_RESEND_SUCCESS',
      success: true, 
      ip: ip,
      userAgent: userAgent,
      metaData: { email: user.email, username: user.username }
    });
  }

  // Phương thức xác minh token đặt lại mật khẩu
  async verifyResetPasswordToken(token: string, otp: string, ip: string | undefined, userAgent: string | undefined): Promise<void> {
    // 1. Lấy dữ liệu phiên làm việc từ Redis
    const sessionStr = await this.redis.get(`forgot-password:session:${token}`);

    if (!sessionStr) {
      throw AppError.from(new Error('Invalid or expired token'), 400);
    }

    // 2. Lấy thông tin email từ phiên làm việc
    const sessionData = JSON.parse(sessionStr) as { email: string; purpose: string; status: string; createdAt: Date };

    // 3. Lấy thông tin User từ cơ sở dữ liệu
    const user = await this.userRepo.findByCond({ email: sessionData.email });
    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    // 4. Lấy mã OTP băm từ Redis
    const otpStr = await this.redis.get(`forgot-password:${token}`);
    if (!otpStr) {
      // Lưu log xác minh token đặt lại mật khẩu thất bại do OTP hết hạn
      await this.userOtpRepo.logOTPAttempt({
        identifier: sessionData.email,
        type: 'FORGOT_PASSWORD',
        action: 'FORGOT_PASSWORD_VERIFY_TOKEN_FAILED_OTP_EXPIRED',
        success: false,
        ip: ip,
        userAgent: userAgent,
        metaData: { reason: 'OTP expired' }
      });
      throw AppError.from(new Error('OTP expired. Please request a new one.'), 400);
    }

    // 5. So sánh mã OTP
    const otpData = JSON.parse(otpStr) as { email: string; otp: string };
    const isMatch = await bcrypt.compare(otp, otpData.otp);
    if (!isMatch) {
      // Lưu log xác minh token đặt lại mật khẩu thất bại do OTP không hợp lệ
      await this.userOtpRepo.logOTPAttempt({
        identifier: sessionData.email,
        type: 'FORGOT_PASSWORD',
        action: 'FORGOT_PASSWORD_VERIFY_TOKEN_FAILED_INVALID_OTP',
        success: false,
        ip: ip,
        userAgent: userAgent,
        metaData: { reason: 'Invalid OTP' }
      });
      throw AppError.from(new Error('Invalid OTP'), 400);
    }

    // 6. Xóa phiên làm việc và mã OTP khỏi Redis
    await this.redis.del(`forgot-password:session:${token}`);
    await this.redis.del(`forgot-password:${token}`);
    await this.redis.del(`forgot-password:rate:${token}`);

    // 7. Tạo phiên đặt lại mật khẩu và lưu vào Redis
    await this.redis.set(`reset-password:${token}`, sessionData.email, 15 * 60); // 15 phút  
    
    // Lưu log xác minh token đặt lại mật khẩu thành công
    await this.userOtpRepo.logOTPAttempt({
      identifier: sessionData.email,
      type: 'FORGOT_PASSWORD',
      action: 'FORGOT_PASSWORD_VERIFY_TOKEN_SUCCESS',
      success: true,
      ip: ip,
      userAgent: userAgent,
      metaData: { email: sessionData.email }
    });
    
  }

  // Phương thức đặt lại mật khẩu bằng token
  async resetPassword(token: string, dto: UserResetPasswordDTO, ip: string | undefined, userAgent: string | undefined): Promise<void> {
    // 1. Lấy dữ liệu từ Redis bằng token
    const email = await this.redis.get(`reset-password:${token}`);
    if (!email) {
      throw AppError.from(new Error('Invalid or expired token'), 400);
    }

    // 2. Kiểm tra nếu người dùng tồn tại
    const user = await this.userRepo.findByCond({ email });
    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    // 3. Kiểm tra dữ liệu đặt lại mật khẩu
    const data = userResetPasswordDTOSchema.parse(dto);

    // 4. so sánh mật khẩu mới và xác nhận mật khẩu
    if (data.password !== data.confirmPassword) {
      // Lưu log đặt lại mật khẩu thất bại do mật khẩu và xác nhận mật khẩu không khớp
      await this.userAuditRepo.logUserAudit({
        userId: user.id,
        action: 'RESET_PASSWORD_FAILED_PASSWORD_MISMATCH',
        success: false,
        ip: ip,
        userAgent: userAgent,
        metaData: { reason: 'Password and confirm password do not match' }
      });
      throw AppError.from(new Error('Password and confirm password do not match'), 400);
    }

    // 5. Tạo salt và hash mật khẩu mới
    const salt = bcrypt.genSaltSync(8);
    const hashPassword = bcrypt.hashSync(`${data.password}.${salt}`, 10);

    // 6. Cập nhật mật khẩu mới cho người dùng
    await this.userRepo.update(user.id, { password: hashPassword, salt: salt });

    // 7. Phát hành sự kiện hoàn tất đặt lại mật khẩu
    await this.eventPublisher.publish(UserCompleteChangePasswordEvent.create({userId: user.id, email: user.email, username: user.username}, user.id)); // Phát hành sự kiện hoàn tất đặt lại mật khẩu

    // 8. Xoá dữ liệu khỏi Redis
    await this.redis.del(`reset-password:${token}`);

    // Lưu log đặt lại mật khẩu thành công
    await this.userAuditRepo.logUserAudit({
      userId: user.id,
      action: 'RESET_PASSWORD_SUCCESS',
      success: true,
      ip: ip,
      userAgent: userAgent,
      metaData: { resetAt: new Date().toISOString() }
    });
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

  // Phương thức kiểm tra tính hợp lệ của access token
  async introspectAccessToken(token: string): Promise<AccessTokenPayload | null> {
    // 1. Xác minh access token
    const payload = await this.accessTokenProvider.verifyToken(token);

    // 2. Kiểm tra access token
    if (!payload) {
      throw AppError.from(ErrTokenInvalid, 401);
    }

    // 3. Kiểm tra xem token đã bị thu hồi chưa
    const isRevoked = await this.redis.get(`revoked-access-token:${token}`);
    if (isRevoked) {
      throw AppError.from(ErrTokenInvalid, 401);
    }

    // 4. Lấy thông tin người dùng
    const user = await this.userRepo.get(payload.sub);
    if (!user) {
      throw AppError.from(ErrNotFound, 404);
    }

    // 5. Kiểm tra trạng thái người dùng
    if (user.status === UserStatus.PENDING) {
      throw AppError.from(ErrUserPending, 403);
    }
    
    if (user.status === UserStatus.INACTIVE) {
      throw AppError.from(ErrUserInactive, 403);
    }

    if (user.status === UserStatus.BANNED) {
      throw AppError.from(ErrUserBanned, 403);
    }

    // 6. Trả về payload của access token
    return {
      sub: user.id,
      role: user.role as UserRole,
    }
  }

  // Phương thức kiểm tra tính hợp lệ của refresh token
  async introspectRefreshToken(token: string): Promise<RefreshTokenPayload | null> {

    // 1. Xác minh refresh token
    const payload = await this.refreshTokenProvider.verifyToken(token);

    // 2. Kiểm tra refresh token
    if (!payload) {
      throw AppError.from(ErrTokenInvalid, 401);
    }

    // 3. Kiểm tra xem token đã bị thu hồi chưa
    const isRevoked = await this.redis.get(`revoked-refresh-token:${payload.jti}`);
    if (isRevoked) {
      throw AppError.from(ErrTokenInvalid, 401);
    }

    // 4. Lấy thông tin người dùng
    const user = await this.userRepo.get(payload.sub);
    if (!user) {
      throw AppError.from(ErrNotFound, 404);
    }

    // 5. Kiểm tra trạng thái người dùng
    if (user.status === UserStatus.PENDING) {
      throw AppError.from(ErrUserPending, 403);
    }
    
    if (user.status === UserStatus.INACTIVE) {
      throw AppError.from(ErrUserInactive, 403);
    }

    if (user.status === UserStatus.BANNED) {
      throw AppError.from(ErrUserBanned, 403);
    }

    // 6. Trả về payload của refresh token
    return {
      sub: user.id,
      type: 'refresh',
      jti: payload.jti,
    }
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

  // Phương thức làm mới access token và refresh token
  async refreshToken(refreshToken: string): Promise<UserAuthDTO> {
    // 1. Xác minh refresh token
    const payload = await this.refreshTokenProvider.verifyToken(refreshToken);
    if (!payload) {
      throw AppError.from(ErrTokenInvalid, 401);
    }

    // 2 Kiểm tra xem token đã bị thu hồi chưa
    const isRevoked = await this.redis.get(`revoked-refresh-token:${payload.jti}`);
    if (isRevoked) {
      throw AppError.from(ErrTokenInvalid, 401);
    }

    // 4. Lấy thông tin người dùng
    const user = await this.userRepo.get(payload.sub);

    console.log('User fetched during refresh token:', user);

    if (!user) {
      throw AppError.from(ErrNotFound, 404);
    }

    // 5. Thu hồi refresh token hiện tại
    const ttl = 60 * 60 * 24 * 7; // 7 ngày
    await this.redis.set(`revoked-refresh-token:${payload.jti}`, 'revoked', ttl);

    // 6. Tạo access token và refresh token mới
    const role = user.role as UserRole;
    const newAccessToken = await this.accessTokenProvider.generateToken({ sub: user.id, role: role });
    const newRefreshToken = await this.refreshTokenProvider.generateToken({ sub: user.id, type: 'refresh', jti: v7() });
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // Phương thức đăng xuất người dùng
  async logout(accessToken: string, refreshToken: string, ip: string | undefined, userAgent: string | undefined): Promise<void> {
    // 1. Xác minh refresh token
    const payload = await this.refreshTokenProvider.verifyToken(refreshToken);
    if (!payload) {
      // 1. Nếu token không hợp lệ, ném lỗi
      await this.userAuditRepo.logUserAudit({
        userId: undefined,
        action: 'LOGOUT_FAILED_INVALID_REFRESH_TOKEN',
        success: false,
        ip,
        userAgent,
        metaData: { reason: 'Invalid refresh token' }
      });

      throw AppError.from(ErrTokenInvalid, 401);
    }

    // 2. Ghi vào Redis để đánh dấu token đã bị thu hồi
    const ttl = 60 * 60 * 24 * 7; // 7 ngày
    await this.redis.set(`revoked-refresh-token:${payload.jti}`, 'revoked', ttl);

    // 3. Ghi vào Redis để đánh dấu access token đã bị thu hồi
    const accessTokenPayload = await this.accessTokenProvider.verifyToken(accessToken);
    if (accessTokenPayload) {
      const exp = (accessTokenPayload as any).exp;
      const now = Math.floor(Date.now() / 1000);
      const accessTokenTtl = exp - now;
      if (accessTokenTtl > 0) {
        await this.redis.set(`revoked-access-token:${accessToken}`, 'revoked', accessTokenTtl);
      }
    }

    // 4. Lưu log đăng xuất thành công
    await this.userAuditRepo.logUserAudit({
      userId: payload.sub,
      action: 'LOGOUT_SUCCESS',
      success: true,
      ip,
      userAgent,
      metaData: { reason: 'User logged out successfully'}
    });
  }
}