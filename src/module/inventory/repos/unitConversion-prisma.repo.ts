import { Paginated, PagingDTO } from "src/share";
import { UnitConversion } from "../models/unitConversion.model";
import { UnitConversion as PrismaUnitConversion } from "@prisma/client";
import type { UnitConversionCreateDTO, UnitConversionUpdateDTO, UnitConversionCondDTO } from "../dtos/unitConversion.dto";
import { IUnitConversionRepository } from "../ports/unitConversion.port";
import prisma from "src/share/components/prisma";

// Triển khai UnitConversionPrismaRepo
export class UnitConversionPrismaRepo implements IUnitConversionRepository {
    // Lấy thông tin quy đổi đơn vị theo ID
    async get(unitConversionId: string): Promise<UnitConversion | null> {
        const result = await prisma.unitConversion.findFirst({ where: { id: unitConversionId } });

        if (!result) return null;

        return this._toModel(result);
    }

    // Lấy danh sách quy đổi đơn vị theo điều kiện
    async list(cond: UnitConversionCondDTO, paging: PagingDTO): Promise<Paginated<UnitConversion>> {
        const { ingredientId, fromUnit, toUnit, factor, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (ingredientId) {
            where = {
                ...where,
                ingredientId: ingredientId,
            }
        }

        if (fromUnit) {
            where = {
                ...where,
                fromUnit: fromUnit,
            }
        }

        if (toUnit) {
            where = {
                ...where,
                toUnit: toUnit,
            }
        }

        if (factor) {
            where = {
                ...where,
                factor: factor,
            }
        }

        const total = await prisma.unitConversion.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.unitConversion.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { createdAt: 'desc' },
        });

        return {
            data: result.map(this._toModel),
            paging,
            total
        }
    }

    // Lấy danh sách quy đổi đơn vị theo nhiều ID
    async listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<UnitConversion>> {
        const total = await prisma.unitConversion.count({ where: { id: { in: ids } } });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.unitConversion.findMany({
            where: { id: { in: ids } },
            skip,
            take: paging.limit,
            orderBy: { createdAt: 'desc' },
        });

        return {
            data: result.map(this._toModel),
            paging,
            total
        }
    }

    // Tạo mới quy đổi đơn vị
    async insert(unitConversion: UnitConversion): Promise<void> {
        await prisma.unitConversion.create({ data: unitConversion });
    }

    // Cập nhật thông tin quy đổi đơn vị theo ID
    async update(unitConversionId: string, unitConversionUpdateDTO: UnitConversionUpdateDTO): Promise<void> {
        await prisma.unitConversion.update({ where: { id: unitConversionId }, data: unitConversionUpdateDTO });
    }

    // Xóa quy đổi đơn vị theo ID
    async delete(unitConversionId: string): Promise<void> {
        await prisma.unitConversion.delete({ where: { id: unitConversionId } });
    }

    // Chuyển đổi từ Prisma model sang model của ứng dụng
    private _toModel(data: PrismaUnitConversion): UnitConversion {
        return { ...data} as UnitConversion
    }
}