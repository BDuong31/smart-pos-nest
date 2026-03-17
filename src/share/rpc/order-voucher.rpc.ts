import { Injectable } from "@nestjs/common";
import { PublicOrderVoucher, IPublicOrderVoucherRpc } from "..";
import axios from "axios";

@Injectable()
export class OrderVoucherRPCClient implements IPublicOrderVoucherRpc {
    constructor(private readonly orderVoucherServiceUrl: string) {}

    async findById(id: string): Promise<PublicOrderVoucher | null> {
        try {
            const response = await axios.get(`${this.orderVoucherServiceUrl}/rpc/order-vouchers/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicOrderVoucher[]> {
        try {
            const response = await axios.post(`${this.orderVoucherServiceUrl}/rpc/order-vouchers/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}