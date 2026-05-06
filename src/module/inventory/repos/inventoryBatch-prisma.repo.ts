import { Paginated, PagingDTO } from "src/share";
import { InventoryBatch } from "../models/inventoryBatch.model";
import { InventoryBatch as PrismaInventoryBatch } from "@prisma/client";
import type { InventoryBatchCreateDTO, InventoryBatchUpdateDTO, InventoryBatchCondDTO } from "../dtos/inventoryBatch.dto";
import { IInventoryBatchRepository } from "../ports/inventoryBatch.port";
import prisma from "src/share/components/prisma";

// Triển khai InventoryBatchPrismaRepo
export class InventoryBatchPrismaRepo implements IInventoryBatchRepository {
    // Lấy thông tin lô hàng tồn kho theo ID
    async get(inventoryBatchId: string): Promise<InventoryBatch | null> {
        const result = await prisma.inventoryBatch.findFirst({ where: { id: inventoryBatchId } });

        if (!result) return null;

        return this._toModel(result);
    }

    // Lấy danh sách lô hàng tồn kho theo điều kiện
    async list(cond: InventoryBatchCondDTO, paging: PagingDTO): Promise<Paginated<InventoryBatch>> {
        const { ingredientId, importInvoiceDetailId, quantity, expiryDate, importDate, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (ingredientId) {
            where = {
                ...where,
                ingredientId: ingredientId,
            }
        }

        if (importInvoiceDetailId) {
            where = {
                ...where,
                importInvoiceDetailId: importInvoiceDetailId,
            }
        }
        
        if (quantity) {
            where = {
                ...where,
                quantity: quantity,
            }
        }
        
        if (expiryDate) {
            where = {
                ...where,
                expiryDate: expiryDate,
            }
        }

        if (importDate) {
            where = {
                ...where,
                importDate: importDate,
            }
        }

        const total = await prisma.inventoryBatch.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.inventoryBatch.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: {
                importDate: "desc",
            }
        });

        return {
            data: result.map(this._toModel),
            paging,
            total,
        };
    }

    // Lấy danh sách tồn kho theo nhiều ID
    async listByIds(ids: string[]): Promise<InventoryBatch[]> {
        let result;
        if (ids.length > 0){
            result = await prisma.inventoryBatch.findMany({ where: { id: { in: ids } } });
        } else {
            result = await prisma.inventoryBatch.findMany();
        }
        return result.map(this._toModel);
    }

    // Tạo mới lô hàng tồn kho
    async insert(dto: InventoryBatch): Promise<void> {
        await prisma.inventoryBatch.create({ data: dto });
    }

    // Cập nhật lô hàng tồn kho
    async update(inventoryBatchId: string, data: InventoryBatchUpdateDTO): Promise<void> {
        await prisma.inventoryBatch.update({ where: { id: inventoryBatchId }, data });
    }

    // Xóa lô hàng tồn kho    
    async delete(inventoryBatchId: string): Promise<void> {
        await prisma.inventoryBatch.delete({ where: { id: inventoryBatchId } });
    }


    // Chuyển đổi dữ liệu từ Prisma sang Model
    private _toModel(data: PrismaInventoryBatch): InventoryBatch {
        return { ...data } as InventoryBatch;
    }
}