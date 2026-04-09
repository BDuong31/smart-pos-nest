import { PublicSupplier } from "src/share";
import { z } from "zod";

// ============================
// Model cho Import Invoice
// ============================
// Định nghĩa lỗi cho Import Invoice
// 1. Lỗi chung về Import Invoice
export const ErrImportInvoiceNotFound = new Error('Import invoice not found'); // Lỗi phiếu nhập kho không tồn tại
export const ErrImportInvoiceAlreadyExists = new Error('Import invoice already exists'); // Lỗi phiếu nhập kho đã tồn tại

// 2. Lỗi về tổng tiền của phiếu nhập kho
export const ErrImportInvoiceTotalCostNegative = new Error('Import invoice total cost cannot be negative'); // Lỗi tổng tiền của phiếu nhập kho không được âm

// 3. Lỗi về ngày nhập của phiếu nhập kho
export const ErrImportInvoiceImportDateInvalid = new Error('Import invoice import date is invalid'); // Lỗi ngày nhập của phiếu nhập kho không hợp lệ

// Mô hình dữ liệu cho Import Invoice
export const importInvoiceSchema = z.object({
    id: z.string().uuid(),
    code: z.string().max(50),
    supplierId: z.string().uuid(),
    totalCost: z.number().min(0, {message: ErrImportInvoiceTotalCostNegative.message}),
    importDate: z.coerce.date().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type ImportInvoice = z.infer<typeof importInvoiceSchema> & {supplier?: PublicSupplier};