import { Injectable } from '@nestjs/common';
import { PublicUser, IPublicUserRpc } from '..';
import axios from 'axios';

@Injectable()
export class UserRPCClient implements IPublicUserRpc {
    constructor(private readonly userServiceUrl: string) {}

    async getUserById(id: string): Promise<PublicUser | null> {
        try {
            const response = await axios.get(`${this.userServiceUrl}/rpc/users/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async getUsersByIds(ids: string[]): Promise<PublicUser[]> {
        try {
            const response = await axios.post(`${this.userServiceUrl}/rpc/users/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}