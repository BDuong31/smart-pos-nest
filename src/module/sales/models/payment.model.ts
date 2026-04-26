import { z } from "zod";
import { Prisma } from "@prisma/client";

// ============================
// Model cho Voucher
// ============================

// Định nghĩa lỗi cho Payment
// 1. Lỗi chung về Payment
export const ErrPaymentNotFound = new Error('Payment not found'); // Lỗi thanh toán không tồn tại
export const ErrPaymentAlreadyExists = new Error('Payment already exists'); // Lỗi thanh toán đã tồn tại
export const ErrPaymentNotPending = new Error('Only pending payments can be updated or deleted'); // Lỗi chỉ có thể cập nhật hoặc xóa các giao dịch thanh toán đang ở trạng thái chờ xử lý

// 2. Lỗi về số tiền thanh toán
export const ErrPaymentAmountNegative = new Error('Payment amount cannot be negative'); // Lỗi số tiền thanh toán không được âm

// 3. Lỗi về phương thức thanh toán
export const ErrPaymentMethodRequired = new Error('Payment method is required'); // Lỗi phương thức thanh toán bắt buộc
export const ErrPaymentMethodInvalid = new Error('Payment method is invalid'); // Lỗi phương thức thanh toán không hợp lệ

// enum cho phương thức thanh toán
export enum PaymentMethod {
    CASH = 'cash', // Thanh toán bằng tiền mặt
    MOMO = 'momo', // Thanh toán bằng ví điện tử Momo
    VNPAY = 'vnpay', // Thanh toán bằng ví điện tử VNPAY
    ZALO = 'zalo', // Thanh toán bằng ví điện tử ZaloPay
}

// enum cho trạng thái thanh toán
export enum PaymentStatus {
    PENDING = 'pending', // Thanh toán đang chờ xử lý
    SUCCESS = 'success', // Thanh toán đã hoàn thành
    FAILED = 'failed', // Thanh toán thất bại
}

// Mô hình dữ liệu cho Payment
export const paymentTransactionSchema = z.object({
    id: z.string().uuid(),
    orderId: z.string().uuid(),
    externalTransactionId: z.string().min(1).max(100).optional().nullable(), // ID giao dịch từ hệ thống thanh toán bên thứ ba, nếu có
    amount: z.number().min(0, {message: ErrPaymentAmountNegative.message}), // Số tiền thanh toán, không được âm
    method: z.nativeEnum(PaymentMethod),
    gatewayResponse: z.any().transform((val) => val as Prisma.InputJsonValue).optional().nullable(), // Phản hồi từ cổng thanh toán, lưu dưới dạng JSON
    status: z.nativeEnum(PaymentStatus),
    paidAt: z.date().optional().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type PaymentTransaction = z.infer<typeof paymentTransactionSchema>;

export const InitiatePaymentSchemaTable = z.object({
    paymentId: z.string().uuid(),
    method: z.string().min(1).max(50),
    methodChild: z.string().min(1).max(50).optional().nullable(), 
});