import { z } from "zod";

// ============================
// Model cho Supplier
// ============================

// Định nghĩa lỗi cho Supplier
// 1. Lỗi chung về Supplier
export const ErrSupplierNotFound = new Error('Supplier not found'); // Lỗi nhà cung cấp không tồn tại
export const ErrSupplierAlreadyExists = new Error('Supplier already exists'); // Lỗi nhà cung cấp đã tồn tại

// 2. Lỗi về tên nhà cung cấp
export const ErrSupplierNameRequired = new Error('Supplier name is required'); // Lỗi tên nhà cung cấp bắt buộc
export const ErrSupplierNameTooShort = new Error('Supplier name is too short'); // Lỗi tên nhà cung cấp quá ngắn
export const ErrSupplierNameTooLong = new Error('Supplier name is too long'); // Lỗi tên nhà cung cấp quá dài

// 3. Lỗi về liên hệ của nhà cung cấp
export const ErrSupplierContactRequired = new Error('Supplier contact is required');    
export const ErrSupplierContactTooShort = new Error('Supplier contact is too short'); // Lỗi thông tin liên hệ của nhà cung cấp quá ngắn    
export const ErrSupplierContactTooLong = new Error('Supplier contact is too long'); // Lỗi thông tin liên hệ của nhà cung cấp quá dài

// Mô hình dữ liệu cho Supplier 
export const supplierSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, {message: ErrSupplierNameRequired.message}).max(100, {message: ErrSupplierNameTooLong.message}),
    contact: z.string().min(1, {message: ErrSupplierContactRequired.message}).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Supplier = z.infer<typeof supplierSchema>;