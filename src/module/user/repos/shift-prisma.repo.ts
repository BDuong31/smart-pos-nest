import { ShiftCondDTO } from "../dtos/shift.dto";
import { Shift } from "../models/shift.model";
import { Shift as ShiftPrisma } from "@prisma/client";
import { IShiftRepository } from "../ports/shift.port";
import prisma from "src/share/components/prisma"
import { Paginated, PagingDTO } from "src/share";

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

    // Phương thức lấy danh sách ca làm việc theo điều kiện và phân trang
    async list(cond: ShiftCondDTO, paging: PagingDTO): Promise<Paginated<Shift>> {
        const { userId, startTime, endTime, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (userId) {
            where = {
                ...where,
                userId: userId,
            }
        }

        if (startTime) {
            where = {
                ...where,
                startTime: { gte: startTime },
            }
        }

        if (endTime) {
            where = {
                ...where,
                endTime: { lte: endTime },
            }
        }

        const total = await prisma.shift.count({ where });

        const skip = (paging.page - 1) * paging.limit;  

        const data = await prisma.shift.findMany({
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

     // Phương thức lấy danh sách ca làm việc của nhân viên theo user ID    
    async listByIds(ids: string[]): Promise<Shift[]> {
        const data = await prisma.shift.findMany({
            where: { userId: { in: ids } },
            orderBy: { createdAt: 'desc' }
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