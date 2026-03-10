import { z } from "zod";
import { inventoryBatchSchema } from "../models/inventoryBatch.model";

// ============================
// Định nghĩa các DTO cho InventoryBatch
// ============================

// Định nghĩa schema cho tạo lô hàng tồn kho
export const inventoryBatchCreateDTOSchema = inventoryBatchSchema.pick({
    ingredientId: true, // ID nguyên liệu   
    quantity: true, // Số lượng nguyên liệu trong lô hàng
    expiryDate: true, // Ngày hết hạn của lô hàng
    importDate: true, // Ngày nhập kho của lô hàn
}).required()

// Định nghĩa kiểu dữ liệu cho tạo lô hàng tồn kho
export interface InventoryBatchCreateDTO extends z.infer<typeof inventoryBatchCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật lô hàng tồn kho
export const inventoryBatchUpdateDTOSchema = inventoryBatchSchema.pick({
    ingredientId: true, // ID nguyên liệu   
    quantity: true, // Số lượng nguyên liệu trong lô hàng
    expiryDate: true, // Ngày hết hạn của lô hàng
    importDate: true, // Ngày nhập kho của lô hàn
}).partial()    

// Định nghĩa kiểu dữ liệu cho cập nhật lô hàng tồn kho
export interface InventoryBatchUpdateDTO extends z.infer<typeof inventoryBatchUpdateDTOSchema> {}   

// Định nghĩa schema cho điều kiện truy vấn lô hàng tồn kho 
export const inventoryBatchCondDTOSchema = inventoryBatchSchema.pick({
    ingredientId: true, // ID nguyên liệu   
    quantity: true, // Số lượng nguyên liệu trong lô hàng
    expiryDate: true, // Ngày hết hạn của lô hàng
    importDate: true, // Ngày nhập kho của lô hàn
}).partial()

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn lô hàng tồn kho
export interface InventoryBatchCondDTO extends z.infer<typeof inventoryBatchCondDTOSchema> {}