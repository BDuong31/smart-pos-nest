import { Injectable } from "@nestjs/common";
import { PublicProduct, IPublicProductRpc } from "..";
import axios from "axios";
@Injectable()
export class ProductRPCClient implements IPublicProductRpc {
    constructor(private readonly productServiceUrl: string) {}

    async findById(id: string): Promise<PublicProduct | null> {
        try {
            const response = await axios.get(`${this.productServiceUrl}/rpc/products/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicProduct[]> {
        try {
            const response = await axios.post(`${this.productServiceUrl}/rpc/products/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}