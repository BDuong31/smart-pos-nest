import { Injectable } from "@nestjs/common";
import { IPublicIngredientRpc } from "../interface";
import axios from "axios";
import { PublicIngredient } from "../data-model";

@Injectable()
export class IngredientRPCClient implements IPublicIngredientRpc {
    constructor(private readonly productServiceUrl: string) {}

    async findById(id: string): Promise<PublicIngredient | null> {
        try {
            const response = await axios.get(`${this.productServiceUrl}/rpc/option-items/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicIngredient[]> {
        try {
            const response = await axios.post(`${this.productServiceUrl}/rpc/option-items/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}