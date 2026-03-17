import { Injectable } from "@nestjs/common";
import { IPublicUnitConversionRpc } from "../interface";
import { PublicUnitConversion } from "../data-model";
import axios from "axios";

@Injectable()
export class UnitConversionRPCClient implements IPublicUnitConversionRpc {
    constructor(private readonly productServiceUrl: string) {}

    async findById(id: string): Promise<PublicUnitConversion | null> {
        try {
            const response = await axios.get(`${this.productServiceUrl}/rpc/unit-conversions/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicUnitConversion[]> {
        try {
            const response = await axios.post(`${this.productServiceUrl}/rpc/unit-conversions/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}