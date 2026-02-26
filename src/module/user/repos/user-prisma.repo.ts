import { Injectable } from "@nestjs/common";
import { IUserRepository } from "../ports/user.port";
import prisma from "src/share/components/prisma"
import { User as UserPrisma, Prisma } from "@prisma/client";
import { User } from "../models/user.model";
import { Paginated, PagingDTO, UserRole } from "src/share";
import { UserCondDTO, UserUpdateDTO } from "../dtos/user.dto";

// Lớp UserPrismaRepository cung cấp phương thức truy vấn dữ liệu người dùng từ Prisma
@Injectable()
export class UserPrismaRepository implements IUserRepository {

    // Lấy người dùng theo ID
    async get(id: string): Promise<User | null> {
        
        const data = await prisma.user.findFirst({
            where: { id }
        })

        if (!data) return null;

        return this._toModel(data);
    }

    // Lấy người dùng theo Cond
    async list(cond: UserCondDTO, paging: PagingDTO): Promise<Paginated<User>> {
        const { username, fullName, email, role, status, rankId, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (username) {
            where = {
                ...where,
                username: username,
            }
        }

        if (fullName) {
            where = {
                ...where,
                fullName: fullName,
            }
        }

        if (email) {
            where = {
                ...where,
                email: email,
            }
        }

        if (role) {
            where = {
                ...where,
                role: role,
            }
        }

        if (status) {
            where = {
                ...where,
                status: status,
            }
        }

        if (rankId) {
            where = {
                ...where,
                rankId: rankId,
            }
        }

        const total = await prisma.user.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const data = await prisma.user.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { createdAt: 'desc' }
        });

        return {
            data: data.map(this._toModel),
            paging,
            total,
        }
    }

    // Lấy người dùng theo danh sách
    async listByIds(ids: string[]): Promise<User[]> {
        const data = await prisma.user.findMany({
            where: { id: { in: ids } }
        })
        
        return data.map(this._toModel);
    }

    // Tìm kiếm người dùng theo từ khóa và phân trang
    async listBySearch(keyword: string, paging: PagingDTO): Promise<Paginated<User>> {
        const where = {
            OR: [
                { username: { contains: keyword, mode: 'insensitive' as Prisma.QueryMode } },
                { fullName: { contains: keyword, mode: 'insensitive' as Prisma.QueryMode } },
                { email: { contains: keyword, mode: 'insensitive' as Prisma.QueryMode } },
            ]
        };

        const total = await prisma.user.count({ where });   

        const skip = (paging.page - 1) * paging.limit;

        const data = await prisma.user.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { createdAt: 'desc' }
        });

        return {
            data: data.map(this._toModel),
            paging,
            total,
        }
    }

    // Tạo người dùng mới
    async insert(user: User): Promise<void> {
        await prisma.user.create({ data: user });
    }

    // Cập nhật thông tin người dùng
    async update(id: string, dto: UserUpdateDTO): Promise<void> {
        await prisma.user.update({
            where: { id },
            data: dto
        });
    }
    
    // Xoá người dùng
    async delete(id: string): Promise<void> {
        await prisma.user.delete({
            where: { id }
        });
    }

    // Chuyển đổi dữ liệu từ Prisma sang Model
    private _toModel(data: UserPrisma): User {
        return {...data, role: data.role as UserRole} as User;
    }   
}
