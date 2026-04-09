import { Reflector } from "@nestjs/core";
import { CACHE_SERVICE, TOKEN_INTROSPECTOR } from "../di-token";
import {AccessTokenPayload,type ITokenIntrospector, type IAccessTokenProvider, type ICacheService} from "../interface";import { IS_PUBLIC_KEY } from "./public.decorator";
import { CanActivate, ExecutionContext, forwardRef, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request} from "express";

// Lớp guard kiểm tra chế độ bảo trì
@Injectable()
export class MaintenanceGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @Inject(CACHE_SERVICE) private readonly redis: ICacheService,
        @Inject(TOKEN_INTROSPECTOR) private readonly introspector: ITokenIntrospector<AccessTokenPayload>
    ) {}

    // Kiểm tra chế độ bảo trì
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ])
        if (isPublic) return true; // Nếu là public thì không kiểm tra chế độ bảo trì

        const isMaintenance = await this.redis.get(`system:maintenance`) === 'true';

        if (!isMaintenance) return true; // Nếu không phải bảo trì chưa kích hoạt thì không kiểm tra

        // Kiểm tra quyền admin
        const request = context.switchToHttp().getRequest();
        const token = extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException();
        }

        // Lấy thông tin người dùng từ tokne
        const user = await (await this.introspector.introspect(token)).payload

        // Nếu là admin thì không kiểm tra chế độ bảo trì
        if (user?.role === 'admin') {
            return true;
        }

        // Trả về lỗi 503 Service Unavailable
        throw new HttpException({
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            error: 'MAINTENANCE_MODE',
            message: 'Hệ thống đang bảo trì định kỳ, vui lòng quay lại sau.',
        }, HttpStatus.SERVICE_UNAVAILABLE)
    }
}

// Hàm trích xuất token từ header
function extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
}