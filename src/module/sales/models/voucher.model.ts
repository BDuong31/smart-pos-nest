import { z } from "zod";

// ============================
// Model cho Voucher
// ============================

// Định nghĩa lỗi cho Voucher
// 1. Lỗi chung về Voucher
export const ErrVoucherNotFound = new Error('Voucher not found'); // Lỗi voucher không tồn tại
export const ErrVoucherAlreadyExists = new Error('Voucher already exists'); // Lỗi voucher đã tồn tại

// 2. Lỗi về mã voucher
export const ErrVoucherCodeRequired = new Error('Voucher code is required'); // Lỗi mã voucher bắt buộc
export const ErrVoucherCodeTooShort = new Error('Voucher code is too short'); // Lỗi mã voucher quá ngắn
export const ErrVoucherCodeTooLong = new Error('Voucher code is too long'); // Lỗi mã voucher quá dài
export const ErrVoucherCodeInvalidFormat = new Error('Voucher code has invalid format'); // Lỗi định dạng mã voucher không hợp lệ

// 3. Lỗi về giá trị voucher
export const ErrVoucherValueNegative = new Error('Voucher value cannot be negative'); // Lỗi giá trị voucher không được âm

// 4. Lỗi về giá trị tối thiểu áp dụng voucher
export const ErrVoucherMinOrderValueNegative = new Error('Voucher minimum order value cannot be negative'); // Lỗi giá trị tối thiểu áp dụng voucher không được âm

// 5. Lỗi về giới hạn sử dụng voucher
export const ErrVoucherUsageLimitNegative = new Error('Voucher usage limit cannot be negative'); // Lỗi giới hạn sử dụng voucher không được âm

// 6. Lỗi về trạng thái kích hoạt voucher
export const ErrVoucherIsActiveRequired = new Error('Voucher isActive is required');

// 7. Lỗi về ngày bắt đầu và kết thúc của voucher
export const ErrVoucherStartDateRequired = new Error('Voucher start date is required'); // Lỗi ngày bắt đầu của voucher bắt buộc
export const ErrVoucherEndDateRequired = new Error('Voucher end date is required'); // Lỗi ngày kết thúc của voucher bắt buộc
export const ErrVoucherStartDateAfterEndDate = new Error('Voucher start date must be before end date'); // Lỗi ngày bắt đầu phải trước ngày kết thúc

// Enum cho loại voucher
export enum VoucherType {
    PERCENTAGE = 'percentage', // Giảm giá theo phần trăm
    FIXED_AMOUNT = 'fixed_amount', // Giảm giá theo số tiền cố định
}

// Mô hình dữ liệu cho Voucher
export const voucherSchema = z.object({
    id: z.string().uuid(),
    code: z.string().min(1, ErrVoucherCodeRequired).max(50, ErrVoucherCodeTooLong),
    type: z.nativeEnum(VoucherType),
    value: z.number().min(0, ErrVoucherValueNegative),
    minOrderVal: z.number().min(0, ErrVoucherMinOrderValueNegative),
    usageLimit: z.number().min(0, ErrVoucherUsageLimitNegative),
    isActive: z.boolean(),
    startDate: z.date(),
    endDate: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Voucher = z.infer<typeof voucherSchema>;