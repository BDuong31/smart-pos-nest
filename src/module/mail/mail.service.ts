import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { IMailService } from './mail.port';

@Injectable()
export class MailService implements IMailService {
  constructor(private readonly mailerService: MailerService) {}

  // Gửi Email OTP kích hoạt tài khoản
  async emailOTPVerify(to: string, otp: string, userName: string = 'Bạn'): Promise<void> {
    try {
      console.log (`Gửi email OTP Verify đến: ${to} với OTP: ${otp}`);

      await this.mailerService.sendMail({
        from:  'Baso Corner <vtbduong@baso.id.vn>',
        to: to,
        subject: 'Baso Corner - Mã OTP kích hoạt tài khoản',
        template: 'otp-verify', 
        // html: `<b>Chào ${userName}, OTP của bạn là: ${otp}</b>`, // Dùng HTML thay thế
        context: { 
          name: userName,
          otp: otp,
        },
      });
      Logger.log(`OTP Verify Email sent to ${to}`);
    } catch (error) {
      Logger.error(`Failed to send email: ${error}`);
    }
  }

  // Gửi Email chào mừng sau khi kích hoạt tài khoản thành công
  async emailWelcome(to: string, userName: string = 'Bạn'): Promise<void> {
    try {
      await this.mailerService.sendMail({
        from: 'Baso Corner <vtbduong@baso.id.vn>',
        to: to,
        subject: 'Baso Corner - Chào mừng bạn đến với Baso Corner!',
        template: 'welcome', 
        context: {
          fullName: userName,
          appUrl: 'https://baso.id.vn', // Thêm URL ứng dụng nếu cần
        },
      });
      Logger.log(`Welcome Email sent to ${to}`);
    } catch (error) {
      Logger.error(`Failed to send email: ${error}`);
    }
  }

  // Gửi Email OTP đặt lại mật khẩu
  async emailOTPForgotPassword(to: string, otp: string, userName: string = 'Bạn'): Promise<void> {
    try {
      await this.mailerService.sendMail({
        from: 'Baso Corner <vtbduong@baso.id.vn>',
        to: to,
        subject: 'Baso Corner - Mã OTP đặt lại mật khẩu',
        template: 'otp-forgot-password',
        context: {
          name: userName,
          otp: otp,
        },
      });
      Logger.log(`OTP Forgot Password Email sent to ${to}`);
    } catch (error) {
      Logger.error(`Failed to send email: ${error}`);
    }
  }

  // Gửi Email thông báo hoàn tất đặt lại mật khẩu
  async emailCompleteResetPassword(to: string, userName: string = 'Bạn'): Promise<void> {
    try {
      await this.mailerService.sendMail({
        from: 'Baso Corner <vtbduong@baso.id.vn>',
        to: to,
        subject: 'Baso Corner - Hoàn tất đặt lại mật khẩu',
        template: './complete-reset-password',
        context: {
          name: userName,
        },
      });
      Logger.log(`Complete Reset Password Email sent to ${to}`);
    } catch (error) {
      Logger.error(`Failed to send email: ${error}`);
    }
  }

  // Gửi Email thông báo hoàn tất thay đổi mật khẩu
  async emailCompleteChanggePassword(to: string, userName: string = 'Bạn'): Promise<void> {
    try {
      await this.mailerService.sendMail({
        from: 'Baso Corner <vtbduong@baso.id.vn>',
        to: to,
        subject: 'Baso Corner - Hoàn tất thay đổi mật khẩu',
        template: './complete-change-password',
        context:{
          name: userName,
        },
      });
      Logger.log(`Complete Change Password Email sent to ${to}`);
    } catch (error) {
      Logger.error(`Failed to send email: ${error}`);
    }
  }

  // Gửi Email thông báo cập nhật hồ sơ
  async emailUpdateProfile(to: string, userName: string = 'Bạn'): Promise<void> {
    try {
      await this.mailerService.sendMail({
        from: 'Baso Corner <vtbduong@baso.id.vn>',
        to: to,
        subject: 'Baso Corner - Cập nhật hồ sơ thành công',
        template: './update-profile',
        context: { 
          name: userName,
        },
      });
      Logger.log(`Update Profile Email sent to ${to}`);
    } catch (error) {
      Logger.error(`Failed to send email: ${error}`);
    }
  }

  // Gửi Email thông báo xóa tài khoản
  async emailDeleteAccount(to: string, userName: string = 'Bạn'): Promise<void> {
    try {
      await this.mailerService.sendMail({
        from: 'Baso Corner <vtbduong@baso.id.vn>',
        to: to,
        subject: 'Baso Corner - Tài khoản đã bị xóa',
        template: './delete-account',
        context: {
          name: userName,
        },
      });
      Logger.log(`Delete Account Email sent to ${to}`);
    } catch (error) {
      Logger.error(`Failed to send email: ${error}`);
    }
  }

  // Gửi Email chào mừng nhân viên mới
  async emailWelcomStaff(to: string, staffName: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        from: 'Baso Corner <vtbduong@baso.id.vn>',
        to: to,
        subject: 'Baso Corner - Chào mừng nhân viên mới!',
        template: './welcom-staff',
        context: {
          name: staffName,
        },
      });
      Logger.log(`Welcome Staff Email sent to ${to}`);
    } catch (error) {
      Logger.error(`Failed to send email: ${error}`);
    }
  }
}
