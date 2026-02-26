import { z } from 'zod';
// Định nghĩa lỗi về Option Group
// 1. Định nghĩa lỗi chung về Option Group
export const ErrOptionGroupNotFound = new Error('Option Group not found'); // Lỗi Option Group không tồn tại
export const ErrOptionGroupAlreadyExists = new Error('Option Group already exists'); // Lỗi Option Group đã tồn tại

// 2. Định nghĩa lỗi về tên Option Group
export const ErrOptionGroupNameRequired = new Error('Option Group name is required'); // Lỗi tên Option Group bắt buộc
export const ErrOptionGroupNameTooShort = new Error('Option Group name is too short'); // Lỗi tên Option Group quá ngắn
export const ErrOptionGroupNameTooLong = new Error('Option Group name is too long'); // Lỗi tên Option Group quá dài
export const ErrOptionGroupNameInvalidFormat = new Error('Option Group name has invalid format'); // Lỗi định dạng tên Option Group không hợp lệ

// 3. Định nghĩa lỗi về kiểu lựa chọn
export const ErrOptionGroupIsMultiSelectInvalid = new Error('Option Group isMultiSelect is invalid'); // Lỗi kiểu lựa chọn của Option Group không hợp lệ

// Định nghĩa lỗi về Option Item
// 1. Định nghĩa lỗi chung về Option Item
export const ErrOptionItemNotFound = new Error('Option Item not found'); // Lỗi Option Item không tồn tại
export const ErrOptionItemAlreadyExists = new Error('Option Item already exists'); // Lỗi Option Item đã tồn tại

// 2. Định nghĩa lỗi về tên Option Item
export const ErrOptionItemNameRequired = new Error('Option Item name is required'); // Lỗi tên Option Item bắt buộc
export const ErrOptionItemNameTooShort = new Error('Option Item name is too short'); // Lỗi tên Option Item quá ngắn
export const ErrOptionItemNameTooLong = new Error('Option Item name is too long'); // Lỗi tên Option Item quá dài
export const ErrOptionItemNameInvalidFormat = new Error('Option Item name has invalid format'); // Lỗi định dạng tên Option Item không hợp lệ

// 3. Định nghĩa lỗi về giá phụ thu
export const ErrOptionItemPriceExtraInvalid = new Error('Option Item price extra is invalid'); // Lỗi giá phụ thu của Option Item không hợp lệ
export const ErrOptionItemPriceExtraNegative = new Error('Option Item price extra cannot be negative'); // Lỗi giá phụ thu của Option Item không thể âm

// Định nghĩa lỗi về ProductOptionConfig
// 1. Định nghĩa lỗi chung về ProductOptionConfig
export const ErrProductOptionConfigNotFound = new Error('Product Option Config not found'); // Lỗi cấu hình tùy chọn sản phẩm không tồn tại
export const ErrProductOptionConfigAlreadyExists = new Error('Product Option Config already exists'); // Lỗi cấu hình tùy chọn sản phẩm đã tồn tại

// 2. Định nghĩa lỗi về Product ID
export const ErrProductOptionConfigProductNotFound = new Error('Product for Option Config not found'); // Lỗi sản phẩm cho cấu hình tùy chọn không tồn tại
export const ErrProductOptionConfigProductInvalid = new Error('Product for Option Config is invalid'); // Lỗi sản phẩm cho cấu hình tùy chọn không hợp lệ

// 3. Định nghĩa lỗi về Option Group ID
export const ErrProductOptionConfigOptionGroupNotFound = new Error('Option Group for Product Option Config not found'); // Lỗi nhóm tùy chọn cho cấu hình tùy chọn sản phẩm không tồn tại
export const ErrProductOptionConfigOptionGroupInvalid = new Error('Option Group for Product Option Config is invalid'); // Lỗi nhóm tùy chọn cho cấu hình tùy chọn sản phẩm không hợp lệ

// Định nghĩa dữ liệu Option Group 
export const optionGroup = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, ErrOptionGroupNameRequired).max(200, ErrOptionGroupNameTooLong),
    isMultiSelect: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type OptionGroup = z.infer<typeof optionGroup>;

// Định nghĩa dữ liệu Option Item
export const optionItem = z.object({
    id: z.string().uuid(),
    groupId: z.string().uuid(),
    name: z.string().min(1, ErrOptionItemNameRequired).max(200, ErrOptionItemNameTooLong),
    priceExtra: z.number().min(0, ErrOptionItemPriceExtraNegative),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type OptionItem = z.infer<typeof optionItem>;

// Định nghĩa dữ liệu ProductOptionConfig
export const productOptionConfig = z.object({
    productId: z.string().uuid(),
    optionGroupId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type ProductOptionConfig = z.infer<typeof productOptionConfig>;