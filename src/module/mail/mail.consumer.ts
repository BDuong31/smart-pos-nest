import { Controller, OnModuleInit } from '@nestjs/common';
import { MailService } from './mail.service';
import { RabbitMQClient } from '../../share/components/rabbitmq'; // Import Singleton RabbitMQ
import { EvtUserCompleteChangePassword, EvtUserCompleteResetPassword, EvtUserCretated, EvtUserDeleted, EvtUserForgotPassword, EvtUserUpdateProfile, EvtUserVerify, UserCreatedEvent } from 'src/share/event/user.evt';

@Controller()
export class MailConsumer implements OnModuleInit {
  constructor(private readonly mailService: MailService) { }

  async onModuleInit() {
    this.subscribe();
  }

  subscribe() {
    console.log('--- MAIL CONSUMER ĐANG KHỞI ĐỘNG ---');

    // Lắng nghe sự kiện người dùng được tạo
    // RabbitMQClient.getInstance().subscribe(EvtUserCretated, async (event: any) => {
    //   console.log('--- MAIL CONSUMER NHẬN SỰ KIỆN TẠO USER ---');
    //   const data  = JSON.parse(event);
    //   const evt = UserCreatedEvent.from(data);
    //   await this.mailService.emailOTPVerify(evt.payload.email, evt.payload?.otp || '', evt.payload?.username || 'Bạn');
    // });
    RabbitMQClient.getInstance().subscribe(
      'user.created',
      async (event: any) => {
        const evt = UserCreatedEvent.from(event);
        console.log('--- MAIL CONSUMER NHẬN SỰ KIỆN TẠO USER ---', evt);

        console.log('Gửi email xác minh OTP đến:', evt.payload);

        await this.mailService.emailOTPVerify(
          evt.payload.email,
          evt.payload.otp ?? '',
          evt.payload.username ?? 'Bạn',
        );
      },
    );

    // Lắng nghe sự kiện người dùng được xác thực
    RabbitMQClient.getInstance().subscribe(EvtUserVerify, async (event: any) => {
      const evt = UserCreatedEvent.from(event);
      await this.mailService.emailWelcome(evt.payload.email, evt.payload?.username || 'Bạn');
    });

    // Lắng nghe sự kiện người dùng quên mật khẩu
    RabbitMQClient.getInstance().subscribe(EvtUserForgotPassword, async (event: any) => {
      console.log('--- MAIL CONSUMER NHẬN SỰ KIỆN QUÊN MẬT KHẨU ---');

      console.log('Gửi email quên mật khẩu đến:', event);
      const evt = UserCreatedEvent.from(event);
      await this.mailService.emailOTPForgotPassword(evt.payload.email, evt.payload?.otp || '', evt.payload?.username || 'Bạn');
    });

    // Lắng nghe sự kiện người dùng hoàn tất đặt lại mật khẩu
    RabbitMQClient.getInstance().subscribe(EvtUserCompleteResetPassword, async (event: any) => {
      const evt = UserCreatedEvent.from(event);
      await this.mailService.emailCompleteResetPassword(evt.payload.email, evt.payload?.username || 'Bạn');
    });

    // Lắng nghe sự kiện người dùng hoàn tất thay đổi mật khẩu
    RabbitMQClient.getInstance().subscribe(EvtUserCompleteChangePassword, async (event: any) => {
      const evt = UserCreatedEvent.from(event);
      await this.mailService.emailCompleteChanggePassword(evt.payload.email, evt.payload?.username || 'Bạn');
    });

    // Lắng nghe sự kiện người dùng cập nhật hồ sơ
    RabbitMQClient.getInstance().subscribe(EvtUserUpdateProfile, async (event: any) => {
      const evt = UserCreatedEvent.from(event);
      await this.mailService.emailUpdateProfile(evt.payload.email, evt.payload?.username || 'Bạn');
    });

    // Lắng nghe sự kiện người dùng xóa tài khoản
    RabbitMQClient.getInstance().subscribe(EvtUserDeleted, async (event: any) => {
      const evt = UserCreatedEvent.from(event);
      await this.mailService.emailDeleteAccount(evt.payload.email, evt.payload?.username || 'Bạn');
    });
  }
}
