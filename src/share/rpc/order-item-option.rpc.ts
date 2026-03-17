import { Injectable } from "@nestjs/common";
import { PublicOrderItemOption, IPublicOrderItemOptionRpc } from "..";
import axios from "axios";

@Injectable()
export class OrderItemOptionRPCClient implements IPublicOrderItemOptionRpc {
    constructor(private readonly orderItemOptionServiceUrl: string) {}

    async findById(id: string): Promise<PublicOrderItemOption | null> { 
        try {
            const response = await axios.get(`${this.orderItemOptionServiceUrl}/rpc/order-item-options/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicOrderItemOption[]> {
        try {
            const response = await axios.post(`${this.orderItemOptionServiceUrl}/rpc/order-item-options/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}