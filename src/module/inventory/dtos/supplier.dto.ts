import { z } from "zod";
import { supplierSchema } from "../models/supplier.model";

// ============================
// Định nghĩa các DTO cho Supplier
// ============================

// Định nghĩa schema cho tạo nhà cung cấp
export const supplierCreateDTOSchema = supplierSchema.pick({
    name: true, // Tên nhà cung cấp
    contact: true, // Thông tin liên hệ của nhà cung cấp
}).required()   

// Định nghĩa kiểu dữ liệu cho tạo nhà cung cấp
export interface SupplierCreateDTO extends z.infer<typeof supplierCreateDTOSchema> {}   

// Định nghĩa schema cho cập nhật nhà cung cấp  
export const supplierUpdateDTOSchema = supplierSchema.pick({    
    name: true, // Tên nhà cung cấp
    contact: true, // Thông tin liên hệ của nhà cung cấp
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật nhà cung cấp
export interface SupplierUpdateDTO extends z.infer<typeof supplierUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn nhà cung cấp
export const supplierCondDTOSchema = supplierSchema.pick({
    name: true, // Tên nhà cung cấp
    contact: true, // Thông tin liên hệ của nhà cung cấp
}).partial()

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn nhà cung cấp
export interface SupplierCondDTO extends z.infer<typeof supplierCondDTOSchema> {}