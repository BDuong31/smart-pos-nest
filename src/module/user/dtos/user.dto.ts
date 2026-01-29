import { z } from 'zod';
import { ErrUsernameInvalidFormat, userSchema } from '../models/user.model';
import { UserRole } from 'src/share';

// ============================
// DTO cho thông tin người dùng
// ============================

// Định nghĩa kiểu dữ liệu tạo người dùng mới cho Staff/Kitchen
export const createStaffDTOSchema = userSchema.pick({
    username: true,
    fullName: true,
    email: true,
    password: true,
    birthday: true,
}).extend({
    role: z.enum([UserRole.STAFF, UserRole.KITCHEN]), // Chỉ cho tạo Staff/Kitchen
}).required();

// Định nghĩa kiểu dữ liệu tạo người dùng mới cho Staff/Kitchen
export interface CreateStaffDTO extends z.infer<typeof createStaffDTOSchema> {}

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