import { Injectable } from "@nestjs/common";
import { PublicOptionGroup, IPublicOptionGroupRpc} from "..";
import axios from "axios";

@Injectable()
export class OptionGroupRPCClient implements IPublicOptionGroupRpc {
    constructor(private readonly productServiceUrl: string) {}

    async findById(id: string): Promise<PublicOptionGroup | null> {
        try {
            const response = await axios.get(`${this.productServiceUrl}/rpc/option/group/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicOptionGroup[]> {
        try {
            const response = await axios.post(`${this.productServiceUrl}/rpc/option/group/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}