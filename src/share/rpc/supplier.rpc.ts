import { Injectable } from "@nestjs/common";
import { IPublicSupplierRpc } from "../interface";
import axios from "axios";
import { PublicSupplier } from "../data-model";

@Injectable()
export class SupplierRPCClient implements IPublicSupplierRpc {
    constructor(private readonly supplierServiceUrl: string) {}

    async findById(id: string): Promise<PublicSupplier | null> {
        try {
            const response = await axios.get(`${this.supplierServiceUrl}/rpc/suppliers/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicSupplier[]> {
        try {
            const response = await axios.post(`${this.supplierServiceUrl}/rpc/suppliers/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}