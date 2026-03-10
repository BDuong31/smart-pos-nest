import { Paginated, PagingDTO } from "src/share";
import { StockCheckDetail } from "../models/stockCheckDetail.model";
import { StockCheckDetail as PrismaStockCheckDetail } from "@prisma/client";
import type { StockCheckDetailCreateDTO, StockCheckDetailUpdateDTO, StockCheckDetailCondDTO } from "../dtos/stockCheckDetail.dto";
import { IStockCheckDetailRepository } from "../ports/stockCheckDetail.port";
import prisma from "src/share/components/prisma";

// Triển khai StockCheckDetailPrismaRepo
export class StockCheckDetailPrismaRepo implements IStockCheckDetailRepository {
    // Lấy thông tin chi tiết kiểm kê tồn kho theo ID
    async get(stockCheckDetailId: string): Promise<StockCheckDetail | null> {
        const result = await prisma.stockCheckDetail.findFirst({ where: { id: stockCheckDetailId } });

        if (!result) return null;

        return this._toModel(result);
    }

    // Lấy danh sách chi tiết kiểm kê tồn kho theo điều kiện
    async list(cond: StockCheckDetailCondDTO, paging: PagingDTO): Promise<Paginated<StockCheckDetail>> {
        const { checkId, ingredientId, systemQty, actualQty, reason, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (checkId) {
            where = {
                ...where,
                checkId: checkId,
            }
        }

        if (ingredientId) {
            where = {
                ...where,
                ingredientId: ingredientId,
            }
        }

        if (systemQty) {
            where = {
                ...where,
                systemQty: systemQty,
            }
        }

        if (actualQty) {
            where = {
                ...where,
                actualQty: actualQty,
            }
        }

        if (reason) {
            where = {
                ...where,
                reason: reason,
            }
        }
        
        const total = await prisma.stockCheckDetail.count({ where });

        const skip = (paging.page - 1) * paging.limit;
        
        const result = await prisma.stockCheckDetail.findMany({
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

    // Lấy danh sách chi tiết kiểm kê tồn kho theo nhiều ID
    async listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<StockCheckDetail>> {
        const total = await prisma.stockCheckDetail.count({ where: { id: { in: ids } } });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.stockCheckDetail.findMany({
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

    // Tạo mới chi tiết kiểm kê tồn kho
    async insert(data: StockCheckDetail): Promise<void> {
        await prisma.stockCheckDetail.create({ data: data });
    }

    // Cập nhật chi tiết kiểm kê tồn kho
    async update(stockCheckDetailId: string, data: StockCheckDetailUpdateDTO): Promise<void> {
        await prisma.stockCheckDetail.update({ where: { id: stockCheckDetailId }, data: data });
    }
    
    // Xoá chi tiết kiểm kê tồn kho
    async delete(stockCheckDetailId: string): Promise<void> {
        await prisma.stockCheckDetail.delete({ where: { id: stockCheckDetailId } });
    }

    // Chuyển đổi dữ liệu từ prisma sang model
    private _toModel(data: PrismaStockCheckDetail): StockCheckDetail {
        return { ...data } as StockCheckDetail;
    }
}