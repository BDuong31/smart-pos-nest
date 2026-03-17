import { Injectable } from "@nestjs/common";
import { PublicShift, IPublicShiftRpc } from "..";
import axios from "axios";

@Injectable()
export class ShiftRPCClient implements IPublicShiftRpc {
    constructor(private readonly shiftServiceUrl: string) {}

    async getCurrentShift(userId: string): Promise<PublicShift | null> {
        try {
            const response = await axios.get(`${this.shiftServiceUrl}/rpc/shifts/current?userId=${userId}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async getShiftDetail(shiftId: string): Promise<PublicShift | null> {
        try {
            const response = await axios.get(`${this.shiftServiceUrl}/rpc/shifts/detail?shiftId=${shiftId}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async isUserWorking(userId: string): Promise<boolean> {
        try {
            const response = await axios.get(`${this.shiftServiceUrl}/rpc/shifts/is-working/${userId}`);
            return response.data;
        } catch (error) {
            return false;
        }
    }
}