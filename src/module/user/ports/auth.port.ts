import { Requester, AccessTokenPayload, RefreshTokenPayload } from 'src/share'
import { User } from '../models/user.model'
import { UserAuthDTO, UserChangePasswordDTO, UserLoginDTO, UserRegistrationDTO, UserResetPasswordDTO } from '../dtos/auth.dto'
// ============================
// Định nghĩa các interface cho Auth Service
// ============================

// Định nghĩa kiểu dữ liệu người dùng xác thực
export interface IAuthService {
  // authentication
  register(dto: UserRegistrationDTO, ip: string, userAgent: string): Promise<string>; // Đăng ký người dùng mới
  login(dto: UserLoginDTO, ip: string, userAgent: string): Promise<UserAuthDTO>; // Đăng nhập người dùng
  googleLogin(idToken: string, ip: string, userAgent: string): Promise<UserAuthDTO>; // Đăng nhập bằng Google
  logout(accessToken: string, refreshToken: string, ip: string, userAgent: string): Promise<void>; // Đăng xuất người dùng
  refreshToken(refreshToken: string): Promise<UserAuthDTO>; // Làm mới token

  // token introspection
  introspectAccessToken(token: string): Promise<AccessTokenPayload | null>; // Kiểm tra access token và trả về thông tin người dùng
  introspectRefreshToken(token: string): Promise<RefreshTokenPayload | null>; // Kiểm tra refresh token và trả về thông tin người dùng

  // Account Activation & Verification
  activateAccount(email: string, ip: string, userAgent: string): Promise<void>; // Yêu cầu kích hoạt tài khoản (gửi email kích hoạt)
  genarateOTPAccount(email: string, ip: string, userAgent: string): Promise<{sessionId: string, expiry: number} | null>; // Tạo mã OTP để xác minh tài khoản (dùng email để gửi mã OTP, sessionId là phiên làm việc để xác định email, expiry là thời gian hết hạn của phiên làm việc) hết phiên sẽ yêu cầu nhập lại email
  verifyAccount(token: string, otp: string, ip: string, userAgent: string): Promise<void>; // Xác minh tài khoản người dùng (dùng token để xác định email, otp để xác minh)
  resendVerifyAccount(token: string, ip: string, userAgent: string): Promise<void>; // Gửi lại mã xác minh tài khoản

  // Password Management  
  forgotPassword(email: string, ip: string, userAgent: string): Promise<void>; // Xử lý quên mật khẩu (kiểm tra email có tồn tại không và gửi mã OTP)
  genarateOTPForgotPassword(email: string, ip: string, userAgent: string): Promise<{sessionId: string, expiry: number} | null>; // Tạo mã OTP để đặt lại mật khẩu (sessionId là phiên làm việc để xác định email, expiry là thời gian hết hạn của phiên làm việc) hết phiên sẽ yêu cầu nhập lại email
  resendForgotPasswordOTP(token: string, ip: string, userAgent: string): Promise<void>; // Gửi lại mã OTP đặt lại mật khẩu
  verifyPasswordToken(token: string, otp: string, ip: string, userAgent: string): Promise<string>; // Xác minh token đặt lại mật khẩu (dùng token để xác định email, otp để xác minh)
  resetPassword(token: string, dto: UserResetPasswordDTO, ip: string, userAgent: string): Promise<void>; // Đặt lại mật khẩu bằng token
  updatePassword(requester: Requester, userId: string, dto: UserChangePasswordDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật mật khẩu người dùng
}
