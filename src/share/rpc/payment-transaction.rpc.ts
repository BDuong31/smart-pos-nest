import { Injectable } from "@nestjs/common";
import { PublicPaymentTransaction, IPublicPaymentTransactionRpc } from "..";
import axios from "axios";

@Injectable()
export class PaymentTransactionRPCClient implements IPublicPaymentTransactionRpc {
    constructor(private readonly paymentTransactionServiceUrl: string) {}

    async findById(id: string): Promise<PublicPaymentTransaction | null> {
        try {
            const response = await axios.get(`${this.paymentTransactionServiceUrl}/rpc/payment-transactions/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicPaymentTransaction[]> {
        try {
            const response = await axios.post(`${this.paymentTransactionServiceUrl}/rpc/payment-transactions/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}