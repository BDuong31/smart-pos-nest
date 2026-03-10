import { Paginated, PagingDTO } from "src/share";
import { ImportInvoice } from "../models/importInvoice.model";
import { ImportInvoice as PrismaImportInvoice } from "@prisma/client";
import type { ImportInvoiceCreateDTO, ImportInvoiceUpdateDTO, ImportInvoiceCondDTO } from "../dtos/importInvoice.dto";
import { IImportInvoiceRepository } from "../ports/importInvoice.port";
import prisma from "src/share/components/prisma";

// Triển khai ImportInvoicePrismaRepo
export class ImportInvoicePrismaRepo implements IImportInvoiceRepository {
    // Lấy thông tin phiếu nhập kho theo ID
    async get(importInvoiceId: string): Promise<ImportInvoice | null> {
        const result = await prisma.importInvoice.findFirst({ where: { id: importInvoiceId } });

        if (!result) return null;

        return this._toModel(result);
    }

    // Lấy danh sách phiếu nhập kho theo điều kiện
    async list(cond: ImportInvoiceCondDTO, paging: PagingDTO): Promise<Paginated<ImportInvoice>> {
        const {code, supplierId, totalCost, importDate, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (code) {
            where = {
                ...where,
                code: code,
            }
        }

        if (supplierId) {
            where = {
                ...where,
                supplierId: supplierId,
            }
        }

        if (totalCost) {
            where = {
                ...where,
                totalCost: totalCost,
            }
        }

        if (importDate) {
            where = {
                ...where,
                importDate: importDate,
            }
        }

        const total = await prisma.importInvoice.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.importInvoice.findMany({
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

    // Lấy danh sách phiếu nhập kho theo nhiều ID
    async listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<ImportInvoice>> {
        const total = await prisma.importInvoice.count({ where: { id: { in: ids } } });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.importInvoice.findMany({
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

    // Tạo mới phiếu nhập kho
    async insert(dto: ImportInvoice): Promise<void> {
        await prisma.importInvoice.create({ data: dto });
    }

    // Cập nhật phiếu nhập kho
    async update(importInvoiceId: string, dto: ImportInvoiceUpdateDTO): Promise<void> {
        await prisma.importInvoice.update({ where: { id: importInvoiceId }, data: dto });
    }

    // Xóa phiếu nhập kho
    async delete(importInvoiceId: string): Promise<void> {
        await prisma.importInvoice.delete({ where: { id: importInvoiceId } });
    }

    // Chuyển đổi dữ liệu từ Prisma sang Model
    private _toModel(data: PrismaImportInvoice): ImportInvoice {
        return { ...data } as ImportInvoice;
    }
}