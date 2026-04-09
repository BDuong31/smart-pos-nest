// Định nghĩa lỗi cho rating

import { PublicUser } from "src/share";
import z from "zod";

// 1. Định nghĩa lỗi chung
export const ErrRatingNotFound = new Error('Rating not found'); // Lỗi đánh giá không tồn tại
export const ErrRatingAlreadyExists = new Error('Rating already exists'); // Lỗi đánh giá đã tồn tại

// 2. Định nghĩa lỗi về số sao
export const ErrRatingStarInvalid = new Error('Rating star is invalid'); // Lỗi số sao không hợp lệ
export const ErrRatingStarNegative = new Error('Rating star cannot be negative'); // Lỗi số sao không được âm

// 3. Định nghĩa lỗi về nội dung đánh giá
export const ErrRatingCommentEmpty = new Error('Rating comment cannot be empty'); // Lỗi nội dung đánh giá không được để trống
export const ErrRatingCommentTooLong = new Error('Rating comment cannot be too long'); // Lỗi nội dung đánh giá không được quá dài

export const ratingSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    star: z.number().min(0, ErrRatingStarNegative).max(5, ErrRatingStarInvalid),
    comment: z.string().max(500).nullable(),
    productId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Rating = z.infer<typeof ratingSchema> & { User?: PublicUser};

export const ProdcutAvgRatingSchema = z.object({
    productId: z.string().uuid(),
    avgRating: z.number(),
    totalRating: z.number(),
})

export type ProductAvgRating = z.infer<typeof ProdcutAvgRatingSchema>;