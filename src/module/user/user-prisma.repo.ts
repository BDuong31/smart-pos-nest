import { Injectable } from "@nestjs/common";
import { IUserRepository } from "./user.port";
import prisma from "src/share/components/prisma"
import { User as UserPrisma } from "@prisma/client";
import { User } from "./user.model";
import { UserRole } from "src/share";
import { UserCondDTO, UserUpdateDTO } from "./user.dto";

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
    async findByCond(cond: UserCondDTO): Promise<User | null> {
        const data = await prisma.user.findFirst({
            where: { ...cond }
        })
        if (!data) return null;
        return this._toModel(data);
    }

    // Lấy người dùng theo đúng 1 trong các Cond
    async findByCondOr(cond: UserCondDTO): Promise<User | null> {
        const data = await prisma.user.findFirst({
            where: { OR: [ ...Object.entries(cond).map(([key, value]) => ({ [key]: value })) ] }
        })
        if (!data) return null;
        return this._toModel(data);
    }

    // Lấy người dùng theo danh sách
    async listByIds(ids: string[]): Promise<User[]> {
        const data = await prisma.user.findMany({
            where: { id: { in: ids } }
        })
        
        return data.map(this._toModel);
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
