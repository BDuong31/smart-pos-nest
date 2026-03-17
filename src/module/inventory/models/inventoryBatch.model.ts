import { PublicIngredient } from "src/share/data-model";
import { z } from "zod";

// ============================
// Model cho Inventory Batch
// ============================

// Định nghĩa lỗi cho Inventory Batch
// 1. Lỗi chung về Inventory Batch
export const ErrInventoryBatchNotFound = new Error('Inventory batch not found'); // Lỗi lô hàng tồn kho không tồn tại
export const ErrInventoryBatchAlreadyExists = new Error('Inventory batch already exists'); // Lỗi lô hàng tồn kho đã tồn tại

// 2. Lỗi về số lượng của lô hàng tồn kho
export const ErrInventoryBatchQuantityNegative = new Error('Inventory batch quantity cannot be negative'); // Lỗi số lượng của lô hàng tồn kho không được âm

// 3. Lỗi về ngày hết hạn của lô hàng tồn kho
export const ErrInventoryBatchExpirationDateInvalid = new Error('Inventory batch expiration date is invalid'); // Lỗi ngày hết hạn của

// 4. Lỗi về ngày nhập của lô hàng tồn kho
export const ErrInventoryBatchEntryDateInvalid = new Error('Inventory batch entry date is invalid'); // Lỗi ngày nhập của lô hàng tồn kho không hợp lệ

// Mô hình dữ liệu cho Inventory Batch
export const inventoryBatchSchema = z.object({
    id: z.string().uuid(),
    ingredientId: z.string().uuid(),
    quantity: z.number().min(0, {message: ErrInventoryBatchQuantityNegative.message}),
    expiryDate: z.date(),
    importDate: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type InventoryBatch = z.infer<typeof inventoryBatchSchema> & { ingredient?: PublicIngredient };