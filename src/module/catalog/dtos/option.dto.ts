import { z } from 'zod';
import { optionGroup, optionItem, productOptionConfig } from '../models/option.model';

// ============================
// DTO cho Option
// ============================

// Định nghĩa Schema cho tạo mới Option Group
export const createOptionGroupDTOSchema = optionGroup.pick({
    name: true,
    isMultiSelect: true,
});

// Định nghĩa kiểu dữ liệu tạo mới Option Group
export interface CreateOptionGroupDTO extends z.infer<typeof createOptionGroupDTOSchema> {}

// Định nghĩa Schema cho cập nhật Option Group
export const updateOptionGroupDTOSchema = optionGroup.pick({
    name: true,
    isMultiSelect: true,
}).partial();

// Định nghĩa kiểu dữ liệu cập nhật Option Group
export interface UpdateOptionGroupDTO extends z.infer<typeof updateOptionGroupDTOSchema> {}

// Định nghĩa Schema cho lọc Option Group
export const optionGroupCondDTOSchema = optionGroup.pick({
    name: true,
}).partial();

// Định nghĩa kiểu dữ liệu lọc Option Group
export interface OptionGroupCondDTO extends z.infer<typeof optionGroupCondDTOSchema> {}

// Định nghĩa Schema cho tạo mới Option Item
export const createOptionItemDTOSchema = optionItem.pick({
    groupId: true,
    name: true,
    priceExtra: true,
});

// Định nghĩa kiểu dữ liệu tạo mới Option Item
export interface CreateOptionItemDTO extends z.infer<typeof createOptionItemDTOSchema> {}

// Định nghĩa Schema cho cập nhật Option Item
export const updateOptionItemDTOSchema = optionItem.pick({
    groupId: true,
    name: true,
    priceExtra: true,
}).partial();

// Định nghĩa kiểu dữ liệu cập nhật Option Item
export interface UpdateOptionItemDTO extends z.infer<typeof updateOptionItemDTOSchema> {}

// Định nghĩa Schema cho lọc Option Item
export const optionItemCondDTOSchema = optionItem.pick({
    groupId: true,
    name: true,
}).partial();

// Định nghĩa kiểu dữ liệu lọc Option Item
export interface OptionItemCondDTO extends z.infer<typeof optionItemCondDTOSchema> {}

// Định nghĩa Schema cho tạo mới Product Option Config
export const createProductOptionConfigDTOSchema = productOptionConfig.pick({
    productId: true,
    optionGroupId: true,
});

// Định nghĩa kiểu dữ liệu tạo mới Product Option Config
export interface CreateProductOptionConfigDTO extends z.infer<typeof createProductOptionConfigDTOSchema> {}

// Định nghĩa Schema cho cập nhật Product Option Config
export const updateProductOptionConfigDTOSchema = productOptionConfig.pick({
    productId: true,
    optionGroupId: true,
}).partial();

// Định nghĩa kiểu dữ liệu cập nhật Product Option Config
export interface UpdateProductOptionConfigDTO extends z.infer<typeof updateProductOptionConfigDTOSchema> {}

// Định nghĩa Schema cho lọc Product Option Config
export const productOptionConfigCondDTOSchema = productOptionConfig.pick({
    productId: true,
    optionGroupId: true,
}).partial();

// Định nghĩa kiểu dữ liệu lọc Product Option Config
export interface ProductOptionConfigCondDTO extends z.infer<typeof productOptionConfigCondDTOSchema> {}