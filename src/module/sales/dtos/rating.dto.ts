import { z } from "zod";
import { ratingSchema } from "../models/rating.model";

// Định nghĩa schema cho tạo đánh giá
export const ratingCreateDTOSchema = ratingSchema.pick({
    userId: true,
    star: true,
    comment: true,
    productId: true,
}).required()

// Định nghĩa kiểu dữ liệu cho tạo đánh giá
export type RatingCreateDTO = z.infer<typeof ratingCreateDTOSchema>

// Định nghĩa schema cho cập nhật đánh giá
export const ratingUpdateDTOSchema = ratingSchema.pick({
    star: true,
    comment: true,
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật đánh giá
export type RatingUpdateDTO = z.infer<typeof ratingUpdateDTOSchema>

// Định nghĩa schema cho điều kiện truy vấn đánh giá
export const ratingCondDTOSchema = ratingSchema.pick({
    userId: true,
    star: true,
    comment: true,
    productId: true,
}).partial()

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn đánh giá
export type RatingCondDTO = z.infer<typeof ratingCondDTOSchema>