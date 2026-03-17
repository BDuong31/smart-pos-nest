import { Injectable } from "@nestjs/common";
import { PublicOrderTable, IPublicOrderTableRpc } from "..";
import axios from "axios";

@Injectable()
export class OrderTableRPCClient implements IPublicOrderTableRpc {
    constructor(private readonly orderTableServiceUrl: string) {}

    async findById(id: string): Promise<PublicOrderTable | null> {
        try {
            const response = await axios.get(`${this.orderTableServiceUrl}/rpc/order-tables/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicOrderTable[]> {
        try {
            const response = await axios.post(`${this.orderTableServiceUrl}/rpc/order-tables/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}