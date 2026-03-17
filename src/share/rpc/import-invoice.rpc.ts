import { Injectable } from "@nestjs/common";
import { PublicImportInvoice, IPublicImportInvoiceRpc } from "..";
import axios from "axios";

@Injectable()
export class ImportInvoiceRPCClient implements IPublicImportInvoiceRpc {
    constructor(private readonly importInvoiceServiceUrl: string) {}

    async findById(id: string): Promise<PublicImportInvoice | null> {
        try {
            const response = await axios.get(`${this.importInvoiceServiceUrl}/rpc/import-invoices/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicImportInvoice[]> {
        try {
            const response = await axios.post(`${this.importInvoiceServiceUrl}/rpc/import-invoices/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}