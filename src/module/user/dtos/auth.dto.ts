import { z } from 'zod';
import { ErrUsernameInvalidFormat, userSchema } from '../models/user.model';

// ============================
// DTO cho xác thực người dùng
// ============================

// Định nghĩa schema cho đăng ký người dùng
export const userRegistrationDTOSchema = userSchema.pick({
    username: true,
    fullName: true,
    birthday: true,
    email: true,
    password: true,
}).required();

// Định nghĩa schema cho đăng nhập người dùng
export const userLoginDTOSchema = userSchema.pick({
    username: true,
    password: true,
}).refine(
    (data) => {
        const v = data.username;
        if (z.string().email().safeParse(v).success) {
            return true;
        }

        return v.length >=8 && v.length <=30; // Kiểm tra độ dài nếu không phải email
    },
    {
        path: ['username'], // Vị trí lỗi
        message: ErrUsernameInvalidFormat.message, // Thông báo lỗi
    }
).required();

// Định nghĩa schema cho dữ liệu xác thực người dùng
export const UserAuthDTOSchema = z.object({
    accessToken: z.string(), // Token truy cập
    refreshToken: z.string(), // Token làm mới
});

// Định nghĩa kiểu dữ liệu xác thực người dùng
export interface UserAuthDTO extends z.infer<typeof UserAuthDTOSchema> {}

// Định nghĩa kiểu dữ liệu đăng ký người dùng
export interface UserRegistrationDTO extends z.infer<typeof userRegistrationDTOSchema> {}

// Định nghĩa kiểu dữ liệu đăng nhập người dùng
export interface UserLoginDTO extends z.infer<typeof userLoginDTOSchema> {}

// Định nghĩa kiểu dữ liệu cho quên mật khẩu
export const userForgotPasswordDTOSchema = userSchema.pick({
    email: true,
}).required();

// Định nghĩa kiểu dữ liệu cho quên mật khẩu
export interface UserForgotPasswordDTO extends z.infer<typeof userForgotPasswordDTOSchema> {}

// Định nghĩa schema cho đặt lại mật khẩu
export const userResetPasswordDTOSchema = z.object({
    password: userSchema.shape.password,
    confirmPassword: userSchema.shape.password,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
}).required();

// Định nghĩa kiểu dữ liệu cho đặt lại mật khẩu
export interface UserResetPasswordDTO extends z.infer<typeof userResetPasswordDTOSchema> {}

// Định nghĩa kiểu dữ liệu cho thay đổi mật khẩu
export const userChangePasswordDTOSchema = z.object({
    currentPassword: userSchema.shape.password,
    newPassword: userSchema.shape.password,
    confirmNewPassword: userSchema.shape.password,
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
}).required();

// Định nghĩa kiểu dữ liệu cho thay đổi mật khẩu
export interface UserChangePasswordDTO extends z.infer<typeof userChangePasswordDTOSchema> {}

