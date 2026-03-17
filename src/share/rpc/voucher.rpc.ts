import { Injectable } from "@nestjs/common";
import { PublicVoucher, IPublicVoucherRpc } from "..";
import axios from "axios";

@Injectable()
export class VoucherRPCClient implements IPublicVoucherRpc {
    constructor(private readonly voucherServiceUrl: string) {}

    async findById(id: string): Promise<PublicVoucher | null> {
        try {
            const response = await axios.get(`${this.voucherServiceUrl}/rpc/vouchers/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicVoucher[]> {
        try {
            const response = await axios.post(`${this.voucherServiceUrl}/rpc/vouchers/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}