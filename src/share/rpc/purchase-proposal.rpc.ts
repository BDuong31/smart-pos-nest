import { Injectable } from "@nestjs/common";
import { PublicPurchaseProposal, IPublicPurchaseProposalRpc } from "..";
import axios from "axios";

@Injectable()
export class PurchaseProposalRPCClient implements IPublicPurchaseProposalRpc {
    constructor(private readonly purchaseProposalServiceUrl: string) {}

    async findById(id: string): Promise<PublicPurchaseProposal | null> {    
        try {
            const response = await axios.get(`${this.purchaseProposalServiceUrl}/rpc/purchase-proposals/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicPurchaseProposal[]> {
        try {
            const response = await axios.post(`${this.purchaseProposalServiceUrl}/rpc/purchase-proposals/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}