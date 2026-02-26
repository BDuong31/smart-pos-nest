import { z } from 'zod';
import { ErrEndTimeInvalid, ErrStartTimeInvalid, ErrCashStartNegative, ErrCashEndNegative, shiftSchema } from '../models/shift.model';

// Định nghĩa scheam cho tạo ca làm việc
export const shiftCreateDTOSchema = shiftSchema.pick({
    userId: true, // ID người dùng
    cashStart: true, // Số tiền mặt ban đầu
}).extend({
    startTime: z.date().optional(), // Thời gian bắt đầu, nếu không có thì lấy thời gian hiện tại
}).required()

// Định nghĩa kiểu dữ liệu cho tạo ca làm việc
export interface ShiftCreateDTO extends z.infer<typeof shiftCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật ca làm việc
export const shiftUpdateDTOSchema = shiftSchema.pick({
    cashEnd: true,
}).extend({
    endTime: z.date().optional(), // Thời gian kết thúc, nếu không có thì lấy thời gian hiện tại
}).required()

// Định nghĩa kiểu dữ liệu cho cập nhật ca làm việc
export interface ShiftUpdateDTO extends z.infer<typeof shiftUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn ca làm việc
export const shiftCondDTOSchema = shiftSchema.pick({
    userId: true,
    startTime: true,
    endTime: true,
    
}).partial();

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn ca làm việc
export interface ShiftCondDTO extends z.infer<typeof shiftCondDTOSchema> {}