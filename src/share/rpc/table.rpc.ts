import { Injectable } from "@nestjs/common";
import { PublicTable, IPublicTableRpc } from "..";
import axios from "axios";

@Injectable()
export class TableRPCClient implements IPublicTableRpc {
    constructor(private readonly tableServiceUrl: string) {}

    async findById(id: string): Promise<PublicTable | null> {
        try {
            const response = await axios.get(`${this.tableServiceUrl}/rpc/tables/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }
    
    async findByIds(ids: string[]): Promise<PublicTable[]> {
        try {
            const response = await axios.post(`${this.tableServiceUrl}/rpc/tables/list-by-ids`, { ids });
            return response.data.data;
        } catch (error) {
            return [];
        }
    }

    async findByAvailable(time: string): Promise<PublicTable[] | null> {
        try {
            const response = await axios.get(`${this.tableServiceUrl}/rpc/tables/available?time=${encodeURIComponent(time)}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }
}