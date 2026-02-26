import z from "zod";
import { de, is } from "zod/v4/locales";

// Định nghĩa lỗi về khu vực
// 1. Định nghĩa lỗi chung về khu vực
export const ErrZoneNotFound = new Error('Zone not found'); // Lỗi khu vực không tồn tại
export const ErrZoneAlreadyExists = new Error('Zone already exists'); // Lỗi khu vực đã tồn tại 

// 2. Định nghĩa lỗi về tên khu vực
export const ErrZoneNameRequired = new Error('Zone name is required'); // Lỗi tên khu vực bắt buộc
export const ErrZoneNameTooShort = new Error('Zone name is too short'); // Lỗi tên khu vực quá ngắn
export const ErrZoneNameTooLong = new Error('Zone name is too long'); // Lỗi tên khu vực quá dài
export const ErrZoneNameInvalidFormat = new Error('Zone name has invalid format'); // Lỗi định dạng tên khu vực không hợp lệ

// Mô hình dữ liệu khu vực
export const zoneSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, ErrZoneNameTooShort).max(50, ErrZoneNameTooLong),
    description: z.string().max(500).nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Zone = z.infer<typeof zoneSchema>;