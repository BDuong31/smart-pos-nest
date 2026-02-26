import { z } from 'zod';

// Định nghĩa lỗi về danh mục sản phẩm
// 1. Định nghĩa lỗi chung về danh mục sản phẩm
export const ErrCategoryNotFound = new Error('Category not found'); // Lỗi danh mục sản phẩm không tồn tại
export const ErrCategoryAlreadyExists = new Error('Category already exists'); // Lỗi danh mục sản phẩm đã tồn tại

// 2. Định nghĩa lỗi về tên danh mục sản phẩm
export const ErrCategoryNameRequired = new Error('Category name is required'); // Lỗi tên danh mục sản phẩm bắt buộc
export const ErrCategoryNameTooShort = new Error('Category name is too short'); // Lỗi tên danh mục sản phẩm quá ngắn
export const ErrCategoryNameTooLong = new Error('Category name is too long'); // Lỗi tên danh mục sản phẩm quá dài
export const ErrCategoryNameInvalidFormat = new Error('Category name has invalid format'); // Lỗi định dạng tên danh mục sản phẩm không hợp lệ

// 3. Định nghĩa lỗi về danh mục cha
export const ErrParentCategoryNotFound = new Error('Parent category not found'); // Lỗi danh mục cha không tồn tại
export const ErrParentCategoryInvalid = new Error('Parent category is invalid'); // Lỗi danh mục cha không hợp lệ

// Mô hình dữ liệu danh mục sản phẩm
export const categorySchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, ErrCategoryNameTooShort).max(200, ErrCategoryNameTooLong),
    parentId: z.string().uuid().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Category = z.infer<typeof categorySchema>;