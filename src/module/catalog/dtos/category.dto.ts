import { z } from 'zod';
import { categorySchema } from '../models/category.model';

// ============================
// DTO cho danh mục sản phẩm
// ============================

// Định nghĩa schema cho tạo danh mục sản phẩm (name bắt buộc, parentId có thể null)
export const categoryCreatedDTOSchema = categorySchema.pick({
    name: true,
    parentId: true, // parentId có thể null
}).required();

// Định nghĩa kiểu dữ liệu cho tạo danh mục sản phẩm
export interface CategoryCreatedDTO extends z.infer<typeof categoryCreatedDTOSchema> {}

// Định nghĩa schema cho cập nhật danh mục sản phẩm (tất cả các trường đều có thể null)
export const categoryUpdateDTOSchema = categorySchema.pick({
    name: true,
    parentId: true,
}).partial();

// Định nghĩa kiểu dữ liệu cho cập nhật danh mục sản phẩm
export interface CategoryUpdateDTO extends z.infer<typeof categoryUpdateDTOSchema> {}

// Định nghĩa schema điều kiện lọc danh mục sản phẩm
export const categoryCondDTOSchema = categorySchema.pick({
    name: true,
    parentId: true,
}).partial();

// Định nghĩa kiểu dữ liệu điều kiện lọc danh mục sản phẩm
export interface CategoryCondDTO extends z.infer<typeof categoryCondDTOSchema> {}