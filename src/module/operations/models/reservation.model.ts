import { z } from 'zod';

// Định nghĩa lỗi về đặt bàn
// 1. Định nghĩa lỗi chung về đặt bàn
export const ErrReservationNotFound = new Error('Reservation not found'); // Lỗi đặt bàn không tồn tại
export const ErrReservationAlreadyExists = new Error('Reservation already exists'); // Lỗi đặt bàn đã tồn tại

// 2. Định nghĩa lỗi về tên người đặt
export const ErrCustomerNameRequired = new Error('Customer name is required'); // Lỗi tên người đặt bắt buộc
export const ErrCustomerNameTooShort = new Error('Customer name is too short'); // Lỗi tên người đặt quá ngắn
export const ErrCustomerNameTooLong = new Error('Customer name is too long'); // Lỗi tên người đặt quá dài
export const ErrCustomerNameInvalidFormat = new Error('Customer name has invalid format'); // Lỗi định dạng tên người đặt không hợp lệ

// 3. Định nghĩa lỗi về số điện thoại người đặt
export const ErrCustomerPhoneRequired = new Error('Customer phone is required'); // Lỗi số điện thoại người đặt bắt buộc
export const ErrCustomerPhoneInvalidFormat = new Error('Customer phone has invalid format'); // Lỗi định dạng số điện thoại người đặt không hợp lệ

// 4. Định nghĩa lỗi về thời gian đặt
export const ErrReservationTimeRequired = new Error('Reservation time is required'); // Lỗi thời gian đặt bắt buộc
export const ErrReservationTimeInvalidFormat = new Error('Reservation time has invalid format'); // Lỗi định dạng thời gian đặt không hợp lệ
export const ErrReservationTimeInPast = new Error('Reservation time cannot be in the past'); // Lỗi thời gian đặt không được ở quá khứ

// 5. Định nghĩa lỗi về số lượng khách  
export const ErrGuestCountRequired = new Error('Guest count is required'); // Lỗi số lượng khách bắt buộc
export const ErrGuestCountInvalid = new Error('Guest count must be a positive integer');

// Định nghĩa về trạng thái đặt bàn
export enum ReservationStatus {
    PENDING = 'pending', // Đang chờ xác nhận
    CONFIRMED = 'confirmed', // Đã xác nhận
    ARRIVED = 'arrived', // Đã đến
    cancelled = 'cancelled', // Đã hủy
}

// Mô hình dữ liệu đặt bàn
export const reservationSchema = z.object({
    id: z.string().uuid(),  
    userId: z.string().uuid().nullable(),
    tableId: z.string().uuid(),
    customerName: z.string().min(1, ErrCustomerNameTooShort).max(100, ErrCustomerNameTooLong),
    phone: z.string().max(20).regex(/^\+?[0-9\s\-]+$/, ErrCustomerPhoneInvalidFormat),
    time: z.date().refine(date => date > new Date(), ErrReservationTimeInPast),
    guestCount: z.number().int().positive(),
    note: z.string().max(500).nullable(),
    status: z.nativeEnum(ReservationStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Reservation = z.infer<typeof reservationSchema>;