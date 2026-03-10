import { z } from "zod";
import { stockCheckDetailSchema } from "../models/stockCheckDetail.model";

// ============================
// Định nghĩa các DTO cho StockCheckDetail
// ============================

// Định nghĩa schema cho tạo chi tiết kiểm kê kho
export const stockCheckDetailCreateDTOSchema = stockCheckDetailSchema.pick({
    checkId: true, // ID kiểm kê kho
    ingredientId: true, // ID nguyên liệu
    systemQty: true, // Số lượng nguyên liệu theo hệ thống
    actualQty: true, // Số lượng nguyên liệu thực tế
    reason: true, // Lý do chênh lệch (nếu có)
}).required()

// Định nghĩa kiểu dữ liệu cho tạo chi tiết kiểm kê kho
export interface StockCheckDetailCreateDTO extends z.infer<typeof stockCheckDetailCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật chi tiết kiểm kê kho
export const stockCheckDetailUpdateDTOSchema = stockCheckDetailSchema.pick({
    checkId: true, // ID kiểm kê kho    
    ingredientId: true, // ID nguyên liệu
    systemQty: true, // Số lượng nguyên liệu theo hệ thống
    actualQty: true, // Số lượng nguyên liệu thực tế
    reason: true, // Lý do chênh lệch (nếu có)
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật chi tiết kiểm kê kho
export interface StockCheckDetailUpdateDTO extends z.infer<typeof stockCheckDetailUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn chi tiết kiểm kê kho
export const stockCheckDetailCondDTOSchema = stockCheckDetailSchema.pick({
    checkId: true, // ID kiểm kê kho    
    ingredientId: true, // ID nguyên liệu
    systemQty: true, // Số lượng nguyên liệu theo hệ thống
    actualQty: true, // Số lượng nguyên liệu thực tế
    reason: true, // Lý do chênh lệch (nếu có)
}).partial()

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn chi tiết kiểm kê kho
export interface StockCheckDetailCondDTO extends z.infer<typeof stockCheckDetailCondDTOSchema> {}  