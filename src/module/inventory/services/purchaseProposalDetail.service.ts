import { Inject, Injectable } from "@nestjs/common";
import { type IPurchaseProposalDetailRepository, IPurchaseProposalDetailService } from "../ports/purchaseProposalDetail.port";
import { PURCHASEPROPOSALDETAIL_REPOSITORY } from "../inventory.di-token";
import { ErrPurchaseProposalDetailAlreadyExists, ErrPurchaseProposalDetailNotFound, PurchaseProposalDetail } from "../models/purchaseProposalDetail.model";
import { Requester } from "src/share/interface";
import { PurchaseProposalDetailCondDTO, PurchaseProposalDetailCreateDTO, purchaseProposalDetailCreateDTOSchema, PurchaseProposalDetailUpdateDTO, purchaseProposalDetailUpdateDTOSchema } from "../dtos/purchaseProposalDetail.dto";
import { v7 } from "uuid";
import { AppError, Paginated, PagingDTO } from "src/share";

// Lớp PurchaseProposalDetailService cung cấp các phương thức để quản lý chi tiết đề xuất mua hàng  
@Injectable()
export class PurchaseProposalDetailService implements IPurchaseProposalDetailService {
    constructor(
        @Inject(PURCHASEPROPOSALDETAIL_REPOSITORY) private readonly purchaseProposalDetailRepo: IPurchaseProposalDetailRepository,
    ){}

    // Tạo mới chi tiết đề xuất mua hàng
    async create(requester: Requester, dto: PurchaseProposalDetailCreateDTO, ip: string, userAgent: string): Promise<PurchaseProposalDetail> {
        // Kiểm tra dữ liệu đầu vào
        const data = purchaseProposalDetailCreateDTOSchema.parse(dto);

        // Kiểm tra xem chi tiết đề xuất mua hàng đã tồn tại chưa
        const existing = await this.purchaseProposalDetailRepo.list({ proposalId: data.proposalId, ingredientId: data.ingredientId }, { page: 1, limit: 1 });

        if (existing.total > 0) {
            throw AppError.from(ErrPurchaseProposalDetailAlreadyExists, 409);
        }   

        // Tạo chi tiết đề xuất mua hàng mới
        const newId = v7();
        const purchaseProposalDetail = {
            id: newId,
            proposalId: data.proposalId,
            ingredientId: data.ingredientId,
            quantity: data.quantity,
            unit: data.unit,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.purchaseProposalDetailRepo.insert(purchaseProposalDetail);

        return purchaseProposalDetail;
    }

    // Cập nhật thông tin chi tiết đề xuất mua hàng theo ID
    async update(requester: Requester, purchaseProposalDetailId: string, dto: PurchaseProposalDetailUpdateDTO, ip: string, userAgent: string): Promise<PurchaseProposalDetail> {
        // Kiểm tra dữ liệu đầu vào
        const data = purchaseProposalDetailUpdateDTOSchema.parse(dto);

        // Kiểm tra xem chi tiết đề xuất mua hàng có tồn tại không
        const existing = await this.purchaseProposalDetailRepo.get(purchaseProposalDetailId);
        if (!existing) {
            throw AppError.from(ErrPurchaseProposalDetailNotFound, 404);
        }

        // Cập nhật thông tin chi tiết đề xuất mua hàng
        await this.purchaseProposalDetailRepo.update(purchaseProposalDetailId, data);   

        // Trả về thông tin chi tiết đề xuất mua hàng sau khi cập nhật
        const updatedPurchaseProposalDetail = await this.purchaseProposalDetailRepo.get(purchaseProposalDetailId);
        if (!updatedPurchaseProposalDetail) {
            throw AppError.from(ErrPurchaseProposalDetailNotFound, 404);
        }

        return updatedPurchaseProposalDetail;
    }

    // Xóa chi tiết đề xuất mua hàng theo ID
    async delete(requester: Requester, purchaseProposalDetailId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem chi tiết đề xuất mua hàng có tồn tại không
        const existing = await this.purchaseProposalDetailRepo.get(purchaseProposalDetailId);
        if (!existing) {
            throw AppError.from(ErrPurchaseProposalDetailNotFound, 404);
        }

        // Xóa chi tiết đề xuất mua hàng
        await this.purchaseProposalDetailRepo.delete(purchaseProposalDetailId);
    }

    // Lấy thông tin chi tiết đề xuất mua hàng theo ID
    async get(purchaseProposalDetailId: string): Promise<PurchaseProposalDetail | null> {
        return await this.purchaseProposalDetailRepo.get(purchaseProposalDetailId);   
    }

    // Lấy danh sách chi tiết đề xuất mua hàng theo điều kiện
    async list(cond: PurchaseProposalDetailCondDTO, pagingDTO: PagingDTO): Promise<Paginated<PurchaseProposalDetail>> {
        return await this.purchaseProposalDetailRepo.list(cond, pagingDTO);   
    }

    // Lấy danh sách chi tiết đề xuất mua hàng theo nhiều ID
    async listByIds(ids: string[]): Promise<PurchaseProposalDetail[]> {
        return await this.purchaseProposalDetailRepo.listByIds(ids);
    }
}