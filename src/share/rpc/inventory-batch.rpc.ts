import { Injectable } from "@nestjs/common";
import { IPublicInventoryBatchRpc } from "../interface";
import { PublicInventoryBatch } from "../data-model";
import axios from "axios";

@Injectable()
export class InventoryBatchRPCClient implements IPublicInventoryBatchRpc{
    constructor(private readonly productServiceUrl: string) {}

    async findById(id: string): Promise<PublicInventoryBatch | null> {
        try {
            const response = await axios.get(`${this.productServiceUrl}/rpc/inventory-batches/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicInventoryBatch[]> {
        try {
            const response = await axios.post(`${this.productServiceUrl}/rpc/inventory-batches/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}