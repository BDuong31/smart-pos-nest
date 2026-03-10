import { z } from "zod";
import { ingredientSchema } from "../models/ingredient.model";

// ============================
// Định nghĩa các DTO cho Ingredient
// ============================

// Định nghĩa schema cho tạo nguyên liệu    
export const ingredientCreateDTOSchema = ingredientSchema.pick({
    name: true, // Tên nguyên liệu
    baseUnit: true, // Đơn vị cơ sở của nguyên liệu
}).extend({
    minStock: z.number().min(0, 'Minimum stock of ingredient cannot be negative').optional(), // Tồn kho nhỏ nhất của nguyên liệu, mặc định là 0
    forecastDataId: z.string().uuid().optional(), // ID dữ liệu dự báo của nguyên liệu, có thể để trống nếu không có dữ liệu dự báo
}).required()

// Định nghĩa kiểu dữ liệu cho tạo nguyên liệu
export interface IngredientCreateDTO extends z.infer<typeof ingredientCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật nguyên liệu   
export const ingredientUpdateDTOSchema = ingredientSchema.pick({
    name: true, // Tên nguyên liệu
    baseUnit: true, // Đơn vị cơ sở của nguyên liệu 
}).extend({
    minStock: z.number().min(0, 'Minimum stock of ingredient cannot be negative').optional(), // Tồn kho nhỏ nhất của nguyên liệu, có thể để trống nếu không cập nhật
    forecastDataId: z.string().uuid().optional(), // ID dữ liệu dự báo của nguyên liệu, có thể để trống nếu không cập nhật
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật nguyên liệu
export interface IngredientUpdateDTO extends z.infer<typeof ingredientUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn nguyên liệu 
export const ingredientCondDTOSchema = ingredientSchema.pick({
    name: true, // Tên nguyên liệu
    baseUnit: true, // Đơn vị cơ sở của nguyên liệu
    minStock: true, // Tồn kho nhỏ nhất của nguyên liệu
    forecastDataId: true, // ID dữ liệu dự báo của nguyên liệu
}).partial()

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn nguyên liệu
export interface IngredientCondDTO extends z.infer<typeof ingredientCondDTOSchema> {}   