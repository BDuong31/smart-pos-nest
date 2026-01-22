import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request} from "express";
import { ErrTokenInvalid } from "../app-error"
import { REMOTE_AUTH_GUARD, TOKEN_INTROSPECTOR } from "../di-token";
import type { AccessTokenPayload, ITokenIntrospector } from "../interface";

// Guard để xác thực token từ request
@Injectable()
export class RemoteAuthGuard implements CanActivate {
    constructor(
        @Inject(TOKEN_INTROSPECTOR) private readonly introspector: ITokenIntrospector<AccessTokenPayload>,
    ) {}

    // Hàm kiểm tra token
    async canActivate(context: ExecutionContext): Promise<boolean> {
        console.log('RemoteAuthGuard: canActivate called');
        const request = context.switchToHttp().getRequest(); // Lấy request từ context
        const token = extractTokenFromHeader(request); // Lấy token từ header

        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            // kiểm tra token
            const { payload, error, isOk} = await this.introspector.introspect(token);

            if (!isOk) {
                throw ErrTokenInvalid.withLog('Token parse failed').withLog(error!.message);
            }

            if (!('role' in payload!)) {
                throw ErrTokenInvalid.withLog('Token is not access token');
            }

            request['requester'] = payload; // Gắn thông tin người dùng vào request
        } catch (error) {
            throw new UnauthorizedException();
        }

        return true; // Cho phép truy cập nếu token hợp lệ
    }
}

// Hàm lấy ra token từ header
function extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
}

// Guard kiểm tra token từ request, nhưng không bắt buộc
@Injectable()
export class RemoteAuthGuardOptional implements CanActivate {
    constructor(
        @Inject(TOKEN_INTROSPECTOR) private readonly introspector: ITokenIntrospector<AccessTokenPayload>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = extractTokenFromHeader(request);
        if (!token) return true;

        const { payload, isOk } = await this.introspector.introspect(token);

        // Optional => không throw
        if (isOk && payload && 'role' in payload) {
            request.requester = payload;
        }

        return true;
    }
}
