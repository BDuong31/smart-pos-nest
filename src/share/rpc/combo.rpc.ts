import { Injectable } from "@nestjs/common";
import { IPublicComboRpc } from "../interface";
import { PublicCombo } from "../data-model";
import axios from "axios";

@Injectable()
export class ComboRPCClient implements IPublicComboRpc{
    constructor(private readonly comboServiceUrl: string) {}

    async findById(id: string): Promise<PublicCombo | null> {
        try {
            const response = await axios.get(`${this.comboServiceUrl}/rpc/combos/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicCombo[]> {
        try {
            const response = await axios.post(`${this.comboServiceUrl}/rpc/combos/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }

}