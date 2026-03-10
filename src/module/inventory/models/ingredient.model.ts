import { z } from "zod";

// ============================
// Model cho Ingredient
// ============================

// Định nghĩa lỗi cho Ingredient
// 1. Lỗi chung về Ingredient
export const ErrIngredientNotFound = new Error('Ingredient not found'); // Lỗi nguyên liệu không tồn tại
export const ErrIngredientAlreadyExists = new Error('Ingredient already exists'); // Lỗi nguyên liệu đã tồn tại

// 2. Lỗi về tên nguyên liệu
export const ErrIngredientNameRequired = new Error('Ingredient name is required'); // Lỗi tên nguyên liệu bắt buộc
export const ErrIngredientNameTooShort = new Error('Ingredient name is too short'); // Lỗi tên nguyên liệu quá ngắn
export const ErrIngredientNameTooLong = new Error('Ingredient name is too long'); // Lỗi tên nguyên liệu quá dài

// 3. Lỗi về đơn vị cơ sở của nguyên liệu
export const ErrIngredientBaseUnitRequired = new Error('Ingredient base unit is required'); // Lỗi đơn vị cơ sở của nguyên liệu bắt buộc
export const ErrIngredientBaseUnitTooShort = new Error('Ingredient base unit is too short'); // Lỗi đơn vị cơ sở của nguyên liệu quá ngắn
export const ErrIngredientBaseUnitTooLong = new Error('Ingredient base unit is too long'); // Lỗi đơn vị cơ sở của nguyên liệu quá dài

// 4. Lỗi về tồn kho nhỏ nhất của nguyên liệu
export const ErrIngredientMinStockNegative = new Error('Ingredient minimum stock cannot be negative'); // Lỗi tồn kho nhỏ nhất của nguyên liệu không được âm

// 5. Lỗi về id dữ liệu dự báo của nguyên liệu
export const ErrIngredientForecastDataIdInvalid = new Error('Ingredient forecast data ID is invalid'); // Lỗi id dữ liệu dự báo của nguyên liệu không hợp lệ

// Mô hình dữ liệu cho Ingredient
export const ingredientSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, {message: ErrIngredientNameRequired.message}).max(100, {message: ErrIngredientNameTooLong.message}),
    baseUnit: z.string().min(1, {message: ErrIngredientBaseUnitRequired.message}).max(50, {message: ErrIngredientBaseUnitTooLong.message}),
    minStock: z.number().min(0, {message: ErrIngredientMinStockNegative.message}),
    forecastDataId: z.string().uuid().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Ingredient = z.infer<typeof ingredientSchema>;

