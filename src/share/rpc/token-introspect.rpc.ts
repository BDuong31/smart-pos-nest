import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ITokenIntrospector, TokenIntrospectorResult, TokenPayload } from '../interface';

// Triển khai ITokenIntrospector sử dụng dịch vụ từ xa để kiểm tra token
@Injectable()
export class TokenIntrospectorRPCClient<T extends TokenPayload> implements ITokenIntrospector<T> {
    constructor(private readonly rpcUrl: string) {}

    // Hàm kiểm tra token từ dịch vụ từ xa
    async introspect(token: string): Promise<TokenIntrospectorResult<T>> {
        try {
            const response = await axios.post(
                this.rpcUrl,
                { token },
                { timeout: 5000 } // Thiết lập thời gian chờ 5 giây
            );

            const { sub, role } = response.data ;

            return { payload: { sub, role } as T, isOk: true };
        } catch (error) {
            return { payload: null, isOk: false, error: error instanceof Error ? error : new Error('Unknown error') };
        }
    }
}
