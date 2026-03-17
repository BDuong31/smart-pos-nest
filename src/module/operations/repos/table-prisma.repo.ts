import prisma from 'src/share/components/prisma'
import { Injectable } from '@nestjs/common';
import { Table } from '../models/table.model';
import type { TableCreatedDTO, TableUpdateDTO, TableCondDTO} from '../dtos/table.dto';
import type { ITableRepository } from '../ports/table.port';
import type { Prisma, Table as TablePrisma } from '@prisma/client';
import { Paginated, PagingDTO } from 'src/share/data-model';
import { Reservation } from '../models/reservation.model';

// Lớp TablePrismaRepo cung cấp phương thức truy vấn dữ liệu bàn từ Prisma
@Injectable()
export class TablePrismaRepo implements ITableRepository {
    // Lấy bàn theo ID
    async get(id: string): Promise<Table | null> {
        const data = await prisma.table.findFirst({ where: { id } });

        if (!data) return null;
        
        return this._toModel(data);
    }

    // Lấy danh sách bàn
    async list(cond: TableCondDTO, paging: PagingDTO): Promise<Paginated<Table>> {
        const { name, zoneId, qrCode, capacity, isActive, status, ...rest} = cond;
        
        let where = {
            ...rest,
        }
        
        if (name) {
            where = {
                ...where,
                name: name,
            }
        }

        if (zoneId) {
            where = {
                ...where,
                zoneId: zoneId,
            }
        }

        if (qrCode) {
            where = {
                ...where,
                qrCode: qrCode,
            }
        }

        if (capacity) {
            where = {
                ...where,
                capacity: capacity,
            }
        }

        if (isActive !== undefined) {
            where = {
                ...where,
                isActive: isActive,
            }
        }   

        if (status) {
            where = {
                ...where,
                status: status,
            }
        }

        const total = await prisma.table.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.table.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { name: 'asc' },
        });

        return {
            data: result.map(this._toModel),
            paging,
            total
        }
    }

    // Lấy danh sách bàn theo nhiều ID
    async listByIds(ids: string[]): Promise<Table[]> {
        const data = await prisma.table.findMany({ where: { id: { in: ids } } });

       return data.map(this._toModel);
    }

    // Lấy danh sách bàn trống theo thời gian và điều kiện
    async listAvailable(reservations: Reservation[], time: Date, cond: TableCondDTO): Promise<Table[]> {
        const { name, zoneId, qrCode, capacity, isActive, status} = cond;

        let where = {}

        if (name) {
            where = {
                ...where,
                name: name,
            }
        }

        if (zoneId) {
            where = {
                ...where,
                zoneId: zoneId,
            }
        }

        if (qrCode) {
            where = {
                ...where,
                qrCode: qrCode,
            }
        }

        if (capacity) {
            where = {
                ...where,
                capacity: capacity,
            }
        }

        if (isActive !== undefined) {
            where = {
                ...where,
                isActive: isActive,
            }
        }

        if (status) {
            where = {
                ...where,
                status: status,
            }
        }

        let reservedTableIds: string[] = [];

        if (time) {
            const buffer = 30 * 60 * 1000;

            reservedTableIds = reservations
                .filter(r => {
                    return !(
                    r.time.getTime() + buffer <= time.getTime() ||
                    r.time.getTime() - buffer >= time.getTime()
                    );
                })
            .map(r => r.tableId);
        }

        const data = await prisma.table.findMany({
            where: {
                ...where,
                id: { notIn: reservedTableIds },
            },
            orderBy: { name: 'asc' },
        });
        
        return data.map(this._toModel);
    }

    // Tạo mới bàn
    async insert(table: Table): Promise<void> {
        await prisma.table.create({ data: table });
    }

    // Cập nhật thông tin bàn
    async update(id: string, dto: TableUpdateDTO): Promise<void> {
        await prisma.table.update({ where: { id }, data: dto });
    }

    // Xóa bàn theo ID
    async delete(id: string): Promise<void> {
        await prisma.table.delete({ where: { id } });
    }

    // Chuyển đổi dữ liệu từ Prisma sang Model
    private _toModel(data: TablePrisma): Table {
        return {...data } as Table;
    }
}