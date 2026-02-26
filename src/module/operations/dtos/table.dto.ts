import { z } from 'zod';
import { tableSchema } from '../models/table.model';

// ============================
// DTO cho bàn
// ============================

// Định nghĩa schema cho tạo bàn
export const tableCreatedDTOSchema = tableSchema.pick({
    zoneId: true,
    name: true,
    qrCode: true,
    capacity: true,
    isActive: true,
}).required();

// Định nghĩa kiểu dữ liệu cho tạo bàn
export interface TableCreatedDTO extends z.infer<typeof tableCreatedDTOSchema> {}

// Định nghĩa schema cho cập nhật bàn (tất cả các trường đều có thể null)   
export const tableUpdateDTOSchema = tableSchema.pick({
    zoneId: true,
    name: true,
    qrCode: true,   
    capacity: true,
    isActive: true,
    status: true,
}).partial();   

// Định nghĩa kiểu dữ liệu cho cập nhật bàn
export interface TableUpdateDTO extends z.infer<typeof tableUpdateDTOSchema> {}

// Định nghĩa schema điều kiện lọc bàn
export const tableCondDTOSchema = tableSchema.pick({
    zoneId: true,
    name: true,
    qrCode: true,   
    capacity: true,
    isActive: true,
    status: true,
}).partial();

// Định nghĩa kiểu dữ liệu điều kiện lọc bàn
export interface TableCondDTO extends z.infer<typeof tableCondDTOSchema> {} 