import { create } from 'domain';
import { UserRole } from 'src/share';
import { z } from 'zod';

export enum UserStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
    INACTIVE = 'inactive',
    BANNED = 'banned',
}

// Lỗi chung về người dùng
export const ErrUserNotFound = new Error('User not found'); // Lỗi người dùng không tồn tại
export const ErrUserAlreadyExists = new Error('User already exists'); // Lỗi người dùng đã tồn tại
export const ErrUserInactive = new Error('User is inactive'); // Lỗi người dùng không hoạt động
export const ErrUserBanned = new Error('User is banned'); // Lỗi người dùng bị cấm
export const ErrUserPending = new Error('User is pending verification'); // Lỗi người dùng đang chờ xác thực

// Lỗi về UserName
export const ErrUsernameRequired = new Error('Username is required'); // Lỗi tên người dùng bắt buộc
export const ErrUsernameTooShort = new Error('Username is too short'); // Lỗi tên người dùng quá ngắn
export const ErrUsernameTooLong = new Error('Username is too long'); // Lỗi tên người dùng quá dài
export const ErrUsernameInvalidFormat = new Error('Username has invalid format'); // Lỗi định dạng tên người dùng không hợp lệ
export const ErrUsernameAlreadyExists = new Error('Username already exists'); // Lỗi tên người dùng đã tồn tại

// Lỗi về Email
export const ErrEmailRequired = new Error('Email is required'); // Lỗi email bắt buộc
export const ErrEmailInvalid = new Error('Email has invalid format'); // Lỗi định dạng email không hợp lệ
export const ErrEmailTooLong = new Error('Email is too long'); // Lỗi email quá dài
export const ErrEmailAlreadyExists = new Error('Email already exists'); // Lỗi email đã tồn tại
export const ErrEmailNotVerified = new Error('Email is not verified'); // Lỗi email chưa được xác thực

// lỗi về Password
export const ErrPasswordRequired = new Error('Password is required'); // Lỗi mật khẩu bắt buộc
export const ErrPasswordTooShort = new Error('Password is too short'); // Lỗi mật khẩu quá ngắn
export const ErrPasswordTooWeak = new Error('Password is too weak'); // Lỗi mật khẩu quá yếu
export const ErrPasswordNotMatch = new Error('Password does not match'); // Lỗi mật khẩu không khớp
export const ErrPasswordHashFalied = new Error('Failed to hash password'); // Lỗi băm mật khẩu thất bại

// lỗi về FullName
export const ErrFullnameRequired = new Error('Full name is required'); // Lỗi họ tên bắt buộc
export const ErrFullnameTooLong = new Error('Full name is too long'); // Lỗi họ tên quá dài
export const ErrFullnameInvalid = new Error('Full name has invalid format'); // Lỗi định dạng họ tên không hợp lệ

// lỗi về Birthday
export const ErrBirthdayRequired = new Error('Birthday is required'); // Lỗi ngày sinh bắt buộc
export const ErrBirthdayInvalid = new Error('Birthday is invalid'); // Lỗi ngày sinh không hợp lệ
export const ErrBirthdayInFuture = new Error('Birthday cannot be in the future'); // Lỗi ngày sinh không thể ở tương lai
export const ErrUserUnderAge = new Error('User is under the minimum age requirement'); // Lỗi người dùng chưa đủ tuổi

// lỗi về Role
export const ErrRoleInvalid = new Error('User role is invalid'); // Lỗi vai trò người dùng không hợp lệ
export const ErrorRoleNotAllowed = new Error('User role is not allowed'); // Lỗi vai trò người dùng không được phép

// lỗi về Rank
export const ErrRankNotFound = new Error('Rank not found'); // Lỗi hạng không tồn tại
export const ErrRankInvalid = new Error('Rank is invalid'); // Lỗi hạng không hợp lệ

// lỗi về Point
export const ErrPointInvalid = new Error('Point is invalid'); // Lỗi điểm không hợp lệ
export const ErrPointNegative = new Error('Point cannot be negative'); // Lỗi điểm không thể âm

// lỗi về Status
export const ErrStatusInvalid = new Error('User status is invalid'); // Lỗi trạng thái người dùng không hợp lệ

// lỗi về FCM
export const ErrFCMTokenInvalid = new Error('FCM token is invalid'); // Lỗi token FCM không hợp lệ
export const ErrFCMTokenExpired = new Error('FCM token has expired'); // Lỗi token FCM đã hết hạn

// lỗi về System/DB
export const ErrUserCreateFailed = new Error('Failed to create user'); // Lỗi tạo người dùng thất bại
export const ErrUserUpdateFailed = new Error('Failed to update user'); // Lỗi cập nhật người dùng thất bại
export const ErrDatabaseConstraint = new Error('Database constraint error'); // Lỗi ràng buộc cơ sở dữ liệu

// Mô hình dữ liệu
export const userSchema = z.object({
    id: z.string().uuid(),
    username: z
        .string({ message: ErrUsernameRequired.message }) // Tên người dùng bắt buộc
        .min(8, { message: ErrUsernameTooShort.message }) // Tối thiểu 8 ký tự
        .max(30, { message: ErrUsernameTooLong.message }), // Tối đa 30 ký tự
    salt: z.string().min(8), // Salt để băm mật khẩu
    password: z
        .string({ message: ErrPasswordRequired.message }) // Mật khẩu bắt buộc
        .min(8, { message: ErrPasswordTooShort.message }) // Tối thiểu 8 ký tự
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^_-])[A-Za-z\d@$!%*#?&^_-]+$/, { message: ErrPasswordTooWeak.message }), // Mật khẩu mạnh (có chữ hoa, chữ thường, số, ký tự đặc biệt)
    fullName: z
        .string({ message: ErrFullnameRequired.message }) // Họ tên bắt buộc
        .max(100, { message: ErrFullnameTooLong.message }), // Tối đa 100 ký tự
    email: z
        .string({message: ErrEmailRequired.message}) // Email bắt buộc
        .email({ message: ErrEmailInvalid.message }) // Định dạng email hợp lệ
        .max(100, { message: ErrEmailTooLong.message }), // Tối đa 100 ký tự
    birthday: z
        .coerce.date({message: ErrBirthdayInvalid.message}) // Ngày sinh hợp lệ và bắt buộc
        .refine((date) => date <= new Date(), { message: ErrBirthdayInFuture.message }), // Ngày sinh không được ở tương lai
    role: z.nativeEnum(UserRole, { message: ErrRoleInvalid.message }), // Vai trò người dùng
    rankId: z.string().uuid().nullable(), // ID hạng người dùng, có thể null
    mongoUserId: z.string().nullable(), // ID người dùng trong MongoDB, có thể null
    currentPoints: z.number().min(0, { message: ErrPointNegative.message }), // Điểm hiện tại, không âm
    status: z.nativeEnum(UserStatus, { message: ErrStatusInvalid.message }), // Trạng thái người dùng
    fcmToken: z.string().nullable(), // Token FCM, có thể null
    createdAt: z.date(), // Ngày tạo
    updatedAt: z.date(), // Ngày cập nhật
})

export interface User extends z.infer<typeof userSchema> {}
