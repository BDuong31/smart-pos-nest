import { z } from "zod";
import { recipeSchema } from "../models/recipe.model";

// ============================
// Model cho Recipe
// ============================

// Định nghĩa schema cho tạo công thức
export const recipeCreateDTOSchema = recipeSchema.pick({
    ingredientId: true,
    amount: true,
    productId: true,
    variantId: true,
    optionItemId: true,
}).partial().refine(data => {
    // Kiểm tra nếu variantId tồn tại thì productId phải tồn tại và optionItemId phải không tồn tại
    if (data.variantId) {
        return data.productId && !data.optionItemId;
    }
    // Kiểm tra nếu optionItemId tồn tại thì productId phải tồn tại và variantId phải không tồn tại
    if (data.optionItemId) {
        return data.productId && !data.variantId;
    }   

    return true; // Nếu không có productId, variantId, optionItemId nào được cung cấp thì vẫn hợp lệ
}, {
    message: 'Invalid combination of productId, variantId, and optionItemId. Only one of them can be provided at a time.',  
})

// Định nghĩa kiểu dữ liệu cho tạo công thức
export interface RecipeCreateDTO extends z.infer<typeof recipeCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật công thức
export const recipeUpdateDTOSchema = recipeSchema.pick({
    ingredientId: true,
    amount: true,
    productId: true,
    variantId: true,
    optionItemId: true,
}).partial().refine(data => {
    
    // Kiểm tra nếu variantId tồn tại thì productId phải tồn tại và optionItemId phải không tồn tại 
    if (data.variantId) {
        return data.productId && !data.optionItemId;
    }   

    // Kiểm tra nếu optionItemId tồn tại thì productId phải tồn tại và variantId phải không tồn tại
    if (data.optionItemId) {
        return data.productId && !data.variantId;
    }

    return true; // Nếu không có productId, variantId, optionItemId nào được cung cấp thì vẫn hợp lệ
}, {      
    message: 'Invalid combination of productId, variantId, and optionItemId. Only one of them can be provided at a time.',  
})

// Định nghĩa kiểu dữ liệu cho cập nhật công thức
export interface RecipeUpdateDTO extends z.infer<typeof recipeUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn công thức
export const recipeCondDTOSchema = recipeSchema.pick({
    ingredientId: true,
    amount: true,
    productId: true,
    variantId: true,
    optionItemId: true,
}).partial()

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn công thức
export interface RecipeCondDTO extends z.infer<typeof recipeCondDTOSchema> {}
