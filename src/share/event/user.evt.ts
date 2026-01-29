import e from "express";
import { AppEvent } from "../data-model";

// Định nghĩa tên các sự kiện liên quan đến người dùng
export const EvtUserCretated = 'user.created'; // Sự kiện khi người dùng được tạo (gửi email OTP)
export const EvtUserVerify = 'user.verify'; // Sự kiện khi người dùng được xác thực (gửi email chào mừng)
export const EvtUserForgotPassword = 'user.forgot_password'; // Sự kiện khi người dùng quên mật khẩu (gửi email OTP)
export const EvtUserCompleteResetPassword = 'user.complete_reset_password'; // Sự kiện khi người dùng hoàn tất đặt lại mật khẩu (gửi email thông báo)
export const EvtUserCompleteChangePassword = 'user.complete_change_password'; // Sự kiện khi người dùng hoàn tất thay đổi mật khẩu (gửi email thông báo)
export const EvtUserUpdateProfile = 'user.update_profile'; // Sự kiện khi người dùng cập nhật hồ sơ (gửi email thông báo)
export const EvtUserDeleted = 'user.deleted'; // Sự kiện khi người dùng bị xóa (gửi email thông báo)

// Định nghĩa tên các sự kiện liên quan đến admin thao tác người dùng
export const EvtAdminCreateUser = 'admin.create_user'; // Sự kiện khi admin tạo người dùng

// Định nghĩa các sự kiện liên quan đến người dùng
export type UserEventPayload = {
    userId: string; // ID người dùng
    email: string; // Email người dùng
    otp?: string; // Mã OTP (nếu có)
    username?: string; // Tên người dùng
};

// Payload: Dữ liệu đi kèm sự kiện
export class UserEvent<T extends UserEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }
    
    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends UserEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): UserEvent<T> {
        return new UserEvent<T>(eventName, payload, { senderId });
    } 

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends UserEventPayload>(json: any): UserEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new UserEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi người dùng được tạo
export class UserCreatedEvent extends UserEvent<UserEventPayload> {

    // Tạo sự kiện 
    static create(payload: UserEventPayload, senderId: string): UserCreatedEvent {
         return UserEvent.createEvent(EvtUserCretated, payload, senderId) as UserCreatedEvent;
    }

    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): UserCreatedEvent {
        return UserEvent.fromJson<UserEventPayload>(json) as UserCreatedEvent;
    }
}

// Sự kiện khi người dùng được xác thực
export class UserVerifyEvent extends UserEvent<UserEventPayload> {
    // Tạo sự kiện 
    static create(payload: UserEventPayload, senderId: string): UserVerifyEvent {
         return UserEvent.createEvent(EvtUserVerify, payload, senderId) as UserVerifyEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): UserVerifyEvent {
        return UserEvent.fromJson<UserEventPayload>(json) as UserVerifyEvent;
    }
}

// Sự kiện khi người dùng quên mật khẩu
export class UserForgotPasswordEvent extends UserEvent<UserEventPayload> {
    // Tạo sự kiện
    static create(payload: UserEventPayload, senderId: string): UserForgotPasswordEvent {
         return UserEvent.createEvent(EvtUserForgotPassword, payload, senderId) as UserForgotPasswordEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): UserForgotPasswordEvent {
        return UserEvent.fromJson<UserEventPayload>(json) as UserForgotPasswordEvent;
    }
}

// Sự kiện khi người dùng hoàn tất đặt lại mật khẩu
export class UserCompleteResetPasswordEvent extends UserEvent<UserEventPayload> {
    // Tạo sự kiện
    static create(payload: UserEventPayload, senderId: string): UserCompleteResetPasswordEvent {
         return UserEvent.createEvent(EvtUserCompleteResetPassword, payload, senderId) as UserCompleteResetPasswordEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): UserCompleteResetPasswordEvent {
        return UserEvent.fromJson<UserEventPayload>(json) as UserCompleteResetPasswordEvent;
    }
}

// Sự kiện khi người dùng hoàn tất thay đổi mật khẩu
export class UserCompleteChangePasswordEvent extends UserEvent<UserEventPayload> {
    // Tạo sự kiện
    static create(payload: UserEventPayload, senderId: string): UserCompleteChangePasswordEvent {
         return UserEvent.createEvent(EvtUserCompleteChangePassword, payload, senderId) as UserCompleteChangePasswordEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): UserCompleteChangePasswordEvent {
        return UserEvent.fromJson<UserEventPayload>(json) as UserCompleteChangePasswordEvent;
    }
}

// Sự kiện khi người dùng cập nhật hồ sơ
export class UserUpdateProfileEvent extends UserEvent<UserEventPayload> {
    // Tạo sự kiện
    static create(payload: UserEventPayload, senderId: string): UserUpdateProfileEvent {
        return UserEvent.createEvent(EvtUserUpdateProfile, payload, senderId) as UserUpdateProfileEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): UserUpdateProfileEvent {
        return UserEvent.fromJson<UserEventPayload>(json) as UserUpdateProfileEvent;
    }  
}
// Sự kiện khi người dùng bị xóa
export class UserDeletedEvent extends UserEvent<UserEventPayload> {
    // Tạo sự kiện
    static create(payload: UserEventPayload, senderId: string): UserDeletedEvent {
        return UserEvent.createEvent(EvtUserDeleted, payload, senderId) as UserDeletedEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): UserDeletedEvent {
        return UserEvent.fromJson<UserEventPayload>(json) as UserDeletedEvent;
    }
}

// Sự kiện khi admin tạo người dùng
export class AdminCreateUserEvent extends UserEvent<UserEventPayload> {
    // Tạo sự kiện
    static create(payload: UserEventPayload, senderId: string): AdminCreateUserEvent {
        return UserEvent.createEvent(EvtAdminCreateUser, payload, senderId) as AdminCreateUserEvent;
    }

    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): AdminCreateUserEvent {
        return UserEvent.fromJson<UserEventPayload>(json) as AdminCreateUserEvent;
    }
}
