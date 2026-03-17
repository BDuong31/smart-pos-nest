import { Injectable } from "@nestjs/common";
import { PublicCartItemOption, IPublicCartItemOptionRpc } from "..";
import axios from "axios";

@Injectable()
export class CartItemOptionRPCClient implements IPublicCartItemOptionRpc {
    constructor(private readonly cartItemOptionServiceUrl: string) {}

    async findById(id: string): Promise<PublicCartItemOption | null> {
        try {
            const response = await axios.get(`${this.cartItemOptionServiceUrl}/rpc/cart-item-options/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicCartItemOption[]> {
        try {
            const response = await axios.post(`${this.cartItemOptionServiceUrl}/rpc/cart-item-options/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}