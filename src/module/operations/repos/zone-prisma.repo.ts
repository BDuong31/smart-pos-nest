import prisma from 'src/share/components/prisma'
import { Injectable } from '@nestjs/common';
import { Zone } from '../models/zone.model';
import type { ZoneCreatedDTO, ZoneUpdateDTO, ZoneCondDTO} from '../dtos/zone.dto';
import type { IZoneRepository } from '../ports/zone.port';
import type { Zone as ZonePrisma } from '@prisma/client';
import { Paginated, PagingDTO } from 'src/share/data-model';

// Lớp ZonePrismaRepo cung cấp phương thức truy vấn dữ liệu khu vực từ Prisma
@Injectable()
export class ZonePrismaRepo implements IZoneRepository {
    // Lấy khu vực theo ID
    async get(id: string): Promise<Zone | null> {
        const data = await prisma.zone.findFirst({ where: { id } });

        if (!data) return null;
        
        return this._toModel(data);
    }

    // Lấy danh sách khu vực
    async list(cond: ZoneCondDTO, paging: PagingDTO): Promise<Paginated<Zone>> {
        const { name, description, isActive, ...rest} = cond; 

        let where = {
            ...rest,
        }

        if (name) {
            where = {
                ...where,
                name: name,
            }
        }

        if (description) {
            where = {
                ...where,
                description: description,
            }
        }

        if (isActive !== undefined) {
            where = {
                ...where,
                isActive: isActive,
            }
        }

        const total = await prisma.zone.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.zone.findMany({
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

    // Lấy danh sách khu vực theo nhiều ID
    async listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Zone>> {
        const total = await prisma.zone.count({ where: { id: { in: ids } } });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.zone.findMany({
            where: { id: { in: ids } },
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

    // Tạo mới khu vực
    async insert(zone: Zone): Promise<void> {
        await prisma.zone.create({ data: zone });
    }

    // Cập nhật thông tin khu vực
    async update(id: string, dto: ZoneUpdateDTO): Promise<void> {
        await prisma.zone.update({ where: { id }, data: dto });
    }

    // Xóa khu vực theo ID
    async delete(id: string): Promise<void> {
        await prisma.zone.delete({ where: { id } });
    }

    // Chuyển đổi dữ liệu từ Prisma sang model Zone
    private _toModel(data: ZonePrisma): Zone {
        return {...data} as Zone;
    }
}