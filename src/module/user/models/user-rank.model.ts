import { z } from 'zod';

// Lỗi chung về hạng người dùng
export const ErrUserRankNotFound = new Error('User rank not found'); // Lỗi hạng người dùng không tồn tại
export const ErrUserRankNameAlreadyExists = new Error('User rank name already exists'); // Lỗi tên hạng người dùng đã tồn tại
export const ErrUserRankMinPointAlreadyExists = new Error('User rank minimum point already exists'); // Lỗi điểm tối thiểu hạng người dùng đã tồn tại

// Lỗi về tên hạng
export const ErrRankNameRequired = new Error('Rank name is required'); // Lỗi tên hạng bắt buộc
export const ErrRankNameTooShort = new Error('Rank name is too short'); // Lỗi tên hạng quá ngắn
export const ErrRankNameTooLong = new Error('Rank name is too long'); // Lỗi tên hạng quá dài

// Lỗi về điểm tối thiểu
export const ErrMinPointsInvalid = new Error('Minimum points is invalid'); // Lỗi điểm tối thiểu không hợp lệ
export const ErrMinPointsNegative = new Error('Minimum points cannot be negative'); // Lỗi điểm tối thiểu không thể âm

// Lỗi về phần trăm giảm giá
export const ErrDiscountPercentInvalid = new Error('Discount percent is invalid'); // Lỗi phần trăm giảm giá không hợp lệ
export const ErrDiscountPercentOutOfRange = new Error('Discount percent must be between 0 and 100'); // Lỗi phần trăm giảm giá phải nằm trong khoảng 0 đến 100

// Mô hình dữ liệu 
export const userRankSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(3, { message: ErrRankNameTooShort.message }).max(50, { message: ErrRankNameTooLong.message }),
    minPoint: z.number().min(0, { message: ErrMinPointsNegative.message }),
    discountPercent: z.number().min(0, { message: ErrDiscountPercentOutOfRange.message }).max(100, { message: ErrDiscountPercentOutOfRange.message }),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export interface UserRank extends z.infer<typeof userRankSchema> {}