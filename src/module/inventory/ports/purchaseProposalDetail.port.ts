import { Paginated, PagingDTO, Requester } from "src/share";
import { PurchaseProposalDetail } from "../models/purchaseProposalDetail.model";
import type { PurchaseProposalDetailCreateDTO, PurchaseProposalDetailUpdateDTO, PurchaseProposalDetailCondDTO } from "../dtos/purchaseProposalDetail.dto";

// ============================
// Định nghĩa các interface cho PurchaseProposalDetail
// ============================ 

// Định nghĩa các phương thức mà PurchaseProposalDetailService phải triển khai
export interface IPurchaseProposalDetailService {
    create(requester: Requester, dto: PurchaseProposalDetailCreateDTO, ip: string, userAgent: string): Promise<PurchaseProposalDetail> // Tạo chi tiết đề xuất mua hàng mới
    update(requester: Requester, purchaseProposalDetailId: string, dto: PurchaseProposalDetailUpdateDTO, ip: string, userAgent: string): Promise<PurchaseProposalDetail> // Cập nhật thông tin chi tiết đề xuất mua hàng theo ID
    delete(requester: Requester, purchaseProposalDetailId: string, ip: string, userAgent: string): Promise<void> // Xóa chi tiết đề xuất mua hàng theo ID

    get(purchaseProposalDetailId: string): Promise<PurchaseProposalDetail | null> // Lấy thông tin chi tiết đề xuất mua hàng theo ID  
    list(cond: PurchaseProposalDetailCondDTO,pagingDTO: PagingDTO): Promise<Paginated<PurchaseProposalDetail>> // Lấy danh sách chi tiết đề xuất mua hàng có phân trang
    listByIds(ids: string[], pagingDTO: PagingDTO): Promise<Paginated<PurchaseProposalDetail>> // Lấy danh sách chi tiết đề xuất mua hàng theo nhiều ID có phân trang
}

// Định nghĩa các phương thức mà PurchaseProposalDetailRepository phải triển khai
export interface IPurchaseProposalDetailRepository {
    get(purchaseProposalDetailId: string): Promise<PurchaseProposalDetail | null> // Lấy thông tin chi tiết đề xuất mua hàng theo ID  
    list(cond: PurchaseProposalDetailCondDTO, pagingDTO: PagingDTO): Promise<Paginated<PurchaseProposalDetail>> // Lấy danh sách chi tiết đề xuất mua hàng có phân trang
    listByIds(ids: string[], pagingDTO: PagingDTO): Promise<Paginated<PurchaseProposalDetail>> // Lấy danh sách chi tiết đề xuất mua hàng theo nhiều ID có phân trang

    insert(dto: PurchaseProposalDetail): Promise<void> // Tạo mới chi tiết đề xuất mua hàng
    update(purchaseProposalDetailId: string, dto: PurchaseProposalDetailUpdateDTO): Promise<void> // Cập nhật thông tin chi tiết đề xuất mua hàng theo ID
    delete(purchaseProposalDetailId: string): Promise<void> // Xóa chi tiết đề xuất mua hàng theo ID
}