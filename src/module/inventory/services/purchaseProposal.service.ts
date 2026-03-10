import { Inject, Injectable } from "@nestjs/common";
import { type IPurchaseProposalRepository, IPurchaseProposalService } from "../ports/purchaseProposal.port";
import { PURCHASEPROPOSAL_REPOSITORY } from "../inventory.di-token";
import { ErrPurchaseProposalAlreadyExists, ErrPurchaseProposalNotFound, PurchaseProposal } from "../models/purchaseProposal.model"; 
import { Requester } from "src/share/interface";
import { PurchaseProposalCondDTO, PurchaseProposalCreateDTO, purchaseProposalCreateDTOSchema, PurchaseProposalUpdateDTO, purchaseProposalUpdateDTOSchema } from "../dtos/purchaseProposal.dto";
import { v7 } from "uuid";
import { AppError, Paginated, PagingDTO } from "src/share";

// Lớp PurchaseProposalService cung cấp các phương thức để quản lý đề xuất mua hàng
@Injectable()
export class PurchaseProposalService implements IPurchaseProposalService {
    constructor(
        @Inject(PURCHASEPROPOSAL_REPOSITORY) private readonly purchaseProposalRepo: IPurchaseProposalRepository,
    ){}

    // Tạo mới đề xuất mua hàng
    async create(requester: Requester, dto: PurchaseProposalCreateDTO, ip: string, userAgent: string): Promise<PurchaseProposal> {
        // Kiểm tra dữ liệu đầu vào
        const data = purchaseProposalCreateDTOSchema.parse(dto);

        // Kiểm tra xem đề xuất mua hàng đã tồn tại chưa
        const existing = await this.purchaseProposalRepo.list({ code: data.code }, { page: 1, limit: 1 });
        
        if (existing.total > 0) {
            throw AppError.from(ErrPurchaseProposalAlreadyExists, 409);
        }
        
        // Tạo đề xuất mua hàng mới
        const newId = v7();
        const purchaseProposal = {
            id: newId,
            code: data.code,
            creatorId: data.creatorId,
            status: 'pending',
            note: data.note,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.purchaseProposalRepo.insert(purchaseProposal);

        return purchaseProposal;
    }

    // Cập nhật thông tin đề xuất mua hàng theo ID
    async update(requester: Requester, purchaseProposalId: string, dto: PurchaseProposalUpdateDTO, ip: string, userAgent: string): Promise<PurchaseProposal> {
        // Kiểm tra dữ liệu đầu vào
        const data = purchaseProposalUpdateDTOSchema.parse(dto);

        // Kiểm tra xem đề xuất mua hàng có tồn tại không
        const existing = await this.purchaseProposalRepo.get(purchaseProposalId);
        if (!existing) {
            throw AppError.from(ErrPurchaseProposalNotFound, 404);
        }

        // Cập nhật thông tin đề xuất mua hàng
        await this.purchaseProposalRepo.update(purchaseProposalId, data);

        // Trả về thông tin đề xuất mua hàng sau khi cập nhật
        const updatedPurchaseProposal = await this.purchaseProposalRepo.get(purchaseProposalId);
        if (!updatedPurchaseProposal) {
            throw AppError.from(ErrPurchaseProposalNotFound, 404);
        }

        return updatedPurchaseProposal;
    }

    // Xóa đề xuất mua hàng theo ID
    async delete(requester: Requester, purchaseProposalId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem đề xuất mua hàng có tồn tại không
        const existing = await this.purchaseProposalRepo.get(purchaseProposalId);
        if (!existing) {
            throw AppError.from(ErrPurchaseProposalNotFound, 404);
        }

        // Xóa đề xuất mua hàng
        await this.purchaseProposalRepo.delete(purchaseProposalId);
    }

    // Lấy thông tin đề xuất mua hàng theo ID
    async get(purchaseProposalId: string): Promise<PurchaseProposal | null> {
        return await this.purchaseProposalRepo.get(purchaseProposalId);   
    }

    // Lấy danh sách đề xuất mua hàng theo điều kiện
    async list(cond: PurchaseProposalCondDTO, pagingDTO: PagingDTO): Promise<Paginated<PurchaseProposal>> {
        return await this.purchaseProposalRepo.list(cond, pagingDTO);   
    }   

    // Lấy danh sách đề xuất mua hàng theo nhiều ID
    async listByIds(ids: string[], pagingDTO: PagingDTO): Promise<Paginated<PurchaseProposal>> {
        return await this.purchaseProposalRepo.listByIds(ids, pagingDTO);
    }
}