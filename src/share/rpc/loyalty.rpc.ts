import { Injectable } from "@nestjs/common";
import { PublicRank, publicRankSchema } from "../data-model";
import axios from "axios";
import { IPublicLoyaltyRpc } from "../interface";

@Injectable()
export class LoyaltyRPCClient implements IPublicLoyaltyRpc {
    constructor(private readonly loyaltyServiceUrl: string) {}

    async getUserRank(id: string): Promise<PublicRank | null> {
        try {
            const response = await axios.get(`${this.loyaltyServiceUrl}/rpc/loyalty/user-ranks/${id}`);
            const rank = response.data;
            return {
                id: rank.id,
                name: rank.name,
                minPoint: rank.minPoint,
                discountPercent: rank.discountPercent,
                createdAt: new Date(rank.createdAt),
                updatedAt: rank.updatedAt ? new Date(rank.updatedAt) : undefined,    
             } as PublicRank;
        } catch (error) {
            return null;
        }
    }

    async getUserRanksByIds(ids: string[]): Promise<PublicRank[]> {
        try {
            const response = await axios.post(`${this.loyaltyServiceUrl}/rpc/loyalty/user-ranks/list-by-ids`, { ids });
            return response.data.map((rankData: any) => {
                return {
                    id: rankData.id,
                    name: rankData.name,
                    minPoint: rankData.minPoint,    
                    discountPercent: rankData.discountPercent,
                    createdAt: new Date(rankData.createdAt),
                    updatedAt: rankData.updatedAt ? new Date(rankData.updatedAt) : undefined,
                } as PublicRank;
            });
        } catch (error) {
            return [];
        }
    }
}