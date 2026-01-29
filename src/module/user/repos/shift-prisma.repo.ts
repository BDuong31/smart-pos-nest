import { ShiftCondDTO } from "../dtos/shift.dto";
import { Shift } from "../models/shift.model";
import { Shift as ShiftPrisma } from "@prisma/client";
import { IShiftRepository } from "../ports/shift.port";
import prisma from "src/share/components/prisma"

// Lớp ShiftPrismaRepository cung cấp phương thức truy vấn dữ liệu ca làm việc từ Prisma
export class ShiftPrismaRepository implements IShiftRepository {

    // Phương thức lấy ca làm việc theo ID
    async get(id: string): Promise<Shift | null> {
        const data = await prisma.shift.findFirst({
            where: { id }
        });
        if (!data) return null;
        
        return this._toModel(data);
    }

    // Phương thức tìm ca làm việc theo điều kiện
    async findByCond(cond: ShiftCondDTO): Promise<Shift[]> {
        const data = await prisma.shift.findMany({
            where: { ...cond }
        });
        
        if (!data) return [];
        return data.map(this._toModel);
    }

    // Phương thức tìm ca làm việc đúng theo 1 trong các điều kiện
    async findByCondOr(cond: ShiftCondDTO): Promise<Shift[]> {
        const data = await prisma.shift.findMany({
            where: { OR: [ ...Object.entries(cond).map(([key, value]) => ({ [key]: value })) ] }
        });
        if (!data) return [];
        return data.map(this._toModel);
    }
    
    // Phương thức lấy danh sách ca làm việc theo mảng IDs
    async listByIds(ids: string[]): Promise<Shift[]> {
        const data = await prisma.shift.findMany({
            where: { id: { in: ids } }
        });
        return data.map(this._toModel);
    }

    // Phương thức thêm ca làm việc mới
    async insert(shift: any): Promise<void> {
        await prisma.shift.create({ data: shift });
    }

    // Phương thức cập nhật ca làm việc
    async update(id: string, dto: Partial<any>): Promise<void> {
        await prisma.shift.update({
            where: { id },
            data: dto
        });
    }

    // Phương thức xóa ca làm việc theo ID
    async delete(id: string): Promise<void> {
        await prisma.shift.delete({
            where: { id }
        });
    }
    

    // Chuyển đổi dữ liệu từ Prisma sang Model
    private _toModel(data: ShiftPrisma): Shift {
        return {...data} as Shift;
    }   
}