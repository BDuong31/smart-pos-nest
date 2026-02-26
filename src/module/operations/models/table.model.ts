import { z } from 'zod';
import { ca } from 'zod/v4/locales';

// Định nghĩa lỗi về bàn
// 1. Định nghĩa lỗi chung về bàn
export const ErrTableNotFound = new Error('Table not found'); // Lỗi bàn không tồn tại
export const ErrTableAlreadyExists = new Error('Table already exists'); // Lỗi bàn đã tồn tại   
export const ErrTableInUse = new Error('Table is currently in use'); // Lỗi bàn đang được sử dụng

// 2. Định nghĩa lỗi về tên bàn
export const ErrTableNameRequired = new Error('Table name is required'); // Lỗi tên bàn bắt buộc
export const ErrTableNameTooShort = new Error('Table name is too short'); // Lỗi tên bàn quá ngắn
export const ErrTableNameTooLong = new Error('Table name is too long'); // Lỗi tên bàn quá dài
export const ErrTableNameInvalidFormat = new Error('Table name has invalid format'); // Lỗi định dạng tên bàn không hợp lệ

// Định nghĩa trạng thái của bàn
export enum TableStatus {
    AVAILABLE = 'available', 
    OCCUPIED = 'occupied', 
    RESERVED = 'reserved',
    MAINTENANCE = 'maintenance',
}

// Mô hình dữ liệu bàn
export const tableSchema = z.object({
    id: z.string().uuid(),
    zoneId: z.string().uuid(),
    name: z.string().min(1, ErrTableNameTooShort).max(50, ErrTableNameTooLong),
    qrCode: z.string().max(100),
    capacity: z.number().int().positive(),
    isActive: z.boolean(),
    status: z.nativeEnum(TableStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Table = z.infer<typeof tableSchema>;
