import { Paginated, PagingDTO } from "src/share";
import { PurchaseProposal } from "../models/purchaseProposal.model";
import { PurchaseProposal as PrismaPurchaseProposal } from "@prisma/client";
import type { PurchaseProposalCreateDTO, PurchaseProposalUpdateDTO, PurchaseProposalCondDTO } from "../dtos/purchaseProposal.dto";
import { IPurchaseProposalRepository } from "../ports/purchaseProposal.port";
import prisma from "src/share/components/prisma";

// Triển khai PurchaseProposalPrismaRepo
export class PurchaseProposalPrismaRepo implements IPurchaseProposalRepository {
    // Lấy thông tin đề xuất mua hàng theo ID
    async get(purchaseProposalId: string): Promise<PurchaseProposal | null> {
        const result = await prisma.purchaseProposal.findFirst({ where: { id: purchaseProposalId } });

        if (!result) return null;

        return this._toModel(result);
    }

    // Lấy danh sách đề xuất mua hàng theo điều kiện
    async list(cond: PurchaseProposalCondDTO, paging: PagingDTO): Promise<Paginated<PurchaseProposal>> {
        const {code, creatorId, status, note, ...rest } = cond;
        let where = {
            ...rest,
        }

        if (code) {
            where = {
                ...where,
                code: code,
            }
        }

        if (creatorId) {    
            where = {
                ...where,
                creatorId: creatorId,
            }
        }
        
        if (status) {
            where = {
                ...where,
                status: status,
            }
        }
        
        if (note) {
            where = {
                ...where,
                note: note,
            }
        }

        const total = await prisma.purchaseProposal.count({ where });
        
        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.purchaseProposal.findMany({
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

    // Lấy danh sách đề xuất mua hàng theo nhiều ID
    async listByIds(purchaseProposalIds: string[]): Promise<PurchaseProposal[]> {
        const result = await prisma.purchaseProposal.findMany({ where: { id: { in: purchaseProposalIds } } });

        return result.map((item) => this._toModel(item));
    }

    // Tạo mới đề xuất mua hàng
    async insert(dto: PurchaseProposal): Promise<void> {
        await prisma.purchaseProposal.create({ data: { ...dto } });
    }

    // Cập nhật đề xuất mua hàng
    async update(purchaseProposalId: string, dto: PurchaseProposalUpdateDTO): Promise<void> {
        await prisma.purchaseProposal.update({ where: { id: purchaseProposalId }, data: { ...dto } });
    }

    // Xoá đề xuất mua hàng    
    async delete(purchaseProposalId: string): Promise<void> {
        await prisma.purchaseProposal.delete({ where: { id: purchaseProposalId } });
    }

    // Chuyển đổi dữ liệu từ Prisma sang Model
    private _toModel(data: PrismaPurchaseProposal): PurchaseProposal {
        return { ...data } as PurchaseProposal;
    }
}