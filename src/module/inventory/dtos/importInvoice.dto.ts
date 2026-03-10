import { z } from "zod";
import { importInvoiceSchema } from "../models/importInvoice.model";

// ============================
// Định nghĩa các DTO cho ImportInvoice
// ============================

// Định nghĩa schema cho tạo phiếu nhập kho
export const importInvoiceCreateDTOSchema = importInvoiceSchema.pick({
    code: true, // Mã phiếu nhập kho
    supplierId: true, // ID nhà cung cấp
    totalCost: true, // Tổng chi phí của phiếu nhập kho
    importDate: true, // Ngày nhập kho
}).required()

// Định nghĩa kiểu dữ liệu cho tạo phiếu nhập kho
export interface ImportInvoiceCreateDTO extends z.infer<typeof importInvoiceCreateDTOSchema> {} 

// Định nghĩa schema cho cập nhật phiếu nhập kho
export const importInvoiceUpdateDTOSchema = importInvoiceSchema.pick({
    code: true, // Mã phiếu nhập kho
    supplierId: true, // ID nhà cung cấp
    totalCost: true, // Tổng chi phí của phiếu nhập kho
    importDate: true, // Ngày nhập kho
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật phiếu nhập kho
export interface ImportInvoiceUpdateDTO extends z.infer<typeof importInvoiceUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn phiếu nhập kho
export const importInvoiceCondDTOSchema = importInvoiceSchema.pick({
    code: true, // Mã phiếu nhập kho
    supplierId: true, // ID nhà cung cấp
    totalCost: true, // Tổng chi phí của phiếu nhập kho
    importDate: true, // Ngày nhập kho
}).partial()

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn phiếu nhập kho
export interface ImportInvoiceCondDTO extends z.infer<typeof importInvoiceCondDTOSchema> {}