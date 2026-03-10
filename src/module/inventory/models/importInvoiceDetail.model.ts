import { z } from "zod";

// ============================
// Model cho Import Invoice Detail
// ============================
// Định nghĩa lỗi cho Import Invoice Detail
// 1. Lỗi chung về Import Invoice Detail
export const ErrImportInvoiceDetailNotFound = new Error('Import invoice detail not found'); // Lỗi chi tiết phiếu nhập kho không tồn tại
export const ErrImportInvoiceDetailAlreadyExists = new Error('Import invoice detail already exists'); // Lỗi chi tiết phiếu nhập kho đã tồn tại

// 2. Lỗi về số lượng của chi tiết phiếu nhập kho
export const ErrImportInvoiceDetailQuantityNegative = new Error('Import invoice detail quantity cannot be negative'); // Lỗi số lượng của chi tiết phiếu nhập kho không được âm 

// 3. Lỗi về đơn vị của chi tiết phiếu nhập kho
export const ErrImportInvoiceDetailUnitRequired = new Error('Import invoice detail unit is required'); // Lỗi đơn vị của chi tiết phiếu nhập kho bắt buộc
export const ErrImportInvoiceDetailUnitTooShort = new Error('Import invoice detail unit is too short'); // Lỗi đơn vị của chi tiết phiếu nhập kho quá ngắn
export const ErrImportInvoiceDetailUnitTooLong = new Error('Import invoice detail unit is too long'); // Lỗi đơn vị của chi tiết phiếu nhập kho quá dài

// 4. Lỗi về giá của đơn vị của chi tiết phiếu nhập kho
export const ErrImportInvoiceDetailUnitPriceNegative = new Error('Import invoice detail unit price cannot be negative');    // Lỗi giá của đơn vị của chi tiết phiếu nhập kho không được âm

// Mô hình dữ liệu cho Import Invoice Detail
export const importInvoiceDetailSchema = z.object({
    id: z.string().uuid(),  
    invoiceId: z.string().uuid(),
    ingredientId: z.string().uuid(),
    quantity: z.number().min(0, {message: ErrImportInvoiceDetailQuantityNegative.message}),
    unit: z.string().min(1, {message: ErrImportInvoiceDetailUnitRequired.message}).max(50, {message: ErrImportInvoiceDetailUnitTooLong.message}),
    unitPrice: z.number().min(0, {message: ErrImportInvoiceDetailUnitPriceNegative.message}),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type ImportInvoiceDetail = z.infer<typeof importInvoiceDetailSchema>;