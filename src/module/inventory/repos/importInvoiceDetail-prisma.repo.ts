import { Paginated, PagingDTO } from "src/share";
import { ImportInvoiceDetail } from "../models/importInvoiceDetail.model";
import { ImportInvoiceDetail as PrismaImportInvoiceDetail } from "@prisma/client";
import type { ImportInvoiceDetailCreateDTO, ImportInvoiceDetailUpdateDTO, ImportInvoiceDetailCondDTO } from "../dtos/importInvoiceDetail.dto";
import { IImportInvoiceDetailRepository } from "../ports/importInvoiceDetail.port";
import prisma from "src/share/components/prisma";

// Triển khai ImportInvoiceDetailPrismaRepo
export class ImportInvoiceDetailPrismaRepo implements IImportInvoiceDetailRepository {
    // Lấy thông tin chi tiết phiếu nhập kho theo ID
    async get(importInvoiceDetailId: string): Promise<ImportInvoiceDetail | null> {
        const result = await prisma.importInvoiceDetail.findFirst({ where: { id: importInvoiceDetailId } });

        if (!result) return null;

        return this._toModel(result);
    }

    // Lấy danh sách chi tiết phiếu nhập kho theo điều kiện
    async list(cond: ImportInvoiceDetailCondDTO, paging: PagingDTO): Promise<Paginated<ImportInvoiceDetail>> {
        const { invoiceId, ingredientId, quantity, unit, unitPrice, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (invoiceId) {
            where = {
                ...where,
                invoiceId: invoiceId,
            }
        }

        if (ingredientId) {
            where = {
                ...where,
                ingredientId: ingredientId,
            }
        }

        if (quantity) {
            where = {
                ...where,
                quantity: quantity,
            }
        }

        if (unit) {
            where = {
                ...where,
                unit: unit,
            }
        }

        if (unitPrice) {
            where = {
                ...where,
                unitPrice: unitPrice,
            }
        }

        const total = await prisma.importInvoiceDetail.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.importInvoiceDetail.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: {
                createdAt: "desc",
            }
        });

        return {
            data: result.map((item) => this._toModel(item)),
            paging,
            total,
        };
    }

    // Lấy danh sách chi tiết phiếu nhập kho theo nhiều ID
    async listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<ImportInvoiceDetail>> {
        const total = await prisma.importInvoiceDetail.count({ where: { id: { in: ids } } });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.importInvoiceDetail.findMany({
            where: { id: { in: ids } },
            skip,
            take: paging.limit,
            orderBy: {
                createdAt: "desc",
            }
        });

        return {
            data: result.map((item) => this._toModel(item)),
            paging,
            total,
        };
    }

    // Tạo mới chi tiết phiếu nhập kho
    async insert(dto: ImportInvoiceDetail): Promise<void> {
        await prisma.importInvoiceDetail.create({ data: { ...dto } });
    }

    // Cập nhật thông tin chi tiết phiếu nhập kho theo ID
    async update(importInvoiceDetailId: string, dto: ImportInvoiceDetailUpdateDTO): Promise<void> {
        await prisma.importInvoiceDetail.update({ where: { id: importInvoiceDetailId }, data: { ...dto } });
    }

    // Xóa chi tiết phiếu nhập kho theo ID
    async delete(importInvoiceDetailId: string): Promise<void> {
        await prisma.importInvoiceDetail.delete({ where: { id: importInvoiceDetailId } });
    }

    // Chuyển đổi dữ liệu từ Prisma sang model
    private _toModel(data: PrismaImportInvoiceDetail): ImportInvoiceDetail {
        return { ...data } as ImportInvoiceDetail;
    }
}