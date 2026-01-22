import { Requester, TokenPayload, AccessTokenPayload, RefreshTokenPayload } from 'src/share'
import { User } from './user.model'
import { UserAuthDTO, UserChangePasswordDTO, UserCondDTO, UserLoginDTO, UserRegistrationDTO, UserResetPasswordDTO, UserUpdateDTO } from './user.dto'

// Định nghĩa các phương thức mà UserService phải triển khai
export interface IUserService {
    register(dto: UserRegistrationDTO): Promise<string>; // Đăng ký người dùng mới
    genarateOTPAccount(email: string): Promise<{sessionId: string, expiry: number} | null>; // Tạo mã OTP để xác minh tài khoản (dùng email để gửi mã OTP, sessionId là phiên làm việc để xác định email, expiry là thời gian hết hạn của phiên làm việc) hết phiên sẽ yêu cầu nhập lại email
    verifyAccount(token: string, otp: string): Promise<void>; // Xác minh tài khoản người dùng (dùng token để xác định email, otp để xác minh)
    resendVerifyAccount(token: string): Promise<void>; // Gửi lại mã xác minh tài khoản
    login(dto: UserLoginDTO): Promise<UserAuthDTO>; // Đăng nhập người dùng
    googleLogin(idToken: string): Promise<UserAuthDTO>; // Đăng nhập bằng Google
    profile(userId: string): Promise<Omit<User, 'password' | 'salt'>>; // Lấy thông tin hồ sơ người dùng
    update(requester: Requester, userId: string, dto: UserUpdateDTO): Promise<Omit<User, 'password' | 'salt'>>; // Cập nhật thông tin người dùng
    updatePassword(requester: Requester, userId: string, dto: UserChangePasswordDTO): Promise<void>; // Cập nhật mật khẩu người dùng
    forgotPassword(email: string): Promise<void>; // Xử lý quên mật khẩu (kiểm tra email có tồn tại không và gửi mã OTP)
    genarateOTPForgotPassword(email: string): Promise<{sessionId: string, expiry: number} | null>; // Tạo mã OTP để đặt lại mật khẩu (sessionId là phiên làm việc để xác định email, expiry là thời gian hết hạn của phiên làm việc) hết phiên sẽ yêu cầu nhập lại email
    resendForgotPasswordOTP(token: string): Promise<void>; // Gửi lại mã OTP đặt lại mật khẩu
    verifyResetPasswordToken(token: string, otp: string): Promise<void>; // Xác minh token đặt lại mật khẩu (dùng token để xác định email, otp để xác minh)
    resetPassword(token: string, dto: UserResetPasswordDTO): Promise<void>; // Đặt lại mật khẩu bằng token
    deleteAccount(requester: Requester, userId: string): Promise<void>; // Xóa tài khoản người dùng

    // Kiểm tra token làm mới và trả về thông tin người dùng
    introspectAccessToken(token: string): Promise<AccessTokenPayload | null>; // Kiểm tra access token và trả về thông tin người dùng
    introspectRefreshToken(token: string): Promise<RefreshTokenPayload | null>; // Kiểm tra refresh token và trả về thông tin người dùng
    
    // Thêm token FCM cho người dùng
    addFcmToken(userId: string, fcmToken: string): Promise<void>;

    // Xóa token FCM cho người dùng
    removeFcmToken(userId: string, fcmToken: string): Promise<void>;

    // Refresh token
    refreshToken(refreshToken: string): Promise<UserAuthDTO>;

    // Logout
    logout(accessToken: string, refreshToken: string): Promise<void>;
}

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