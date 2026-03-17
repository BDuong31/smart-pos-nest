import { Injectable } from "@nestjs/common";
import { PublicImportInvoiceDetail, IPublicImportInvoiceDetailRpc } from "..";
import axios from "axios";

@Injectable()
export class ImportInvoiceDetailRPCClient implements IPublicImportInvoiceDetailRpc {
    constructor(private readonly importInvoiceServiceUrl: string) {}

    async findById(id: string): Promise<PublicImportInvoiceDetail | null> {
        try {
            const response = await axios.get(`${this.importInvoiceServiceUrl}/rpc/import-invoice-details/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicImportInvoiceDetail[]> {
        try {
            const response = await axios.post(`${this.importInvoiceServiceUrl}/rpc/import-invoice-details/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}