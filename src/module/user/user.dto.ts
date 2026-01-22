import { z } from 'zod';
import { ErrUsernameInvalidFormat, userSchema } from './user.model';
import { ApiOperation } from '@nestjs/swagger';

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

// Định nghĩa kiểu dữ liệu cho cập nhật thông tin người dùng
export const userUpdateDTOSchema = userSchema.pick({
    username: true,
    salt: true,
    password: true,
    fullName: true,
    email: true,
    birthday: true,
    role: true,
    rankId: true,
    mongoUserId: true,
    currentPoints: true,
    status: true,
    fcmToken: true,
}).partial();

// Định nghĩa kiểu dữ liệu cập nhật người dùng
export interface UserUpdateDTO extends z.infer<typeof userUpdateDTOSchema> {}

// Định nghĩa kiểu dữ liệu cho quên mật khẩu
export const userForgotPasswordDTOSchema = userSchema.pick({
    email: true,
}).required();

// Định nghĩa kiểu dữ liệu quên mật khẩu
export interface UserForgotPasswordDTO extends z.infer<typeof userForgotPasswordDTOSchema> {}

// Định nghĩa kiểu dữ liệu cho đặt lại mật khẩu
export const userResetPasswordDTOSchema = z.object({
    password: userSchema.shape.password,
    confirmPassword: userSchema.shape.password,
}).refine((data) => data.password === data.confirmPassword, { // Xác nhận mật khẩu phải trùng khớp
    message: 'Passwords do not match',
}).required();

// Định nghĩa kiểu dữ liệu đặt lại mật khẩu
export interface UserResetPasswordDTO extends z.infer<typeof userResetPasswordDTOSchema> {}

// Định nghĩa kiểu dữ liệu cho thay đổi mật khẩu
export const userChangePasswordDTOSchema = z.object({
    oldPassword: userSchema.shape.password,
    newPassword: userSchema.shape.password,
}).refine((data) => data.oldPassword !== data.newPassword, {
    message: 'New password must be different from old password',    
}).required();

// Định nghĩa kiểu dữ liệu thay đổi mật khẩu
export interface UserChangePasswordDTO extends z.infer<typeof userChangePasswordDTOSchema> {}

// Baso TODO: không cho phép cập nhật vai trò, trạng thái, điểm, hạng qua DTO này
// Chỉ cho phép cập nhật qua admin hoặc các chức năng đặc biệt khác
export const userUpdateProfileDTOSchema = userSchema.pick({
    role: true,
    status: true,
    currentPoints: true,
    rankId: true,
}).partial();

// Định nghĩa kiểu dữ liệu cập nhật hồ sơ người dùng
export interface UserUpdateProfileDTO extends z.infer<typeof userUpdateProfileDTOSchema> {}

// Định nghĩa kiểu dữ liệu cho điều kiện lọc người dùng
export const userCondDTOSchema = userSchema.pick({
    username: true,
    fullName: true,
    email: true,
    role: true,
    status: true,
    rankId: true,
}).partial();

// Định nghĩa kiểu dữ liệu điều kiện lọc người dùng
export interface UserCondDTO extends z.infer<typeof userCondDTOSchema> {}

// Định nghĩa kiểu dữ liệu cho cập nhật token FCM
export const fcmTokenDTOSchema = userSchema.pick({
    fcmToken: true,
}).required();

// Định nghĩa kiểu dữ liệu cập nhật token FCM
export interface FcmTokenDTO extends z.infer<typeof fcmTokenDTOSchema> {}