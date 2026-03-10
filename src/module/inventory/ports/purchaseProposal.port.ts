import { Paginated, PagingDTO, Requester } from "src/share";
import { PurchaseProposal } from "../models/purchaseProposal.model";
import type { PurchaseProposalCondDTO, PurchaseProposalCreateDTO, PurchaseProposalUpdateDTO } from "../dtos/purchaseProposal.dto";

// ============================
// Định nghĩa các interface cho PurchaseProposal
// ============================

// Định nghĩa các phương thức mà PurchaseProposalService phải triển khai
export interface IPurchaseProposalService {
    create(requester: Requester, dto: PurchaseProposalCreateDTO, ip: string, userAgent: string): Promise<PurchaseProposal> // Tạo đề xuất mua hàng mới
    update(requester: Requester, purchaseProposalId: string, dto: PurchaseProposalUpdateDTO, ip: string, userAgent: string): Promise<PurchaseProposal> // Cập nhật thông tin đề xuất mua hàng theo ID
    delete(requester: Requester, purchaseProposalId: string, ip: string, userAgent: string): Promise<void> // Xóa đề xuất mua hàng theo ID

    get(purchaseProposalId: string): Promise<PurchaseProposal | null> // Lấy thông tin đề xuất mua hàng theo ID  
    list(cond: PurchaseProposalCondDTO,pagingDTO: PagingDTO): Promise<Paginated<PurchaseProposal>> // Lấy danh sách đề xuất mua hàng có phân trang
    listByIds(ids: string[], pagingDTO: PagingDTO): Promise<Paginated<PurchaseProposal>> // Lấy danh sách đề xuất mua hàng theo nhiều ID có phân trang
}

// Định nghĩa các phương thức mà PurchaseProposalRepository phải triển khai
export interface IPurchaseProposalRepository {
    get(purchaseProposalId: string): Promise<PurchaseProposal | null> // Lấy thông tin đề xuất mua hàng theo ID  
    list(cond: PurchaseProposalCondDTO, pagingDTO: PagingDTO): Promise<Paginated<PurchaseProposal>> // Lấy danh sách đề xuất mua hàng có phân trang
    listByIds(ids: string[], pagingDTO: PagingDTO): Promise<Paginated<PurchaseProposal>> // Lấy danh sách đề xuất mua hàng theo nhiều ID có phân trang

    insert(dto: PurchaseProposal): Promise<void> // Tạo mới đề xuất mua hàng
    update(purchaseProposalId: string, dto: PurchaseProposalUpdateDTO): Promise<void> // Cập nhật thông tin đề xuất mua hàng theo ID
    delete(purchaseProposalId: string): Promise<void> // Xóa đề xuất mua hàng theo ID
}