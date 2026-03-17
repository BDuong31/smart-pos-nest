import { Injectable } from "@nestjs/common";
import { PublicReservation, IPublicReservationRpc } from "..";
import axios from "axios";

@Injectable()
export class ReservationRPCClient implements IPublicReservationRpc {
    constructor(private readonly reservationServiceUrl: string) {}

    async findById(id: string): Promise<PublicReservation | null> {
        try {
            const response = await axios.get(`${this.reservationServiceUrl}/rpc/reservations/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicReservation[]> {
        try {
            const response = await axios.post(`${this.reservationServiceUrl}/rpc/reservations/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}