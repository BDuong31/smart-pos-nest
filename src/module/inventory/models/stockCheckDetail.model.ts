import { PublicIngredient } from "src/share/data-model";
import { z } from "zod";

// ============================
// Model cho Stock Check Detail
// ============================
// Định nghĩa lỗi cho Stock Check Detail
// 1. Lỗi chung về Stock Check Detail
export const ErrStockCheckDetailNotFound = new Error('Stock check detail not found'); // Lỗi chi tiết kiểm kê tồn kho không tồn tại
export const ErrStockCheckDetailAlreadyExists = new Error('Stock check detail already exists'); // Lỗi chi tiết kiểm kê tồn kho đã tồn tại

// 2. Lỗi về số lượng kiểm kê của hệ thống
export const ErrStockCheckDetailSystemQuantityNegative = new Error('Stock check detail system quantity cannot be negative'); // Lỗi số lượng kiểm kê của hệ thống không được âm

// 3. Lỗi về số lượng kiểm kê thực tế
export const ErrStockCheckDetailActualQuantityNegative = new Error('Stock check detail actual quantity cannot be negative'); // Lỗi số lượng kiểm kê thực tế không được âm

// 4. Lỗi về lý do chênh lệch
export const ErrStockCheckDetailDiscrepancyReasonTooLong = new Error('Stock check detail discrepancy reason is too long');

// Mô hình dữ liệu cho Stock Check Detail
export const stockCheckDetailSchema = z.object({
    id: z.string().uuid(),
    checkId: z.string().uuid(),
    ingredientId: z.string().uuid(),
    systemQty: z.number().min(0, {message: ErrStockCheckDetailSystemQuantityNegative.message}),
    actualQty: z.number().min(0, {message: ErrStockCheckDetailActualQuantityNegative.message}),
    reason: z.string().max(255, {message: ErrStockCheckDetailDiscrepancyReasonTooLong.message}).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type StockCheckDetail = z.infer<typeof stockCheckDetailSchema> & { ingredient?: PublicIngredient };