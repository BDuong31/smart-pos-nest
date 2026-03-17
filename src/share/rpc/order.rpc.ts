import { Injectable } from "@nestjs/common";
import { PublicOrder, IPublicOrderRpc } from "..";
import axios from "axios";

@Injectable()
export class OrderRPCClient implements IPublicOrderRpc {
    constructor(private readonly orderServiceUrl: string) {}

    async findById(id: string): Promise<PublicOrder | null> {
        try {
            const response = await axios.get(`${this.orderServiceUrl}/rpc/orders/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicOrder[]> {
        try {
            const response = await axios.post(`${this.orderServiceUrl}/rpc/orders/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}