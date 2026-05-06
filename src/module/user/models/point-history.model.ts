import { z } from 'zod';

// Lỗi về số điểm
export const ErrAmountNegative = new Error('Point amount cannot be negative');

// Lỗi về lý do
export const ErrReasonTooLong = new Error('Reason is too long');

// Mô hình dữ liệu
export const pointHistorySchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    amount: z.number(),
    reason: z.string().max(255, { message: ErrReasonTooLong.message }),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type PointHistory = z.infer<typeof pointHistorySchema>;