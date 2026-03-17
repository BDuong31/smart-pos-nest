import { Paginated, PagingDTO } from "src/share";
import { PurchaseProposalDetail } from "../models/purchaseProposalDetail.model";
import { PurchaseProposalDetail as PrismaPurchaseProposalDetail } from "@prisma/client";
import type { PurchaseProposalDetailCreateDTO, PurchaseProposalDetailUpdateDTO, PurchaseProposalDetailCondDTO } from "../dtos/purchaseProposalDetail.dto";
import { IPurchaseProposalDetailRepository } from "../ports/purchaseProposalDetail.port";
import prisma from "src/share/components/prisma";

// Triển khai PurchaseProposalDetailPrismaRepo
export class PurchaseProposalDetailPrismaRepo implements IPurchaseProposalDetailRepository {
    // Lấy thông tin chi tiết đề xuất mua hàng theo ID
    async get(purchaseProposalDetailId: string): Promise<PurchaseProposalDetail | null> {
        const result = await prisma.purchaseProposalDetail.findFirst({ where: { id: purchaseProposalDetailId } });

        if (!result) return null;

        return this._toModel(result);
    }

    // Lấy danh sách chi tiết đề xuất mua hàng theo điều kiện
    async list(cond: PurchaseProposalDetailCondDTO, paging: PagingDTO): Promise<Paginated<PurchaseProposalDetail>> {
        const { proposalId, ingredientId, quantity, unit, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (proposalId) {
            where = {
                ...where,
                proposalId: proposalId,
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

        const total = await prisma.purchaseProposalDetail.count({ where });
        
        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.purchaseProposalDetail.findMany({
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

    // Lấy danh sách chi tiết đề xuất mua hàng theo nhiều ID
    async listByIds(purchaseProposalDetailIds: string[]): Promise<PurchaseProposalDetail[]> {
        const result = await prisma.purchaseProposalDetail.findMany({ where: { id: { in: purchaseProposalDetailIds } } });

        return result.map(this._toModel);
    }

    // Tạo mới chi tiết đề xuất mua hàng
    async insert(dto: PurchaseProposalDetail): Promise<void> {
        await prisma.purchaseProposalDetail.create({ data: dto });
    }

    // Cập nhật chi tiết đề xuất mua hàng theo ID
    async update(purchaseProposalDetailId: string, data: PurchaseProposalDetailUpdateDTO): Promise<void> {
        await prisma.purchaseProposalDetail.update({ where: { id: purchaseProposalDetailId }, data: { ...data } });
    }

    // Xoá chi tiết đề xuất mua hàng theo ID
    async delete(purchaseProposalDetailId: string): Promise<void> {
        await prisma.purchaseProposalDetail.delete({ where: { id: purchaseProposalDetailId } });
    }

    // Chuyển đổi dữ liệu từ Prisma sang Model
    private _toModel(data: PrismaPurchaseProposalDetail): PurchaseProposalDetail {
        return { ...data } as PurchaseProposalDetail;
    }
}