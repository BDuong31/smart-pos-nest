import { Injectable } from "@nestjs/common";
import { PublicPurchaseProposalDetail, IPublicPurchaseProposalDetailRpc } from "..";
import axios from "axios";

@Injectable()
export class PurchaseProposalDetailRPCClient implements IPublicPurchaseProposalDetailRpc {
    constructor(private readonly purchaseProposalServiceUrl: string) {}

    async findById(id: string): Promise<PublicPurchaseProposalDetail | null> {
        try {
            const response = await axios.get(`${this.purchaseProposalServiceUrl}/rpc/purchase-proposal-details/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicPurchaseProposalDetail[]> {
        try {
            const response = await axios.post(`${this.purchaseProposalServiceUrl}/rpc/purchase-proposal-details/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}