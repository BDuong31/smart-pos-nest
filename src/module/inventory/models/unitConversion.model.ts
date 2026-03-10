import { z } from "zod";

// ============================
// Model cho Unit Conversion
// ============================

// Định nghĩa lỗi cho Unit Conversion
// 1. Lỗi chung về Unit Conversion
export const ErrUnitConversionNotFound = new Error('Unit conversion not found'); // Lỗi chuyển đổi đơn vị không tồn tại
export const ErrUnitConversionAlreadyExists = new Error('Unit conversion already exists'); // Lỗi chuyển đổi đơn vị đã tồn tại  

// 2. Lỗi về đơn vị gốc và đơn vị đích
export const ErrUnitConversionFromUnitRequired = new Error('From unit is required'); // Lỗi đơn vị gốc bắt buộc
export const ErrUnitConversionToUnitRequired = new Error('To unit is required'); // Lỗi đơn vị đích bắt buộc
export const ErrUnitConversionFromUnitTooShort = new Error('From unit is too short'); // Lỗi đơn vị gốc quá ngắn
export const ErrUnitConversionToUnitTooShort = new Error('To unit is too short'); // Lỗi đơn vị đích quá ngắn
export const ErrUnitConversionFromUnitTooLong = new Error('From unit is too long'); // Lỗi đơn vị gốc quá dài
export const ErrUnitConversionToUnitTooLong = new Error('To unit is too long'); // Lỗi đơn vị đích quá dài  
export const ErrUnitConversionFromUnitSameAsToUnit = new Error('From unit cannot be the same as to unit'); // Lỗi đơn vị gốc không được giống đơn vị đích

// 3. Lỗi về hệ số chuyển đổi
export const ErrUnitConversionFactorNegative = new Error('Conversion factor cannot be negative'); // Lỗi hệ số chuyển đổi không được âm
export const ErrUnitConversionFactorZero = new Error('Conversion factor cannot be zero'); // Lỗi hệ số chuyển đổi không được bằng 0

// Mô hình dữ liệu cho Unit Conversion
export const unitConversionSchema = z.object({
    id: z.string().uuid(),
    ingredientId: z.string().uuid(), // ID nguyên liệu  
    fromUnit: z.string().min(1, {message: ErrUnitConversionFromUnitRequired.message}).max(50, {message: ErrUnitConversionFromUnitTooLong.message}),
    toUnit: z.string().min(1, {message: ErrUnitConversionToUnitRequired.message}).max(50, {message: ErrUnitConversionToUnitTooLong.message}),
    factor: z.number().positive({message: ErrUnitConversionFactorNegative.message}).refine(val => val !== 0, {message: ErrUnitConversionFactorZero.message}),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type UnitConversion = z.infer<typeof unitConversionSchema>;