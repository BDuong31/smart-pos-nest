import { create } from 'axios';
import { z } from 'zod';
import { ca, is } from 'zod/v4/locales';
// Định nghĩa lỗi về sản phẩm
// 1. Định nghĩa lỗi chung về sản phẩm
export const ErrProductNotFound = new Error('Product not found'); // Lỗi sản phẩm không tồn tại
export const ErrProductAlreadyExists = new Error('Product already exists');

// 2. Định nghĩa lỗi về tên sản phẩm
export const ErrProductNameRequired = new Error('Product name is required'); // Lỗi tên sản phẩm bắt buộc    
export const ErrProductNameTooShort = new Error('Product name is too short'); // Lỗi tên sản phẩm quá ngắn
export const ErrProductNameTooLong = new Error('Product name is too long'); // Lỗi tên sản phẩm quá dài
export const ErrProductNameInvalidFormat = new Error('Product name has invalid format'); // Lỗi định dạng tên sản phẩm không hợp lệ

// 3. Định nghĩa lỗi về điểm tối thiểu
export const ErrMinPointInvalid = new Error('Minimum point is invalid'); // Lỗi điểm tối thiểu không hợp lệ
export const ErrMinPointNegative = new Error('Minimum point cannot be negative'); // Lỗi điểm tối thiểu không thể âm

// 4. Định nghĩa lỗi về phần trăm giảm giá
export const ErrDiscountPercentInvalid = new Error('Discount percent is invalid'); // Lỗi phần trăm giảm giá không hợp lệ
export const ErrDiscountPercentOutOfRange = new Error('Discount percent must be between 0 and 100'); // Lỗi phần trăm giảm giá phải nằm trong khoảng từ 0 đến 100

// Định nghĩa lỗi về biến thể sản phẩm
// 1. Định nghĩa lỗi chung về biến thể sản phẩm
export const ErrVariantNotFound = new Error('Variant not found'); // Lỗi biến thể sản phẩm không tồn tại
export const ErrVariantAlreadyExists = new Error('Variant already exists'); // Lỗi biến thể sản phẩm đã tồn tại

// 2. Định nghĩa lỗi về tên biến thể sản phẩm
export const ErrVariantNameRequired = new Error('Variant name is required');
export const ErrVariantNameTooShort = new Error('Variant name is too short');
export const ErrVariantNameTooLong = new Error('Variant name is too long');
export const ErrVariantNameInvalidFormat = new Error('Variant name has invalid format');

// 3. Định nghĩa lỗi về chênh lệch giá
export const ErrPriceDiffInvalid = new Error('Price difference is invalid'); // Lỗi chênh lệch giá không hợp lệ
export const ErrPriceDiffNegative = new Error('Price difference cannot be negative'); // Lỗi chênh lệch giá không thể âm

// Định nghĩa lỗi về combo sản phẩm
// 1. Định nghĩa lỗi chung về combo sản phẩm
export const ErrComboNotFound = new Error('Combo not found'); // Lỗi combo sản phẩm không tồn tại
export const ErrComboAlreadyExists = new Error('Combo already exists'); // Lỗi combo sản phẩm đã tồn tại

// 2. Định nghĩa lỗi về số lượng trong combo
export const ErrComboQuantityInvalid = new Error('Combo quantity is invalid'); // Lỗi số lượng trong combo không hợp lệ
export const ErrComboQuantityNegative = new Error('Combo quantity cannot be negative'); // Lỗi số lượng trong combo không thể âm
export const ErrComboQuantityZero = new Error('Combo quantity must be at least 1'); // Lỗi số lượng trong combo phải lớn hơn hoặc bằng 1

// 3. Định nghĩa lỗi về sản phẩm trong combo
export const ErrComboProductNotFound = new Error('Product in combo not found'); // Lỗi sản phẩm trong combo không tồn tại
export const ErrComboProductAlreadyExists = new Error('Product in combo already exists'); // Lỗi sản phẩm trong combo đã tồn tại

// Mô hình dữ liệu sản phẩm
export const productSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, ErrProductNameRequired).max(200, ErrProductNameTooLong),
    categoryId: z.string().uuid(),
    printerId: z.string(),
    basePrice: z.number().min(0),
    isActive: z.boolean().nullable(), // có thể null, mặc định là true
    isCombo: z.boolean().nullable(), // có thể null, mặc định là false
    createdAt: z.date(),
    updatedAt: z.date(),
});

export interface Product extends z.infer<typeof productSchema> {}

// Mô hình dữ liệu biến thể sản phẩm
export const variantSchema = z.object({
    id: z.string().uuid(),
    productId: z.string().uuid(),
    name: z.string().min(1, ErrVariantNameTooShort).max(200, ErrVariantNameTooLong),
    priceDiff: z.number().min(0, ErrPriceDiffNegative),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export interface Variant extends z.infer<typeof variantSchema> {}

// Mô hình dữ liệu combo sản phẩm
export const comboSchema = z.object({
    comboId: z.string().uuid(),
    productId: z.string().uuid(),
    quantity: z.number().min(1, ErrComboQuantityZero),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export interface Combo extends z.infer<typeof comboSchema> {}