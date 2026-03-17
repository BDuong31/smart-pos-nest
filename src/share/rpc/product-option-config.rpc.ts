import { Injectable } from "@nestjs/common";
import { IPublicProductOptionConfigRpc } from "../interface";
import { PublicProductOptionConfig } from "../data-model";
import axios from "axios";

@Injectable()
export class ProductOptionConfigRPCClient implements IPublicProductOptionConfigRpc{
    constructor(private readonly productServiceUrl: string) {}

    async getConfigByProductId(productId: string): Promise<PublicProductOptionConfig | null> {
        try {
            const response = await axios.get(`${this.productServiceUrl}/rpc/options/product/${productId}/config`);
            return response.data;
        } catch (error) {
            return null;
        }
    }
}