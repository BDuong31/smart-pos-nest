import { Injectable } from "@nestjs/common";
import { IPublicOptionItemRpc } from "../interface";
import { PublicOptionItem } from "../data-model";
import axios from "axios";

@Injectable()
export class OptionItemRPCClient implements IPublicOptionItemRpc {
    constructor(private readonly productServiceUrl: string) {}

    async findById(id: string): Promise<PublicOptionItem | null> {
        try {
            const response = await axios.get(`${this.productServiceUrl}/rpc/option/group/items/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicOptionItem[]> {
        try {
            const response = await axios.post(`${this.productServiceUrl}/rpc/option/group/items/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}