import { Inject, Injectable } from "@nestjs/common";
import { CACHE_SERVICE, EVENT_PUBLISHER } from "src/share/di-token";
import type { IUserMongoAuditRepository, IUserMongoOtpRepository, IUserRepository } from "../ports/user.port";
import {Requester, AppError, type ICacheService, UserRole, type IAccessTokenProvider, type IRefreshTokenProvider,type IEventPublisher, AccessTokenPayload, ErrInvalidRequest, ErrTokenInvalid, ErrNotFound, RefreshTokenPayload, ErrForbidden, ErrUnauthorized } from "src/share";
import { ACCESS_TOKEN_PROVIDER, REFRESH_TOKEN_PROVIDER, USER_MONGO_AUDIT_REPOSITORY, USER_MONGO_OTP_REPOSITORY, USER_REPOSITORY } from "../user.di-token";
import { UserAuthDTO, UserChangePasswordDTO, userChangePasswordDTOSchema, UserLoginDTO, userLoginDTOSchema, UserRegistrationDTO, userRegistrationDTOSchema, UserResetPasswordDTO, userResetPasswordDTOSchema } from "../dtos/auth.dto";
import { v7 } from "uuid";
import bcrypt from "bcrypt";
import { ErrEmailAlreadyExists, ErrUserBanned, ErrUserInactive, ErrUsernameAlreadyExists, ErrUserNotFound, ErrUserPending, UserStatus } from "../models/user.model";
import { OAuth2Client } from "google-auth-library";
import { randomBytes } from "crypto";
import { UserCompleteChangePasswordEvent, UserCreatedEvent, UserForgotPasswordEvent, UserVerifyEvent } from "src/share/event";
import { IAuthService } from "../ports/auth.port";
// Lớp AuthService triển khai các phương thức xác thực người dùng
@Injectable()
export class AuthService implements IAuthService {
    private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
        @Inject(USER_MONGO_AUDIT_REPOSITORY) private readonly userAuditRepo: IUserMongoAuditRepository,
        @Inject(USER_MONGO_OTP_REPOSITORY) private readonly userOtpRepo: IUserMongoOtpRepository,
        @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
        @Inject(ACCESS_TOKEN_PROVIDER) private readonly accessTokenProvider: IAccessTokenProvider,
        @Inject(REFRESH_TOKEN_PROVIDER) private readonly refreshTokenProvider: IRefreshTokenProvider,
        @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
    ) {}

    // Phương thức đăng ký người dùng mới
    async register(dto: UserRegistrationDTO, ip: string, userAgent: string): Promise<string> {
        // 1. Kiểm tra dữ liệu đầu vào
        const data = userRegistrationDTOSchema.safeParse(dto);

        // 2. Kiểm tra xem email đã được sử dụng chưa
        const userEmail = await this.userRepo.findByCond({ email: dto.email });

        if (userEmail) {
            // Lưu log đăng ký thất bại
            await this.userAuditRepo.logUserAudit({
                action: 'REGISTER',
                success: false,
                ip,
                userAgent,
                userId: userEmail.id,
                metaData: {
                    reason: 'Email already exists'
                }
            });

            // Trả về lỗi 409 Conflict
            throw AppError.from(ErrEmailAlreadyExists, 409);
        }

        // 3. Kiểm tra xem username đã được sử dụng chưa
        const userUsername = await this.userRepo.findByCond({ username: dto.username });
        if (userUsername) {
            // Lưu log đăng ký thất bại
            await this.userAuditRepo.logUserAudit({
                action: 'REGISTER',
                success: false,
                ip,
                userAgent,
                userId: userUsername.id,
                metaData: {
                    reason: 'Username already exists'
                }
            });

            // Trả về lỗi 409 Conflict
            throw AppError.from(ErrUsernameAlreadyExists, 409);
        }

        // 3. Tạo salt và hash mật khẩu
        const salt = bcrypt.genSaltSync(8);
        const hashPassword = bcrypt.hashSync(`${dto.password}.${salt}`, 10);

        // 4. Tạo người dùng mới
        const newId = v7();
        const newUser = {
            id: newId,
            username: dto.username,
            email: dto.email,
            fullName: dto.fullName,
            birthday: dto.birthday,
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

        // 5. Lưu người dùng vào cơ sở dữ liệu
        await this.userRepo.insert(newUser);

        // Lưu log đăng ký thành công
        await this.userAuditRepo.logUserAudit({
            userId: newId,
            action: 'REGISTER',
            success: true,
            ip,
            userAgent,
            metaData: {
                reason: 'Registration successful'
            }
        });

        // 6. 

        return dto.email;

    }
    // Phương thức đăng nhập
    async login(dto: UserLoginDTO, ip: string, userAgent: string): Promise<UserAuthDTO> {
        // 1. Kiểm tra dữ liệu đầu vào
        const data = userLoginDTOSchema.parse(dto);

        // 2. Tìm người dùng theo username hoặc email
        const user = await this.userRepo.findByCondOr({ username: data.username, email: data.username });

        if (!user) {
            // Trả về lỗi 401 Unauthorized
            throw AppError.from(ErrInvalidRequest, 401);
        }

        // 3. Kiểm tra mật khẩu
        const isMatch = bcrypt.compare(`${data.password}.${user.salt}`, user.password);

        if (!isMatch) {
            // Lưu log đăng nhập thất bại
            await this.userAuditRepo.logUserAudit({
                userId: user.id,
                action: 'LOGIN',
                success: false,
                ip,
                userAgent,
                metaData: {
                    reason: 'Invalid password'
                }
            });

            // Trả về lỗi 401 Unauthorized
            throw AppError.from(ErrInvalidRequest, 401);
        }

        // 4. Kiểm tra trạng thái người dùng
        if (user.status === UserStatus.PENDING) {
            // Lưu log đăng nhập thất bại
            await this.userAuditRepo.logUserAudit({
                userId: user.id,
                action: 'LOGIN',
                success: false,
                ip,
                userAgent,
                metaData: {
                    reason: 'Account not activated'
                }
            });

            // Trả về lỗi 403 Forbidden
            throw AppError.from(ErrForbidden, 403);
        }

        if (user.status === UserStatus.BANNED) {
            // Lưu log đăng nhập thất bại
            await this.userAuditRepo.logUserAudit({
                userId: user.id,
                action: 'LOGIN',
                success: false,
                ip,
                userAgent,
                metaData: {
                    reason: 'Account is banned'
                }
            });
            // Trả về lỗi 403 Forbidden
            throw AppError.from(ErrForbidden, 403);
        }

        if (user.status === UserStatus.INACTIVE) {
            // Lưu log đăng nhập thất bại
            await this.userAuditRepo.logUserAudit({
                userId: user.id,
                action: 'LOGIN',
                success: false, 
                ip,
                userAgent,
                metaData: {
                    reason: 'Account is inactive'
                }
            });
            // Trả về lỗi 403 Forbidden
            throw AppError.from(ErrForbidden, 403);
        }

        // 5. Tạo access token và refresh token
        const role = user.role as UserRole;
        const accessToken = await this.accessTokenProvider.generateToken({ sub: user.id, role });
        const refreshToken = await this.refreshTokenProvider.generateToken({ sub: user.id, type: 'refresh', jti: v7() });

        // Lưu log đăng nhập thành công
        await this.userAuditRepo.logUserAudit({
            userId: user.id,
            action: 'LOGIN',
            success: true,
            ip,
            userAgent,
            metaData: {
                reason: 'Login successful'
            }
        });

        // 6. Trả về access token và refresh token
        return {
            accessToken,
            refreshToken,   
        };
    }

    // Phương thức đăng nhập bằng google
    async googleLogin(idToken: string, ip: string, userAgent: string): Promise<UserAuthDTO> {
        // 1. Kiểm tra idToken
        if (!idToken) {
            throw AppError.from(ErrInvalidRequest, 400);
        }

        // 2. Xác thực idToken với Google
        const ticket = await this.client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        // 3. Lấy thông tin người dùng từ idToken
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw AppError.from(ErrInvalidRequest, 400);
        }

        // 4. Kiểm tra xem người dùng đã tồn tại trong hệ thống chưa
        let user = await this.userRepo.findByCond({ email: payload.email });
        
        if (!user) {
            const passwordDefault = randomBytes(16).toString('hex');
            
            const salt = bcrypt.genSaltSync(8);
            const hashPassword = bcrypt.hashSync(`${passwordDefault}.${salt}`, 10);

            // birthday để mặt đinh là ngày hiện tại
            const birthDay = new Date();
            // Nếu chưa tồn tại, tạo người dùng mới với trạng thái ACTIVE
            const newId = v7();
            const newUser = {
                id: newId,
                username: payload.email.split('@')[0],
                email: payload.email,
                fullName: payload.name || '',
                birthday: birthDay,
                salt: salt,
                password: hashPassword,
                role: UserRole.CUSTOMER,
                rankId: null,
                mongoUserId: null,
                currentPoints: 0,
                status: UserStatus.ACTIVE,
                fcmToken: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await this.userRepo.insert(newUser);

            // Gửi sự kiện người dùng được tạo mới
            await this.eventPublisher.publish(UserVerifyEvent.create({userId: newId, email: payload.email, username: newUser.username}, newId));

            // Gán user mới tạo cho biến user để tiếp tục đăng nhập
            user = newUser;
        }

        // 5. Tạo access token và refresh token
        const role = user.role as UserRole;
        const accessToken = await this.accessTokenProvider.generateToken({ sub: user.id, role });
        const refreshToken = await this.refreshTokenProvider.generateToken({ sub: user.id, type: 'refresh', jti: v7() });

        // Lưu log đăng nhập thành công
        await this.userAuditRepo.logUserAudit({
            userId: user.id,
            action: 'GOOGLE_LOGIN',
            success: true,
            ip,
            userAgent,
            metaData: {
                reason: 'Google login successful'
            }
        });

        // 6. Trả về access token và refresh token
        return {
            accessToken,
            refreshToken,   
        };
    }

    // Phương thức đăng xuất
    async logout(accessToken: string, refreshToken: string, ip: string | undefined, userAgent: string | undefined): Promise<void> {
        // 1. xác minh accessToken
        const accessTokenPayload = await this.accessTokenProvider.verifyToken(accessToken);
        if (!accessTokenPayload) {
            // Trả về lỗi 401 Unauthorized
            throw AppError.from(ErrTokenInvalid, 401);
        }

        // 2. xác minh refreshToken
        const refreshTokenPayload = await this.refreshTokenProvider.verifyToken(refreshToken);
        if (!refreshTokenPayload) {
            // Trả về lỗi 401 Unauthorized
            throw AppError.from(ErrTokenInvalid, 401);
        }

        // 4. Lưu vào redis để đánh dấu token đã bị thu hồi
        const expiryAccess = (accessTokenPayload as any).exp;
        const nowAccess = Math.floor(Date.now() / 1000);
        const ttlAccess = expiryAccess - nowAccess;
        if (ttlAccess > 0) {
            await this.cacheService.set(`revoked_access_token:${accessToken}`, 'revoked', ttlAccess);
        }
        const expiryRefresh = (refreshTokenPayload as any).exp;
        const nowRefresh = Math.floor(Date.now() / 1000);
        const ttlRefresh = expiryRefresh - nowRefresh;
        if (ttlRefresh > 0) {
            await this.cacheService.set(`revoked_refresh_token:${refreshToken}`, 'revoked', ttlRefresh);
        }

        // 5. Lưu log đăng xuất thành công
        await this.userAuditRepo.logUserAudit({
            userId: accessTokenPayload.sub,
            action: 'LOGOUT',
            success: true,
            ip,
            userAgent,
            metaData: {
                reason: 'Logout successful'
            }
        }); 
    }

    // Phương thức làm mới token
    async refreshToken(refreshToken: string): Promise<UserAuthDTO> {
        // 1. Xác minh refreshToken
        const payload = await this.refreshTokenProvider.verifyToken(refreshToken);
        if (!payload) {
            // Trả về lỗi 401 Unauthorized
            throw AppError.from(ErrUnauthorized, 401);
        }

        // 2. Kiểm tra xem token đã bị thu hồi chưa
        const isRevoked = await this.cacheService.get(`revoked_refresh_token:${refreshToken}`);
        if (isRevoked) {
            // Trả về lỗi 401 Unauthorized
            throw AppError.from(ErrUnauthorized, 401);
        }

        // 3. Lấy thông tin người dùng
        const user = await this.userRepo.get(payload.sub);

        if (!user) {
            // Trả về lỗi 404 Not Found
            throw AppError.from(ErrUserNotFound, 404);
        }

        // 5. Thu hồi refresh token hiện tại
        const expiryRefresh = (payload as any).exp;
        const nowRefresh = Math.floor(Date.now() / 1000);
        const ttlRefresh = expiryRefresh - nowRefresh;
        await this.cacheService.set(`revoked_refresh_token:${refreshToken}`, 'revoked', ttlRefresh);
        
        // 6. Tạo access token và refresh token mới
        const role = user.role as UserRole;
        const newAccessToken = await this.accessTokenProvider.generateToken({ sub: user.id, role });
        const newRefreshToken = await this.refreshTokenProvider.generateToken({ sub: user.id, type: 'refresh', jti: v7() });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        }
    }

    // Phương thức kiểm tra access token
    async introspectAccessToken(token: string): Promise<AccessTokenPayload | null> {
        // 1. Xác minh token
        const payload = await this.accessTokenProvider.verifyToken(token);

        // 2. Kiểm tra access token 
        if (!payload) {
            throw AppError.from(ErrTokenInvalid, 401);
        }

        // 3. Kiểm tra xem token đã bị thu hồi chưa
        const isRevoked = await this.cacheService.get(`revoked_access_token:${token}`);
        if (isRevoked) {
            throw AppError.from(ErrTokenInvalid, 401);
        }

        // 4. Lấy thông tin người dùng
        const user = await this.userRepo.get(payload.sub);
        if (!user) {
            throw AppError.from(ErrUserNotFound, 404);
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

        return {
            sub: user.id,
            role: user.role as UserRole,
        }
    }

    // Phương thức kiểm tra refresh token
    async introspectRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
        // 1. Xác minh token
        const payload = await this.refreshTokenProvider.verifyToken(token);
        // 2. Kiểm tra refresh token
        if (!payload) {
            throw AppError.from(ErrTokenInvalid, 401);
        }
        // 3. Kiểm tra xem token đã bị thu hồi chưa
        const isRevoked = await this.cacheService.get(`revoked_refresh_token:${token}`);
        if (isRevoked) {
            throw AppError.from(ErrTokenInvalid, 401);
        }

        // 4. Lấy thông tin người dùng
        const user = await this.userRepo.get(payload.sub);
        if (!user) {
            throw AppError.from(ErrUserNotFound, 404);
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

        return {
            sub: user.id,
            type: 'refresh',
            jti: payload.jti,
        };
    }

    // Phương thức yêu cầu tạo phiên làm việc kích hoạt tài khoản
    async activateAccount(email: string, ip: string, userAgent: string): Promise<void> {
        // 1. Kiểm tra người dùng theo email
        const user = await this.userRepo.findByCond({ email });
        if (!user) {
            // Trả về lỗi 404 Not Found
            throw AppError.from(ErrUserNotFound, 404);
        }

        // 2. Kiểm tra trạng thái người dùng
        if (user.status !== UserStatus.PENDING) {
            await this.userAuditRepo.logUserAudit({
                userId: user.id,
                action: 'ACTIVATE_ACCOUNT',
                success: false,
                ip,
                userAgent,
                metaData: {
                    reason: 'Account is not in PENDING status'
                }
            });
            // Trả về lỗi 400 Bad Request
            throw AppError.from(ErrInvalidRequest, 400);
        }

        // 3. Lưu log yêu cầu kích hoạt tài khoản
        await this.userAuditRepo.logUserAudit({
            userId: user.id,
            action: 'ACTIVATE_ACCOUNT',
            success: true,
            ip,
            userAgent,
            metaData: {
                reason: 'Activation request successful'
            }
        });
    }

    // Phương thức tạo mã OTP để xác minh tài khoản
    async genarateOTPAccount(email: string, ip: string, userAgent: string): Promise<{sessionId: string, expiry: number} | null> {
        // 1. Kiểm tra người dùng theo email
        const user = await this.userRepo.findByCond({ email });
        if (!user) {
            throw AppError.from(ErrUserNotFound, 404);
        }

        // 2. Tạo và gửi mã OTP qua email
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Mã OTP 6 chữ số

        const hash = bcrypt.hashSync(otp, 10);

        // 3. Tạo phiên làm việc với token
        const token = v7();

        // 4. Lưu phiên làm việc vào Redis với thời gian hết hạn
        await this.cacheService.set(`verify-account:session:${token}`, JSON.stringify({ email: email, purpose: 'verify-account', status: 'OTP_PENDING', createdAt: new Date() }), 60 * 60 ) // 60 phút

        // 5. Lưu mã OTP băm vào Redis với thời gian hết hạn
        await this.cacheService.set(`verify-account:${token}`, JSON.stringify({ email: email, otp: hash, createdAt: new Date() }), 5 * 60 ) // 5 phút

        // 6. Lưu rate limit vào Redis với thời gian hết hạn
        await this.cacheService.set(`verify-account:rate:${token}`, JSON.stringify({ count: 1}), 10 * 60 ) // chỉ được gửi 5 email trong 10 phút

        // 7. Bắn RabitMQ qua MailService để gửi email OTP
        await this.eventPublisher.publish(UserCreatedEvent.create({userId: user.id, email: email, username: user.username, otp: otp}, user.id));
        
        // Lưu log tạo mã OTP thành công
        await this.userOtpRepo.logOTPAttempt({
            identifier: email,
            type: 'verify-account',
            action: 'GENERATE_OTP_ACCOUNT_SUCCESS',
            success: true,
            ip,
            userAgent,
            metaData: {
                email: email,
                username: user.username,
            }
        });

        return {
            sessionId: token,
            expiry: Date.now() + 60 * 60 * 1000, // 60 phút
        }
    }

    // Phương thức yêu cầu gửi lại mã OTP xác minh tài khoản
    async resendVerifyAccount(token: string, ip: string, userAgent: string): Promise<void> {
        // 1. Lấy phiên làm việc từ Redis  
        const sessionData = await this.cacheService.get(`verify-account:session:${token}`);
        if (!sessionData) {
            throw AppError.from(ErrInvalidRequest, 400);
        }

        const session = JSON.parse(sessionData);

        // 2. Lấy thông tin email từ phiên làm việc
        const email = session.email;

        // 3. Lấy người dùng theo email
        const user = await this.userRepo.findByCond({ email: email });

        if (!user) {
            throw AppError.from(ErrUserNotFound, 404);
        }

        // 4. Kiểm tra trạng thái người dùng
        if (user.status !== UserStatus.PENDING) {
            await this.userAuditRepo.logUserAudit({
                userId: user.id,
                action: 'RESEND_VERIFY_ACCOUNT',
                success: false,
                ip,
                userAgent,
                metaData: {
                    reason: 'Account is not in PENDING status'
                }
            });

            throw AppError.from(ErrInvalidRequest, 400);
        }

        // 5. Kiểm tra mục đích của phiên làm việc
        if (session.purpose !== 'verify-account') {
            throw AppError.from(ErrInvalidRequest, 400);
        }

        // 6. Kiểm tra trạng thái phiên làm việc
        if (session.status !== 'OTP_PENDING') {
            throw AppError.from(ErrInvalidRequest, 400);
        }

        // 7. Kiểm tra rate limit
        const rateStr = await this.cacheService.get(`verify-account:rate:${token}`);
        let rateData = { count: 0 };
        if (rateStr) {
            rateData = JSON.parse(rateStr);
            if (rateData.count > 5) {
                // Lưu log gửi lại OTP thất bại do vượt quá giới hạn
                await this.userOtpRepo.logOTPAttempt({
                    identifier: email,
                    type: 'verify-account',
                    action: 'RESEND_OTP_ACCOUNT_RATE_LIMIT',
                    success: false,
                    ip,
                    userAgent,
                    metaData: {
                        email: email,
                        username: user.username,
                    }
                });
                throw AppError.from(new Error('OTP resend limit exceeded. Please try again later.'), 429);
            }
            rateData.count += 1;
        } else {
            rateData.count = 1;
        }

        // 8. Kiểm tra mã OTP cũ còn hiệu lực không và xóa nếu có
        const oldOtpStr = await this.cacheService.get(`verify-account:${token}`);
        if (oldOtpStr) {
        // kiểm tra xem OTP đã qua 1 phút chưa, nếu chưa thì không cho gửi lại
        const oldOtpData = JSON.parse(oldOtpStr) as { email: string; otp: string, createdAt: Date };
        const now = new Date();
        const createdAt = new Date(oldOtpData.createdAt);
        const diff = (now.getTime() - createdAt.getTime()) / 1000;
        if (diff < 60) {
            // Lưu log gửi lại OTP quá nhanh
            await this.userOtpRepo.logOTPAttempt({
                identifier: email,
                type: 'verify-account',
                action: 'RESEND_OTP_ACCOUNT_RATE_LIMIT',
                success: false,
                ip,
                userAgent,
                metaData: {
                    email: email,
                    username: user.username,
                }
            });

            throw AppError.from(new Error('Please wait before requesting a new OTP'), 400);
        }

        await this.cacheService.del(`verify-account:${token}`);
        }

        // 9. Tạo và gửi mã OTP qua email
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Mã OTP 6 chữ số
        const hash = bcrypt.hashSync(otp, 10);

        // 10. Lưu mã OTP băm vào Redis với thời gian hết hạn
        await this.cacheService.set(`verify-account:${token}`, JSON.stringify({ email: email, otp: hash, createdAt: new Date() }), 5 * 60 ) // 5 phút

        // 11. Cập nhật rate limit vào Redis với thời gian hết hạn
        if (rateData.count === 1) {
            await this.cacheService.set(`verify-account:rate:${token}`, JSON.stringify(rateData), 10 * 60 ) // chỉ được gửi 5 email trong 10 phút
        } else {
            await this.cacheService.update(`verify-account:rate:${token}`, JSON.stringify(rateData)) // chỉ được gửi 5 email trong 10 phút
        }   

        // 12. Bắn RabitMQ qua MailService để gửi email OTP
        await this.eventPublisher.publish(UserCreatedEvent.create({userId: user.id, email: email, username: user.username, otp: otp}, user.id));

        // Lưu log gửi lại mã OTP thành công
        await this.userOtpRepo.logOTPAttempt({
            identifier: email,
            type: 'verify-account',
            action: 'RESEND_OTP_ACCOUNT_SUCCESS',
            success: true,
            ip,
            userAgent,
            metaData: {
                email: email,
                username: user.username,
            }
        });
    }

    // Phương thức xác minh tài khoản người dùng
    async verifyAccount(token: string, otp: string, ip: string, userAgent: string): Promise<void> {
        // 1. Lấy phiên làm việc từ Redis
        const sessionData = await this.cacheService.get(`verify-account:session:${token}`);
        if (!sessionData) {
            throw AppError.from(ErrInvalidRequest, 400);
        }

        // 2. Lấy thông tin email từ phiên làm việc
        const session = JSON.parse(sessionData) as { email: string; purpose: string; status: string; createdAt: Date };
        
        // 3. Lấy mã OTP băm từ Redis
        const otpDataStr = await this.cacheService.get(`verify-account:${token}`);

        if (!otpDataStr) {
            // Lưu log xác minh tài khoản thất bại do OTP không tồn tại hoặc đã hết hạn
            await this.userOtpRepo.logOTPAttempt({
                identifier: session.email,
                type: 'verify-account',
                action: 'VERIFY_ACCOUNT_OTP_NOT_FOUND',
                success: false,
                ip,
                userAgent,
                metaData: {
                    email: session.email,
                    reason: 'OTP not found or expired'
                }
            });

            throw AppError.from(ErrInvalidRequest, 400);
        }
         
        const otpData = JSON.parse(otpDataStr) as { email: string; otp: string };

        // 4. So sánh mã OTP
        const isMatch = bcrypt.compare(otp, otpData.otp);

        if (!isMatch) {
            // Lưu log xác minh tài khoản thất bại do OTP không đúng
            await this.userOtpRepo.logOTPAttempt({
                identifier: session.email,
                type: 'verify-account',
                action: 'VERIFY_ACCOUNT_OTP_INVALID',
                success: false, 
                ip,
                userAgent,
                metaData: {
                    email: session.email,
                    reason: 'Invalid OTP'
                }
            });
            throw AppError.from(ErrInvalidRequest, 400);
        }

        // 5. Cập nhật trạng thái người dùng thành ACTIVE
        const user = await this.userRepo.findByCond({ email: session.email });
        if (!user) {
            throw AppError.from(ErrUserNotFound, 404);
        }

        await this.userRepo.update(user.id, { status: UserStatus.ACTIVE });

        // 6. Xóa phiên làm việc và mã OTP khỏi Redis
        await this.cacheService.del(`verify-account:session:${token}`);
        await this.cacheService.del(`verify-account:${token}`);
        await this.cacheService.del(`verify-account:rate:${token}`);

        // 7. Lưu log xác minh tài khoản thành công
        await this.userOtpRepo.logOTPAttempt({
            identifier: session.email,
            type: 'verify-account',
            action: 'VERIFY_ACCOUNT_SUCCESS',
            success: true,
            ip,
            userAgent,
            metaData: {
                email: session.email,
                reason: 'Account verified successfully'
            }
        });

        // 8. Gửi sự kiện xác minh tài khoản
        await this.eventPublisher.publish(UserVerifyEvent.create({userId: user.id, email: session.email, username: user.username}, user.id));
    }

    // Phương thức yêu cầu tạo phiêm làm việc đặt lại mật khẩu
    async forgotPassword(email: string, ip: string, userAgent: string): Promise<void> {
        // 1. Kiểm tra người dùng theo email
        const user = await this.userRepo.findByCond({ email });
        if (!user) {
            throw AppError.from(ErrUserNotFound, 404);
        }

        // 2. Lưu log yêu cầu đặt lại mật khẩu
        await this.userAuditRepo.logUserAudit({
            userId: user.id,
            action: 'FORGOT_PASSWORD',
            success: true,
            ip,
            userAgent,
            metaData: {
                reason: 'Forgot password request successful'
            }
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
        await this.cacheService.set(`forgot-password:session:${token}`, JSON.stringify({ email: email, purpose: 'forgot-password', status: 'OTP_PENDING', createdAt: new Date() }), 60 * 60 ) // 60 phút

        // 5. Lưu mã OTP băm vào Redis với thời gian hết hạn
        await this.cacheService.set(`forgot-password:${token}`, JSON.stringify({ email: email, otp: hash, createdAt: new Date() }), 5 * 60 ) // 5 phút

        // 6. Lưu rate limit vào Redis với thời gian hết hạn
        await this.cacheService.set(`forgot-password:rate:${token}`, JSON.stringify({ count: 1}), 60 * 10 ) // chỉ được gửi 5 email trong 10 phút

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

    // Phương thức yêu cầu gửi lại mã OTP đặt lại mật khẩu
    async resendForgotPasswordOTP(token: string, ip?: string, userAgent?: string): Promise<void> {
        // 1. Lấy phiên làm việc từ Redis  
        const sessionData = await this.cacheService.get(`forgot-password:session:${token}`);
        if (!sessionData) {
            throw AppError.from(ErrInvalidRequest, 400);
        }

        const session = JSON.parse(sessionData);

        // 2. Lấy thông tin email từ phiên làm việc
        const email = session.email;

        // 3. Lấy người dùng theo email
        const user = await this.userRepo.findByCond({ email: email });
        if (!user) {
            throw AppError.from(ErrUserNotFound, 404);
        }

        // 4. Kiểm tra mục đích của phiên làm việc
        if (session.purpose !== 'forgot-password') {
            throw AppError.from(ErrInvalidRequest, 400);
        }

        // 5. Kiểm tra trạng thái phiên làm việc
        if (session.status !== 'OTP_PENDING') {
            throw AppError.from(ErrInvalidRequest, 400);
        }

        // 6. Kiểm tra rate limit
        const rateStr = await this.cacheService.get(`forgot-password:rate:${token}`);
        let rateData = { count: 0 };
        if (rateStr) {
            rateData = JSON.parse(rateStr);
            if (rateData.count > 5) {
                // Lưu log gửi lại OTP thất bại do vượt quá giới hạn
                await this.userOtpRepo.logOTPAttempt({
                    identifier: email,
                    type: 'FORGOT_PASSWORD',
                    action: 'FORGOT_PASSWORD_RESEND_OTP_RATE_LIMIT',
                    success: false,
                    ip,
                    userAgent,
                    metaData: {
                        email: email,
                        username: user.username,
                    }

                });
                throw AppError.from(new Error('OTP resend limit exceeded. Please try again later.'), 429);
            }

            rateData.count += 1;
        } else {
            rateData.count = 1;
        }

        // 8. Kiểm tra mã OTP cũ còn hiệu lực không và xóa nếu có
        const oldOtpStr = await this.cacheService.get(`forgot-password:${token}`);
        if (oldOtpStr) {
            // kiểm tra xem OTP đã qua 1 phút chưa, nếu chưa thì không cho gửi lại
            const oldOtpData = JSON.parse(oldOtpStr) as { email: string; otp: string, createdAt: Date };
            const now = new Date();
            const createdAt = new Date(oldOtpData.createdAt);
            const diff = (now.getTime() - createdAt.getTime()) / 1000;
            if (diff < 60) {
                // Lưu log gửi lại OTP quá nhanh
                await this.userOtpRepo.logOTPAttempt({
                    identifier: email,
                    type: 'FORGOT_PASSWORD',
                    action: 'FORGOT_PASSWORD_RESEND_OTP_RATE_LIMIT',
                    success: false,
                    ip,
                    userAgent,
                    metaData: {
                        email: email,
                        username: user.username,
                    }
                });
                throw AppError.from(new Error('Please wait before requesting a new OTP'), 400);
            }

            await this.cacheService.del(`forgot-password:${token}`);
        }

        // 9. Tạo và gửi mã OTP qua email
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Mã OTP 6 chữ số
        const hash = bcrypt.hashSync(otp, 10);

        // 10. Lưu mã OTP băm vào Redis với thời gian hết hạn
        await this.cacheService.set(`forgot-password:${token}`, JSON.stringify({ email: email, otp: hash, createdAt: new Date() }), 5 * 60 ) // 5 phút

        // 11. Cập nhật rate limit vào Redis với thời gian hết hạn
        if (rateData.count === 1) {
            await this.cacheService.set(`forgot-password:rate:${token}`, JSON.stringify(rateData), 60 * 10 ) // chỉ được gửi 5 email trong 10 phút
        } else {
            await this.cacheService.update(`forgot-password:rate:${token}`, JSON.stringify(rateData)) // chỉ được gửi 5 email trong 10 phút
        }

        // 12. Bắn RabbitMQ qua MailService để gửi email chứa mã OTP
        await this.eventPublisher.publish(UserForgotPasswordEvent.create({userId: user.id, email: email, username: user.username, otp: otp}, user.id));

        // Lưu log gửi lại mã OTP đặt lại mật khẩu thành công
        await this.userOtpRepo.logOTPAttempt({
            identifier: email,
            type: 'FORGOT_PASSWORD',
            action: 'FORGOT_PASSWORD_RESEND_OTP_SUCCESS',
            success: true,
            ip,
            userAgent,
            metaData: {
                email: email,
                username: user.username,
            }
        });
    }


    // Phương thức xác minh token đặt lại mật khẩu
    async verifyPasswordToken(token: string, otp: string, ip?: string, userAgent?: string): Promise<string> {
        // 1. Lấy phiên làm việc từ Redis
        const sessionData = await this.cacheService.get(`forgot-password:session:${token}`);
        if (!sessionData) {
            throw AppError.from(ErrInvalidRequest, 400);
        }

        // 2. Lấy thông tin email từ phiên làm việc
        const session = JSON.parse(sessionData) as { email: string; purpose: string; status: string; createdAt: Date };

        // 3. Lấy thông tin User theo email
        const user = await this.userRepo.findByCond({ email: session.email });
        if (!user) {
            throw AppError.from(ErrUserNotFound, 404);
        }

        // 4. Lấy mã OTP băm từ Redis
        const otpDataStr = await this.cacheService.get(`forgot-password:${token}`);
        if (!otpDataStr) {
            // Lưu log xác minh OTP đặt lại mật khẩu thất bại do OTP không tồn tại hoặc đã hết hạn
            await this.userOtpRepo.logOTPAttempt({
                identifier: session.email,
                type: 'FORGOT_PASSWORD',
                action: 'FORGOT_PASSWORD_OTP_NOT_FOUND',
                success: false,
                ip,
                userAgent,
                metaData: {
                    email: session.email,
                    reason: 'OTP not found or expired'
                }
            });
            throw AppError.from(ErrInvalidRequest, 400);
        }

        // 5. So sánh mã OTP
        const otpData = JSON.parse(otpDataStr) as { email: string; otp: string };
        const isMatch = bcrypt.compare(otp, otpData.otp);
        if (!isMatch) {
            // Lưu log xác minh OTP đặt lại mật khẩu thất bại do OTP không đúng
            await this.userOtpRepo.logOTPAttempt({
                identifier: session.email, 
                type: 'FORGOT_PASSWORD',    
                action: 'FORGOT_PASSWORD_OTP_INVALID',
                success: false,
                ip,
                userAgent,
                metaData: {
                    email: session.email,
                    reason: 'Invalid OTP'
                }
            });
            throw AppError.from(ErrInvalidRequest, 400);
        }

        // 6. Xóa phiên làm việc và mã OTP khỏi Redis
        await this.cacheService.del(`forgot-password:session:${token}`);
        await this.cacheService.del(`forgot-password:${token}`);
        await this.cacheService.del(`forgot-password:rate:${token}`);

        // 7. Tao phiên làm việc mới để đặt lại mật khẩu
        await this.cacheService.set(`reset-password:${token}`, sessionData.email, 15 * 60); // 15 phút  
        
        // 8. Lưu log xác minh OTP đặt lại mật khẩu thành công
        await this.userOtpRepo.logOTPAttempt({
            identifier: session.email,
            type: 'FORGOT_PASSWORD',
            action: 'FORGOT_PASSWORD_OTP_VERIFIED_SUCCESS',
            success: true,
            ip,
            userAgent,
            metaData: {
                email: session.email,
                reason: 'OTP verified successfully'
            }
        });

        return token;
    }

    // Phương thức đặt lại mật khẩu bằng token
    async resetPassword(token: string, dto: UserResetPasswordDTO, ip?: string, userAgent?: string): Promise<void> {
        // 1. Lấy dữ liệu từ Redis bằng token
        const email = await this.redis.get(`reset-password:${token}`);
        if (!email) {
            throw AppError.from(ErrInvalidRequest, 400);
        }

        // 2. Kiểm tra người dùng theo email
        const user = await this.userRepo.findByCond({ email: email });
        if (!user) {
            throw AppError.from(ErrUserNotFound, 404);
        }

        // 3. Kiểm tra dữ liệu đặt lại mật khẩu
        const data = userResetPasswordDTOSchema.parse(dto);

        // 4. so sánh mật khẩu mới và mật khẩu xác nhận
        if (data.newPassword !== data.confirmPassword) {
            // Lưu log đặt lại mật khẩu thất bại do mật khẩu mới và xác nhận không khớp
            await this.userAuditRepo.logUserAudit({
                userId: user.id,
                action: 'RESET_PASSWORD',
                success: false,
                ip,
                userAgent,
                metaData: {
                    reason: 'New password and confirm password do not match'
                }
            });

            throw AppError.from(new Error('New password and confirm password do not match'), 400);
        }

        // 5. Cập nhật mật khẩu mới cho người dùng
        const salt = bcrypt.genSaltSync(8);
        const hashPassword = bcrypt.hashSync(`${data.password}.${salt}`, 10);
        
        // 6. Cập nhật mật khẩu mới cho người dùng
        await this.userRepo.update(user.id, { password: hashPassword, salt: salt });

        // 7. Xóa phiên làm việc đặt lại mật khẩu khỏi Redis
        await this.redis.del(`reset-password:${token}`);

        // 8. Lưu log đặt lại mật khẩu thành công
        await this.userAuditRepo.logUserAudit({
            userId: user.id,
            action: 'RESET_PASSWORD',
            success: true,
            ip,
            userAgent,
            metaData: {
                reason: 'Password reset successful'
            }
        });

        // 9. Gửi sự kiện đặt lại mật khẩu thành công
        await this.eventPublisher.publish(UserCompleteChangePasswordEvent.create({userId: user.id, email: user.email, username: user.username}, user.id)); // Phát hành sự kiện hoàn tất đặt lại mật khẩu
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
        const isMatch = await bcrypt.compare(`${data.currentPassword}.${user.salt}`, user.password);
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
}