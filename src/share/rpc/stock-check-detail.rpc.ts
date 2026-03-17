import { Injectable } from "@nestjs/common";
import { PublicStockCheckDetail, IPublicStockCheckDetailRpc } from "..";
import axios from "axios";

@Injectable()
export class StockCheckDetailRPCClient implements IPublicStockCheckDetailRpc {
    constructor(private readonly stockCheckServiceUrl: string) {}

    async findById(id: string): Promise<PublicStockCheckDetail | null> {
        try {
            const response = await axios.get(`${this.stockCheckServiceUrl}/rpc/stock-check-details/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicStockCheckDetail[]> {
        try {
            const response = await axios.post(`${this.stockCheckServiceUrl}/rpc/stock-check-details/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}