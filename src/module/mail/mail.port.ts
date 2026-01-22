
export interface IMailService {
    // Các email gửi người dùng
    emailOTPVerify(to: string, otp: string, userName: string): Promise<void>;  // Gửi Email OTP kích hoạt tài khoản
    emailWelcome(to: string, userName: string): Promise<void>;  // Gửi Email chào mừng sau khi kích hoạt tài khoản thành công
    emailOTPForgotPassword(to: string, otp: string, userName: string): Promise<void>;  // Gửi Email OTP đặt lại mật khẩu
    emailCompleteResetPassword(to: string, userName: string): Promise<void>;  // Gửi Email thông báo hoàn tất đặt lại mật khẩu
    emailCompleteChanggePassword(to: string, userName: string): Promise<void>;  // Gửi Email thông báo hoàn tất thay đổi mật khẩu
    emailUpdateProfile(to: string, userName: string): Promise<void>;  // Gửi Email thông báo cập nhật hồ sơ
    emailDeleteAccount(to: string, userName: string): Promise<void>;  // Gửi Email thông báo xóa tài khoản
} 