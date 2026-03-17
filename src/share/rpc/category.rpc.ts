import { Injectable } from "@nestjs/common";
import { IPublicCategoryRpc, PublicCategory,  } from "..";
import axios from "axios";

@Injectable()
export class CategoryRPCClient implements IPublicCategoryRpc {
    constructor(private readonly categoryServiceUrl: string) {}

    async findById(id: string): Promise<PublicCategory | null> {
        try {
            const response = await axios.get(`${this.categoryServiceUrl}/rpc/categories/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicCategory[]> {
        try {
            const response = await axios.post(`${this.categoryServiceUrl}/rpc/categories/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}