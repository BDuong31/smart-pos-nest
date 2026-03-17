import { Injectable } from "@nestjs/common";
import { PublicInvoice, IPublicInvoiceRpc } from "..";
import axios from "axios";

@Injectable()
export class InvoiceRPCClient implements IPublicInvoiceRpc {
    constructor(private readonly invoiceServiceUrl: string) {}

    async findById(id: string): Promise<PublicInvoice | null> {
        try {
            const response = await axios.get(`${this.invoiceServiceUrl}/rpc/invoices/${id}`);   
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicInvoice[]> {
        try {
            const response = await axios.post(`${this.invoiceServiceUrl}/rpc/invoices/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}