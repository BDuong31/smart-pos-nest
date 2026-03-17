import { Injectable } from "@nestjs/common";
import { PublicCartItem, IPublicCartItemRpc } from "..";
import axios from "axios";

@Injectable()
export class CartItemRPCClient implements IPublicCartItemRpc {
    constructor(private readonly cartItemServiceUrl: string) {}

    async findById(id: string): Promise<PublicCartItem | null> {
        try {
            const response = await axios.get(`${this.cartItemServiceUrl}/rpc/cart-items/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicCartItem[]> {
        try {
            const response = await axios.post(`${this.cartItemServiceUrl}/rpc/cart-items/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}