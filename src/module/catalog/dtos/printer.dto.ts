import { z } from 'zod';
import { printerSchema } from '../models/printer.model';

// ============================
// DTO cho máy in
// ============================

// Định nghĩa Schema cho tạo mới máy in
export const createPrinterDTOSchema = printerSchema.pick({
    name: true,
    ipAddress: true,
    type: true,
});

// Định nghĩa kiểu dữ liệu tạo mới máy in
export interface CreatePrinterDTO extends z.infer<typeof createPrinterDTOSchema> {}

// Định nghĩa Schema cho cập nhật máy in
export const updatePrinterDTOSchema = printerSchema.pick({
    name: true,
    ipAddress: true,
    type: true,
}).partial();

// Định nghĩa kiểu dữ liệu cập nhật máy in
export interface UpdatePrinterDTO extends z.infer<typeof updatePrinterDTOSchema> {}

// Định nghĩa Schema cho lọc máy in
export const printerCondDTOSchema = printerSchema.pick({
    name: true,
    ipAddress: true,
    type: true,
}).partial();

// Định nghĩa kiểu dữ liệu lọc máy in
export interface PrinterCondDTO extends z.infer<typeof printerCondDTOSchema> {}
