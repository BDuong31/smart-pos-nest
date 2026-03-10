import { z } from "zod";

// ============================
// Model cho Recipe
// ============================

// Định nghĩa lỗi cho Recipe
// 1. Lỗi chung về Recipe
export const ErrRecipeNotFound = new Error('Recipe not found'); // Lỗi công thức không tồn tại
export const ErrRecipeAlreadyExists = new Error('Recipe already exists'); // Lỗi công thức đã tồn tại

// 2. Lỗi về định lượng của công thức
export const ErrRecipeAmountNegative = new Error('Recipe amount cannot be negative'); // Lỗi định lượng của công thức không được âm

// Mô hình dữ liệu cho Recipe
export const recipeSchema = z.object({
    id: z.string().uuid(),  
    ingredientId: z.string().uuid(),
    amount: z.number().min(0, {message: ErrRecipeAmountNegative.message}),
    productId: z.string().uuid().optional(),
    variantId: z.string().uuid().optional(),
    optionItemId: z.string().uuid().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
})  

export type Recipe = z.infer<typeof recipeSchema>;

