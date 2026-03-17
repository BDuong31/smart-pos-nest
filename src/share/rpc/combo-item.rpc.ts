import { Injectable } from "@nestjs/common";
import { IPublicComboItemRpc } from "../interface";
import { PublicComboItem } from "../data-model";
import axios from "axios";

@Injectable()
export class ComboItemRPCClient implements IPublicComboItemRpc {
    constructor(private readonly productServiceUrl: string) {}

    async findById(id: string): Promise<PublicComboItem | null> {
        try {
            const response = await axios.get(`${this.productServiceUrl}/rpc/combos/items/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicComboItem[]> {
        try {
            const response = await axios.post(`${this.productServiceUrl}/rpc/combos/items/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}