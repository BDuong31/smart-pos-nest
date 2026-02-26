import { z } from 'zod';
import { productSchema, variantSchema } from '../models/product.model';

// ============================
// DTO cho sản phẩm
// ============================

// Định nghĩa schema cho tạo sản phẩm
export const productCreatedDTOSchema = productSchema.pick({
    name: true,
    categoryId: true,
    printerId: true,  // Có thể null nếu sản phẩm không có máy in riêng
    basePrice: true,
    isActive: true,
    isCombo: true,
}).required();

// Định nghĩa kiểu dữ liệu cho tạo sản phẩm
export interface ProductCreatedDTO extends z.infer<typeof productCreatedDTOSchema> {}

// Định nghĩa schema cho cập nhật sản phẩm
export const productUpdateDTOSchema = productCreatedDTOSchema.partial();

// Định nghĩa kiểu dữ liệu cho cập nhật sản phẩm
export interface ProductUpdateDTO extends z.infer<typeof productUpdateDTOSchema> {}

// Định nghĩa schema điều kiện lọc sản phẩm
export const productCondDTOSchema = productSchema.pick({
    name: true,
    categoryId: true,
    printerId: true,
    isActive: true,
    isCombo: true,
}).partial();

// Định nghĩa kiểu dữ liệu điều kiện lọc sản phẩm
export interface ProductCondDTO extends z.infer<typeof productCondDTOSchema> {}

// Định nghĩa schema cho tạo biến thể của sản phẩm
export const variantDTOSchema = variantSchema.pick({
    productId: true,
    name: true,
    priceDiff: true,
}).required();

// Định nghĩa kiểu dữ liệu cho tạo biến thể sản phẩm
export interface VariantDTO extends z.infer<typeof variantDTOSchema> {}

// Định nghĩa schema cho cập nhật biến thể sản phẩm
export const variantUpdateDTOSchema = variantDTOSchema.partial();

// Định nghĩa kiểu dữ liệu cho cập nhật biến thể sản phẩm
export interface VariantUpdateDTO extends z.infer<typeof variantUpdateDTOSchema> {}

// Định nghĩa schema điều kiện lọc biến thể sản phẩm
export const variantCondDTOSchema = variantSchema.pick({
    productId: true,
    name: true,
}).partial();

// Định nghĩa kiểu dữ liệu điều kiện lọc biến thể sản phẩm
export interface VariantCondDTO extends z.infer<typeof variantCondDTOSchema> {}