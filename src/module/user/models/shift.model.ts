import { z } from 'zod';

// Lỗi chung về ca làm việc
export const ErrShiftNotFound = new Error('Shift not found'); // Lỗi ca làm việc không tồn tại
export const ErrShiftAlreadyExists = new Error('Shift already exists'); // Lỗi ca làm việc đã tồn tại
// Lỗi về thời gian bắt đầu
export const ErrStartTimeInvalid = new Error('Start time is invalid'); // Lỗi thời gian bắt đầu không hợp lệ

// Lỗi về thời gian kết thúc
export const ErrEndTimeInvalid = new Error('End time is invalid'); // Lỗi thời gian kết thúc không hợp lệ

// lỗi về số tiền mặt ban đầu
export const ErrCashStartNegative = new Error('Starting cash cannot be negative'); // Lỗi số tiền mặt ban đầu không thể âm

// Lỗi về số tiền mặt kết thúc
export const ErrCashEndNegative = new Error('Ending cash cannot be negative'); // Lỗi số tiền mặt kết thúc không thể âm

// Mô hình dữ liệu
export const shiftSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    startTime: z.date(),
    endTime: z.date().nullable(),
    cashStart: z.number().min(0, { message: ErrCashStartNegative.message }),
    cashEnd: z.number().min(0, { message: ErrCashEndNegative.message }).nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export interface Shift extends z.infer<typeof shiftSchema> {}