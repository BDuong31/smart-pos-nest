import { url } from 'inspector';
import { z } from 'zod';

export const ErrImageUrlRequired = new Error('Image URL is required'); // Lỗi URL hình ảnh bắt buộc
export const ErrImageRefIdRequired = new Error('Image reference ID is required'); // Lỗi ID tham chiếu hình ảnh bắt buộc
export const ErrImagePublicRequird = new Error('Image public is required'); // Lỗi public hình ảnh bắt buộc
export const ErrImageNotFound = new Error('Image not found'); // Lỗi hình ảnh không tồn tại
export const ErrImageInsertFailed = new Error('Failed to insert image'); // Lỗi không thể thêm hình ảnh
export const ErrImageDeleteFailed = new Error('Failed to delete image');
export const ErrImageExists = new Error('Image already exists'); // Lỗi hình ảnh đã tồn tại

export enum ImageType {
    CATEGORY = 'category', // hình ảnh danh mục
    AVATAR = 'avatar', // hình ảnh đại diện
    PRODUCT = 'product', // hình ảnh sản phẩm
    INGREDIENT = 'ingredient', // hình ảnh nguyên liệu
}

// Mô hình dữ liệu
export const image = z.object({
    id: z.string().uuid(),
    url: z.string().min(1, ErrImageUrlRequired),
    isMain: z.preprocess(
        (val) => typeof val === 'string' ? val === 'true' : Boolean(val),
        z.boolean()
    ).optional().default(false),
    type: z.nativeEnum(ImageType),
    publicId: z.string().min(1, ErrImagePublicRequird),
    refId: z.string().min(1, ErrImageRefIdRequired),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Image = z.infer<typeof image>;