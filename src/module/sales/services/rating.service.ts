import { Inject, Injectable } from "@nestjs/common";
import type { IRatingRepository } from "../ports/rating.port";
import { RATING_REPOSITORY } from "../sales.di-token";
import { USER_RPC, PRODUCT_RPC, ORDER_RPC,type IPublicUserRpc, type IPublicProductRpc, type IPublicOrderRpc, AppError } from "src/share";
import { RatingCreateDTO, RatingUpdateDTO, RatingCondDTO, ratingCreateDTOSchema, ratingUpdateDTOSchema } from "../dtos/rating.dto";
import { Rating, ProductAvgRating, ErrRatingNotFound } from "../models/rating.model";
import { ErrUserNotFound } from "src/module/user/models/user.model";
import { ErrProductNotFound } from "src/module/catalog/models/product.model";
import { v7 } from "uuid";
import { Paginated, PagingDTO } from "src/share";

@Injectable()
export class RatingService {
    constructor(
        @Inject(RATING_REPOSITORY) private readonly ratingRepo: IRatingRepository,
        @Inject(USER_RPC) private readonly userRpc: IPublicUserRpc,
        @Inject(PRODUCT_RPC) private readonly productRpc: IPublicProductRpc,
        @Inject(ORDER_RPC) private readonly orderRpc: IPublicOrderRpc,
    ) {}

    // Tạo đánh giá mới
    async create(rating: RatingCreateDTO): Promise<string> {
        rating = ratingCreateDTOSchema.parse(rating);

        const user = await this.userRpc.getUserById(rating.userId);
        
        if (!user) {
            throw AppError.from(ErrUserNotFound);
        }

        const product = await this.productRpc.findById(rating.productId);

        if (!product) {
            throw AppError.from(ErrProductNotFound);
        }

        const newId = v7();

        const newRating: Rating = {
            id: newId,
            userId: rating.userId,
            star: rating.star,
            comment: rating.comment,
            productId: rating.productId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.ratingRepo.insert(newRating);

        return newId;
    }

    async update(id: string, rating: RatingUpdateDTO): Promise<void> {
        rating = ratingUpdateDTOSchema.parse(rating);

        const existingRating = await this.ratingRepo.get(id);

        if (!existingRating) {
            throw AppError.from(ErrRatingNotFound);
        }

        const updatedRating: Rating = {
            ...existingRating,
            ...rating,
            updatedAt: new Date(),
        }

        await this.ratingRepo.update(id, updatedRating);
    }

    async delete(id: string): Promise<void> {
        const existingRating = await this.ratingRepo.get(id);

        if (!existingRating) {
            throw AppError.from(ErrRatingNotFound);
        }

        await this.ratingRepo.delete(id);
    }

    async get(id: string): Promise<Rating | null> {
        return await this.ratingRepo.get(id);
    }

    async list(cond: RatingCondDTO, paging: PagingDTO): Promise<Paginated<Rating>> {
        return await this.ratingRepo.list(cond, paging);
    }

    async listByIds(ids: string[]): Promise<Rating[]> {
        return await this.ratingRepo.listByIds(ids);
    }

    async checkReviewExist(userId: string, productId: string): Promise<boolean> {
        return await this.ratingRepo.checkReviewExist(userId, productId);
    }

    async getAverageRatingByProduct(productId: string): Promise<ProductAvgRating> {
        return await this.ratingRepo.getAverageRatingByProduct(productId);
    }
}