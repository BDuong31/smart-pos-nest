import { z } from "zod";

// ============================
// Model cho Stock Check
// ============================
// Định nghĩa lỗi cho Stock Check
// 1. Lỗi chung về Stock Check
export const ErrStockCheckNotFound = new Error('Stock check not found'); // Lỗi kiểm kê tồn kho không tồn tại
export const ErrStockCheckAlreadyExists = new Error('Stock check already exists'); // Lỗi kiểm kê tồn kho đã tồn tại    

// 2. Lỗi về ngày kiểm kê của Stock Check   
export const ErrStockCheckDateInvalid = new Error('Stock check date is invalid'); // Lỗi ngày kiểm kê của

// Mô hình dữ liệu cho Stock Check
export const stockCheckSchema = z.object({
    id: z.string().uuid(),
    code: z.string().max(50),
    userId: z.string().uuid(),
    note: z.string().optional(),
    checkDate: z.date().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type StockCheck = z.infer<typeof stockCheckSchema>;