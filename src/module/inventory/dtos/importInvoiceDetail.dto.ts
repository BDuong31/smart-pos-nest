import { z } from "zod";
import { importInvoiceDetailSchema } from "../models/importInvoiceDetail.model";

// ============================
// Định nghĩa các DTO cho ImportInvoiceDetail
// ============================

// Định nghĩa schema cho tạo chi tiết phiếu nhập kho
export const importInvoiceDetailCreateDTOSchema = importInvoiceDetailSchema.pick({
    invoiceId: true, // ID phiếu nhập kho
    ingredientId: true, // ID nguyên liệu
    quantity: true, // Số lượng nguyên liệu nhập kho
    unit: true, // Đơn vị của nguyên liệu nhập kho
    unitPrice: true, // Đơn giá của nguyên liệu nhập kho
}).required()

// Định nghĩa kiểu dữ liệu cho tạo chi tiết phiếu nhập kho
export interface ImportInvoiceDetailCreateDTO extends z.infer<typeof importInvoiceDetailCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật chi tiết phiếu nhập kho
export const importInvoiceDetailUpdateDTOSchema = importInvoiceDetailSchema.pick({
    invoiceId: true, // ID phiếu nhập kho
    ingredientId: true, // ID nguyên liệu
    quantity: true, // Số lượng nguyên liệu nhập kho
    unit: true, // Đơn vị của nguyên liệu nhập kho
    unitPrice: true, // Đơn giá của nguyên liệu nhập kho
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật chi tiết phiếu nhập kho
export interface ImportInvoiceDetailUpdateDTO extends z.infer<typeof importInvoiceDetailUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn chi tiết phiếu nhập kho
export const importInvoiceDetailCondDTOSchema = importInvoiceDetailSchema.pick({
    invoiceId: true, // ID phiếu nhập kho
    ingredientId: true, // ID nguyên liệu
    quantity: true, // Số lượng nguyên liệu nhập kho
    unit: true, // Đơn vị của nguyên liệu nhập kho
    unitPrice: true, // Đơn giá của nguyên liệu nhập kho
}).partial()

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn chi tiết phiếu nhập kho
export interface ImportInvoiceDetailCondDTO extends z.infer<typeof importInvoiceDetailCondDTOSchema> {}