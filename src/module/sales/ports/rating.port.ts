import { RatingCreateDTO, RatingUpdateDTO, RatingCondDTO } from "../dtos/rating.dto";
import { Paginated, PagingDTO } from "src/share";
import { Rating, ProductAvgRating } from "../models/rating.model";

// Định nghĩa các phương thức mà RatingService phải triển khai
export interface IRatingService {
    create(rating: RatingCreateDTO): Promise<string> // Tạo đánh giá mới
    update(id: string, rating: RatingUpdateDTO): Promise<void> // Cập nhật đánh giá
    delete(id: string): Promise<void> // Xóa đánh giá

    get(id: string): Promise<Rating | null> // Lấy đánh giá theo ID
    list(cond: RatingCondDTO, paging: PagingDTO): Promise<Paginated<Rating>> // Lấy danh sách đánh giá theo điều kiện
    listByIds(ids: string[]): Promise<Rating[]> // Lấy danh sách đánh giá theo nhiều ID
    checkReviewExist(userId: string, productId: string): Promise<boolean>;
    getAverageRatingByProduct(productId: string): Promise<ProductAvgRating>;
}

// Định nghĩa các phương thức mà RatingRepository phải triển khai
export interface IRatingRepository {
    insert(rating: RatingCreateDTO): Promise<void> // Tạo đánh giá mới
    update(id: string, rating: RatingUpdateDTO): Promise<void> // Cập nhật đánh giá
    delete(id: string): Promise<void> // Xóa đánh giá

    get(id: string): Promise<Rating | null> // Lấy đánh giá theo ID
    list(cond: RatingCondDTO, paging: PagingDTO): Promise<Paginated<Rating>> // Lấy danh sách đánh giá theo điều kiện
    listByIds(ids: string[]): Promise<Rating[]> // Lấy danh sách đánh giá theo nhiều ID
    checkReviewExist(userId: string, productId: string): Promise<boolean>;
    getAverageRatingByProduct(productId: string): Promise<ProductAvgRating>;
}