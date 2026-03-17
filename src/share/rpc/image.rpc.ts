import { Injectable } from '@nestjs/common';
import { PublicImage, IPublicImageRpc } from '..';
import axios from 'axios';

@Injectable()
export class ImageRPCClient implements IPublicImageRpc {
    constructor(private readonly imageServiceUrl: string) {}

    async getImagesByRefId(refId: string[] | string, type: string, isMain?: boolean): Promise<PublicImage[]> {
        try {
            if (isMain === undefined) {
                const response = await axios.post(`${this.imageServiceUrl}/image/rpc/get-by-ref-id`, { refId, type });
                return response.data;
            } else {
                const response = await axios.post(`${this.imageServiceUrl}/image/rpc/get-by-ref-id`, { refId, type, isMain });
                return response.data;
            }
        } catch (error) {
            return [];
        }
    }
}