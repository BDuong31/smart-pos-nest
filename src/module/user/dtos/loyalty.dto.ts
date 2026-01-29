import { z } from 'zod';
import { userRankSchema } from '../models/user-rank.model';
import { pointHistorySchema } from '../models/point-history.model';  
// ============================
// DTO cho hệ thống khách hàng thân thiết
// ============================

// Định nghĩa schema cho tạo hạng khách hàng thân thiết
export const userRankDTOSchema = userRankSchema.pick({
    name: true,
    minPoint: true,
    discountPercent: true,
}).required();

// Định nghĩa schema cho cập nhật hạng khách hàng thân thiết
export const userRankUpdateDTOSchema = userRankSchema.pick({
    name: true,
    minPoint: true,
    discountPercent: true,
}).partial();


// Định nghĩa kiểu dữ liệu cho tạo hạng khách hàng thân thiết
export interface UserRankDTO extends z.infer<typeof userRankDTOSchema> {}

// Định nghĩa kiểu dữ liệu cho cập nhật hạng khách hàng thân thiết
export interface UserRankUpdateDTO extends z.infer<typeof userRankUpdateDTOSchema> {}

// Đinh nghĩa kiểu dữ liệu cho điều kiện lọc hạng khách hàng thân thiết
export const userRankCondDTOSchema = userRankSchema.pick({
    name: true,
    minPoint: true,
    discountPercent: true,
}).partial();

export interface UserRankCondDTO extends z.infer<typeof userRankCondDTOSchema> {}

// Định nghĩa schema cho tạo lịch sử điểm khách hàng thân thiết
export const pointHistoryDTOSchema = pointHistorySchema.pick({
    userId: true,
    amount: true,
    reason: true,
}).required();

// Định nghĩa kiểu dữ liệu cho tạo lịch sử điểm khách hàng thân thiết
export interface PointHistoryDTO extends z.infer<typeof pointHistoryDTOSchema> {}

// Định nghĩa schema cho điều kiện lọc lịch sử điểm khách hàng thân thiết
export const pointHistoryCondDTOSchema = pointHistorySchema.pick({
    userId: true,
    reason: true,
    createdAt: true,
}).partial();

// Định nghĩa kiểu dữ liệu cho điều kiện lọc lịch sử điểm khách hàng thân thiết
export interface PointHistoryCondDTO extends z.infer<typeof pointHistoryCondDTOSchema> {}
