import { z } from "zod";
import { unitConversionSchema } from "../models/unitConversion.model";

// ============================
// Định nghĩa các DTO cho UnitConversion
// ============================

// Định nghĩa schema cho tạo quy đổi đơn vị
export const unitConversionCreateDTOSchema = unitConversionSchema.pick({
    ingredientId: true, // ID nguyên liệu
    fromUnit: true, // Đơn vị gốc
    toUnit: true, // Đơn vị đích
    factor: true, // Hệ số quy đổi từ đơn vị gốc sang đơn vị đích
}).required()

// Định nghĩa kiểu dữ liệu cho tạo quy đổi đơn vị
export interface UnitConversionCreateDTO extends z.infer<typeof unitConversionCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật quy đổi đơn vị
export const unitConversionUpdateDTOSchema = unitConversionSchema.pick({
    ingredientId: true, // ID nguyên liệu
    fromUnit: true, // Đơn vị gốc
    toUnit: true, // Đơn vị đích
    factor: true, // Hệ số quy đổi từ đơn vị gốc sang đơn vị đích
}).partial()    

// Định nghĩa kiểu dữ liệu cho cập nhật quy đổi đơn vị
export interface UnitConversionUpdateDTO extends z.infer<typeof unitConversionUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn quy đổi đơn vị
export const unitConversionCondDTOSchema = unitConversionSchema.pick({
    ingredientId: true, // ID nguyên liệu
    fromUnit: true, // Đơn vị gốc
    toUnit: true, // Đơn vị đích
    factor: true, // Hệ số quy đổi từ đơn vị gốc sang đơn vị đích
}).partial()

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn quy đổi đơn vị
export interface UnitConversionCondDTO extends z.infer<typeof unitConversionCondDTOSchema> {}
