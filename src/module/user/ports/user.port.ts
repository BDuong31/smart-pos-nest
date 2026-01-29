import { Requester, TokenPayload, AccessTokenPayload, RefreshTokenPayload } from 'src/share'
import { User } from '../models/user.model'
import {  CreateStaffDTO, UserCondDTO, UserUpdateDTO } from '../dtos/user.dto'
import { IOtpAttempt, IUserAudit } from '../models/user-mongo.model';
// ============================
// Định nghĩa các interface cho User Service
// ============================

// Định nghĩa các phương thức mà UserService phải triển khai
export interface IUserService {
  // Admin thao tác
  createStart(requester: Requester, dto: CreateStaffDTO, ip: string, userAgent: string): Promise<string>; // Tạo người dùng mới cho Staff/Kitchen

  // Người dùng thao tác
  profile(userId: string, ip: string, userAgent: string): Promise<Omit<User, 'password' | 'salt'>>; // Lấy thông tin hồ sơ người dùng
  update(requester: Requester, userId: string, dto: UserUpdateDTO, ip: string, userAgent: string): Promise<Omit<User, 'password' | 'salt'>>; // Cập nhật thông tin người dùng
  deleteAccount(requester: Requester, userId: string, ip: string, userAgent: string): Promise<void>; // Xóa tài khoản người dùng

  // Thêm token FCM cho người dùng
  addFcmToken(userId: string, fcmToken: string, ip: string, userAgent: string): Promise<void>; // Thêm token FCM cho người dùng
  removeFcmToken(userId: string, fcmToken: string, ip: string, userAgent: string): Promise<void>; // Xóa token FCM cho người dùng
}

// Định nghĩa các phương thức mà UserRepository phải triển khai
export interface IUserRepository {
    // truy vấn
    get(id: string): Promise<User | null>; // Lấy người dùng theo ID
    findByCond(cond: UserCondDTO): Promise<User | null>; // Tìm người dùng theo điều kiện
    findByCondOr(cond: UserCondDTO): Promise<User | null>; // Tìm người dùng đúng theo 1 trong các điều kiện
    listByIds(ids: string[]): Promise<User[]>; // Lấy danh sách người dùng theo mảng IDs

    // yêu cầu
    insert(user: User): Promise<void>; // Thêm người dùng mới
    update(id: string, dto: UserUpdateDTO): Promise<void>; // Cập nhật thông tin người dùng
    delete(id: string): Promise<void>; // Xóa người dùng theo ID
}

export interface IUserMongoAuditRepository {

  logUserAudit(data: {
    userId?: string;
    action: string;
    success: boolean;
    ip?: string;
    userAgent?: string;
  }): Promise<void>;

  getUserAudits(
    userId: string,
    limit: number,
  ): Promise<IUserAudit[]>;

  /* ===== OTP ===== */
}

export interface IUserMongoOtpRepository {
    logOTPAttempt(data: {
    identifier: string;
    type: string;
    success: boolean;
    ip?: string;
    deviceInfo?: string;
    userAgent?: string;
  }): Promise<void>;

  getOTPAttempts(
    identifier: string,
    type: string,
    limit: number,
  ): Promise<IOtpAttempt[]>;

  countFailOTPAttempts(
    identifier: string,
    type: string,
    from: Date,
  ): Promise<number>;
}
