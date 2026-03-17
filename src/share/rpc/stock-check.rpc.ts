import { Injectable } from "@nestjs/common";
import { PublicStockCheck, IPublicStockCheckRpc } from "..";
import axios from "axios";

@Injectable()
export class StockCheckRPCClient implements IPublicStockCheckRpc {
    constructor(private readonly stockCheckServiceUrl: string) {}

    async findById(id: string): Promise<PublicStockCheck | null> {
        try {
            const response = await axios.get(`${this.stockCheckServiceUrl}/rpc/stock-checks/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicStockCheck[]> {
        try {
            const response = await axios.post(`${this.stockCheckServiceUrl}/rpc/stock-checks/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}