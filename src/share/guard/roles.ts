import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Requester } from "../interface";
import { ROLES_KEY } from "./roles.decorator";

// Guard để kiểm tra vai trò người dùng
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    // Hàm kiểm tra vai trò
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Lấy vai trò yêu cầu từ metadata
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Nếu không có vai trò yêu cầu, cho phép truy cập
        if(!requiredRoles) {
            return true;
        }
        const request = context.switchToHttp().getRequest(); // Lấy request từ context
        const requester = request['requester'] as Requester; // Lấy thông tin requester từ request
        return requiredRoles.some((role) => requester.role === role); // Kiểm tra vai trò của requester
    }
}