import { z } from 'zod';
import { zoneSchema } from '../models/zone.model';

// ============================
// DTO cho khu vực
// ============================

// Định nghĩa schema cho tạo khu vực
export const zoneCreatedDTOSchema = zoneSchema.pick({
    name: true,
    description: true,
    isActive: true,
}).required();

// Định nghĩa kiểu dữ liệu cho tạo khu vực
export interface ZoneCreatedDTO extends z.infer<typeof zoneCreatedDTOSchema> {}

// Định nghĩa schema cho cập nhật khu vực (tất cả các trường đều có thể null)   
export const zoneUpdateDTOSchema = zoneSchema.pick({
    name: true,
    description: true,
    isActive: true,
}).partial();

// Định nghĩa kiểu dữ liệu cho cập nhật khu vực
export interface ZoneUpdateDTO extends z.infer<typeof zoneUpdateDTOSchema> {}   

// Định nghĩa schema điều kiện lọc khu vực
export const zoneCondDTOSchema = zoneSchema.pick({
    name: true,
    description: true,
    isActive: true,
}).partial();   

// Định nghĩa kiểu dữ liệu điều kiện lọc khu vực
export interface ZoneCondDTO extends z.infer<typeof zoneCondDTOSchema> {}