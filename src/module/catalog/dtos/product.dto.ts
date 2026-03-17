import { z } from 'zod';
import { productSchema, variantSchema, comboSchema, comboItemSchema } from '../models/product.model';

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

// ============================
// DTO cho biến thể sản phẩm
// ============================

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

// ============================
// DTO cho combo sản phẩm
// ============================

// Định nghĩa schema cho tạo combo sản phẩm
export const comboCreateDTOSchema = comboSchema.pick({
    name: true,
    price: true,
}).required();

// Định nghĩa kiểu dữ liệu cho tạo combo sản phẩm
export interface ComboCreateDTO extends z.infer<typeof comboCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật combo sản phẩm
export const comboUpdateDTOSchema = comboSchema.pick({
    name: true,
    price: true,
}).partial();

// Định nghĩa kiểu dữ liệu cho cập nhật combo sản phẩm
export interface ComboUpdateDTO extends z.infer<typeof comboUpdateDTOSchema> {}

// Định nghĩa schema điều kiện lọc combo sản phẩm
export const comboCondDTOSchema = comboSchema.pick({
    name: true,
    price: true,
}).partial();

// Định nghĩa kiểu dữ liệu điều kiện lọc combo sản phẩm
export interface ComboCondDTO extends z.infer<typeof comboCondDTOSchema> {}

// ============================
// DTO cho mục combo sản phẩm
// ============================

// Định nghĩa schema cho tạo mục combo sản phẩm
export const comboItemCreateDTOSchema = comboItemSchema.pick({
    comboId: true,
    productId: true,
    variantId: true,
    quantity: true,
}).required();

// Định nghĩa kiểu dữ liệu cho tạo mục combo sản phẩm
export interface ComboItemCreateDTO extends z.infer<typeof comboItemCreateDTOSchema> {} 

// Định nghĩa schema cho cập nhật mục combo sản phẩm
export const comboItemUpdateDTOSchema = comboItemSchema.pick({
    comboId: true,
    productId: true,
    variantId: true,
    quantity: true,
}).partial();

// Định nghĩa kiểu dữ liệu cho cập nhật mục combo sản phẩm
export interface ComboItemUpdateDTO extends z.infer<typeof comboItemUpdateDTOSchema> {}

// Định nghĩa schema điều kiện lọc mục combo sản phẩm
export const comboItemCondDTOSchema = comboItemSchema.pick({
    comboId: true,
    productId: true,
    variantId: true,
    quantity: true,
}).partial();

// Định nghĩa kiểu dữ liệu điều kiện lọc mục combo sản phẩm
export interface ComboItemCondDTO extends z.infer<typeof comboItemCondDTOSchema> {}