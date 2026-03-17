import { Injectable } from "@nestjs/common";
import { PublicVariant, IPublicVariantRpc} from "..";
import axios from "axios";

@Injectable()
export class VariantRPCClient implements IPublicVariantRpc {
    constructor(private readonly productServiceUrl: string) {}

    async findById(id: string): Promise<PublicVariant | null> {
        try {
            const response = await axios.get(`${this.productServiceUrl}/rpc/variants/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicVariant[]> {
        try {
            const response = await axios.post(`${this.productServiceUrl}/rpc/variants/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}