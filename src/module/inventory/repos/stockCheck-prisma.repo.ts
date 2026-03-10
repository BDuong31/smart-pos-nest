import { Paginated, PagingDTO } from "src/share";
import { StockCheck } from "../models/stockCheck.model";
import { StockCheck as PrismaStockCheck } from "@prisma/client";
import type { StockCheckCreateDTO, StockCheckUpdateDTO, StockCheckCondDTO } from "../dtos/stockCheck.dto";
import { IStockCheckRepository } from "../ports/stockCheck.port";
import prisma from "src/share/components/prisma";

// Triển khai StockCheckPrismaRepo
export class StockCheckPrismaRepo implements IStockCheckRepository {
    // Lấy thông tin kiểm kê tồn kho theo ID
    async get(stockCheckId: string): Promise<StockCheck | null> {
        const result = await prisma.stockCheck.findFirst({ where: { id: stockCheckId } });

        if (!result) return null;

        return this._toModel(result);
    }

    // Lấy danh sách kiểm kê tồn kho theo điều kiện
    async list(cond: StockCheckCondDTO, paging: PagingDTO): Promise<Paginated<StockCheck>> {
        const {code, userId, note, checkDate, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (code) {
            where = {
                ...where,
                code: code,
            }
        }

        if (userId) {
            where = {
                ...where,
                userId: userId,
            }
        }

        if (note) {
            where = {
                ...where,
                note: note,
            }
        }

        if (checkDate) {
            where = {
                ...where,
                checkDate: checkDate,
            }
        }

        const total = await prisma.stockCheck.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.stockCheck.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: {
                createdAt: "desc",
            }
        });

        return {
            data: result.map(this._toModel),
            paging,
            total,
        }
    }

    // Lấy danh sách kiểm kê tồn kho theo nhiều ID
    async listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<StockCheck>> {
        const total = await prisma.stockCheck.count({ where: { id: { in: ids } } });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.stockCheck.findMany({
            where: { id: { in: ids } },
            skip,
            take: paging.limit,
            orderBy: {
                createdAt: "desc",
            }
        });

        return {
            data: result.map(this._toModel),
            paging,
            total,
        }
    }

    // Tạo mới kiểm kê tồn kho
    async insert(dto: StockCheck): Promise<void> {
        await prisma.stockCheck.create({ data: dto });
    }

    // Cập nhật kiểm kê tồn kho
    async update(stockCheckId: string, dto: StockCheckUpdateDTO): Promise<void> {
        await prisma.stockCheck.update({ where: { id: stockCheckId }, data: dto });
    }

    // Xoá kiểm kê tồn kho
    async delete(stockCheckId: string): Promise<void> {
        await prisma.stockCheck.delete({ where: { id: stockCheckId } });
    }

    // Chuyển đổi dữ liệu từ prisma sang model
    private _toModel(data: PrismaStockCheck): StockCheck {
        return { ...data } as StockCheck;
    }
}