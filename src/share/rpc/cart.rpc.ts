import { Injectable } from "@nestjs/common";
import { PublicCart, IPublicCartRpc } from "..";
import axios from "axios";

@Injectable()
export class CartRPCClient implements IPublicCartRpc {
    constructor(private readonly cartServiceUrl: string) {}

    async findById(id: string): Promise<PublicCart | null> {
        try {
            const response = await axios.get(`${this.cartServiceUrl}/rpc/carts/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicCart[]> {
        try {
            const response = await axios.post(`${this.cartServiceUrl}/rpc/carts/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}