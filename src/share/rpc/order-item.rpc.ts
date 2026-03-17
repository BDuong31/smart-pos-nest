import { Injectable } from "@nestjs/common";
import { PublicOrderItem, IPublicOrderItemRpc } from "..";
import axios from "axios";

@Injectable()
export class OrderItemRPCClient implements IPublicOrderItemRpc {
    constructor(private readonly orderItemServiceUrl: string) {}

    async findById(id: string): Promise<PublicOrderItem | null> {
        try {
            const response = await axios.get(`${this.orderItemServiceUrl}/rpc/order-items/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicOrderItem[]> {
        try {
            const response = await axios.post(`${this.orderItemServiceUrl}/rpc/order-items/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}