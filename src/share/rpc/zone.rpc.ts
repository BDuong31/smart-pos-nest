import { Injectable } from "@nestjs/common";
import { PublicZone, IPublicZoneRpc } from "..";
import axios from "axios";

@Injectable()
export class ZoneRPCClient implements IPublicZoneRpc {
    constructor(private readonly zoneServiceUrl: string) {}

    async findById(id: string): Promise<PublicZone | null> {
        try {
            const response = await axios.get(`${this.zoneServiceUrl}/rpc/zones/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicZone[]> {
        try {
            const response = await axios.post(`${this.zoneServiceUrl}/rpc/zones/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}