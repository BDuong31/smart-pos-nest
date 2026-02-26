import { z } from 'zod';
import { reservationSchema } from '../models/reservation.model';

// ============================
// DTO cho đặt bàn
// ============================ 

// Định nghĩa schema cho tạo đặt bàn
export const reservationCreatedDTOSchema = reservationSchema.pick({
    userId: true, // có thể null nếu đặt bàn không cần đăng nhập
    tableId: true,
    customerName: true,
    phone: true,
    time: true,
    guestCount: true,
    note: true,
}).required();

// Định nghĩa kiểu dữ liệu cho tạo đặt bàn
export interface ReservationCreatedDTO extends z.infer<typeof reservationCreatedDTOSchema> {}

// Định nghĩa schema cho cập nhật đặt bàn (tất cả các trường đều có thể null)
export const reservationUpdateDTOSchema = reservationSchema.pick({
    userId: true,
    tableId: true,
    customerName: true,
    phone: true,
    time: true,
    guestCount: true,
    note: true,
    status: true,
}).partial();

// Định nghĩa kiểu dữ liệu cho cập nhật đặt bàn
export interface ReservationUpdateDTO extends z.infer<typeof reservationUpdateDTOSchema> {}

// Định nghĩa schema điều kiện lọc đặt bàn
export const reservationCondDTOSchema = reservationSchema.pick({
    userId: true,
    tableId: true,
    customerName: true,
    phone: true,
    time: true,
    guestCount: true,
    status: true,
}).partial();

// Định nghĩa kiểu dữ liệu điều kiện lọc đặt bàn
export interface ReservationCondDTO extends z.infer<typeof reservationCondDTOSchema> {}