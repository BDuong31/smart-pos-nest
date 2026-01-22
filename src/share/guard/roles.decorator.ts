import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../interface";

export const ROLES_KEY = 'roles'; // Khóa để lưu trữ metadata
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles); // Decorator để gán vai trò cho route handler
