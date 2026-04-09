import { Injectable } from "@nestjs/common";
import { Paginated, PagingDTO, PublicUser } from "src/share";
import { IRatingRepository } from "../ports/rating.port";
import prisma from "src/share/components/prisma";
import { ProductAvgRating, Rating } from "../models/rating.model";
import { RatingCondDTO, RatingCreateDTO, RatingUpdateDTO } from "../dtos/rating.dto";
import { Rating as PrismaRating } from "@prisma/client";

@Injectable()
export class RatingPrismaRepository implements IRatingRepository {
    async get(id: string): Promise<Rating | null> {
        const data = await prisma.rating.findFirst({ where: { id } });
        if (!data) return null;
        
        return this._toModdel(data);
    }

    async list(cond:RatingCondDTO, paging: PagingDTO): Promise<Paginated<Rating>> {
        const {userId, productId, star, comment } = cond;

        let where: any = {
        }
        if (star) {
            where = {
                ...where,
                star: star,
            } as RatingCondDTO
        }
        if (userId) {
            where = {
                ...where,
                userId: userId,
            } as RatingCondDTO
        }
        if (productId) {
            where = {
                ...where,
                productId: productId,
            } as RatingCondDTO
        }

        if (comment) {
            where = {
                ...where,
                comment: comment,
            } as RatingCondDTO
        }

        const page = Number(paging.page);
        const limit = Number(paging.limit);

        const total = await prisma.rating.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.rating.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: {
                id: 'desc',
            },
        });

        return {
            data: result.map(this._toModdel),
            paging,
            total
        };
    }
    
    async listByIds(ids: string[]): Promise<Rating[]> {
        const data = await prisma.rating.findMany({ where: { id: { in: ids } } });
        return data.map(this._toModdel);
    } 

    async checkReviewExist(userId: string, productId: string): Promise<boolean> {
        const data = await prisma.rating.findFirst({ where: { userId, productId } });
        if (data) {
            if (data.comment === null && data.star === 0) {
                return true;
            } else {
                return false;
            }
        } else { 
            return false;
        }
    }

    async getAverageRatingByProduct(productId: string): Promise<ProductAvgRating> {
        const result = await prisma.rating.findMany({
            where: { productId, NOT: { star: 0, comment: null } },
            select: {
                star: true,
            },
        });


        if (result.length === 0) {
            return null as any;
        }

        const totalRating = result.reduce((sum, review) => sum + review.star, 0);
        const avgRating = totalRating / result.length;

        const data = {
            productId,
            avgRating: parseFloat(avgRating.toFixed(2)),
            totalRating: result.length,
        } as ProductAvgRating;

        return data;
    }
    async insert(rating: RatingCreateDTO): Promise<void> {
        await prisma.rating.create({ data: rating });
    }

    async update(id: string, dto: RatingUpdateDTO): Promise<void> {
        await prisma.rating.update({
            where: { id },
            data: dto,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.rating.delete({ where: { id } });
    }

    private _toModdel(data: PrismaRating): Rating {
        return { ...data } as Rating;
    }
}