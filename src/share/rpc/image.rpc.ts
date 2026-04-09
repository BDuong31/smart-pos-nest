import { Injectable } from '@nestjs/common';
import { PublicImage, IPublicImageRpc } from '..';
import axios from 'axios';

@Injectable()
export class ImageRPCClient implements IPublicImageRpc {
    constructor(private readonly imageServiceUrl: string) {}

    async getImagesByRefId(refId: string, type: string, isMain?: boolean): Promise<PublicImage[]> {
        try {
            if (isMain === undefined) {
                const { data } = await axios.post(`${this.imageServiceUrl}/images/rpc/get-by-ref-id`, { refId, type });
                return data.data;
            } else {
                const { data } = await axios.post(`${this.imageServiceUrl}/images/rpc/get-by-ref-id`, { refId, type, isMain });
                return data.data;
            }        
        } catch (error) {
            return [];
        }
    }
}