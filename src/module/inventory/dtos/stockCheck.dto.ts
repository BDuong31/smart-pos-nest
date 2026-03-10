import { z } from "zod";
import { stockCheckSchema } from "../models/stockCheck.model";

// ============================
// Định nghĩa các DTO cho StockCheck
// ============================

// Định nghĩa schema cho tạo kiểm kê kho
export const stockCheckCreateDTOSchema = stockCheckSchema.pick({
    code: true, // Mã kiểm kê kho
    userId: true, // ID người thực hiện kiểm kê kho
    note: true, // Ghi chú cho kiểm kê kho
}).partial({ userId: true })

// Định nghĩa kiểu dữ liệu cho tạo kiểm kê kho
export interface StockCheckCreateDTO extends z.infer<typeof stockCheckCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật kiểm kê kho
export const stockCheckUpdateDTOSchema = stockCheckSchema.pick({
    userId: true, // ID người thực hiện kiểm kê kho
    note: true, // Ghi chú cho kiểm kê kho
    code: true, // Mã kiểm kê kho
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật kiểm kê kho
export interface StockCheckUpdateDTO extends z.infer<typeof stockCheckUpdateDTOSchema> {}   

// Định nghĩa schema cho điều kiện truy vấn kiểm kê kho
export const stockCheckCondDTOSchema = stockCheckSchema.pick({
    code: true, // Mã kiểm kê kho
    userId: true, // ID người thực hiện kiểm kê kho
    note: true, // Ghi chú cho kiểm kê kho
    checkDate: true, // Ngày kiểm kê kho
}).partial()

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn kiểm kê kho
export interface StockCheckCondDTO extends z.infer<typeof stockCheckCondDTOSchema> {}