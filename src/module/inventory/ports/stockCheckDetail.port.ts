import { Paginated, PagingDTO, Requester } from "src/share";
import { StockCheckDetail } from "../models/stockCheckDetail.model";
import type { StockCheckDetailCreateDTO, StockCheckDetailUpdateDTO, StockCheckDetailCondDTO } from "../dtos/stockCheckDetail.dto";

// ============================
// Định nghĩa các interface cho StockCheckDetail
// ============================

// Định nghĩa các phương thức mà StockCheckDetailService phải triển khai
export interface IStockCheckDetailService {
    create(requester: Requester, dto: StockCheckDetailCreateDTO, ip: string, userAgent: string): Promise<StockCheckDetail> // Tạo chi tiết phiếu kiểm kho mới
    update(requester: Requester, stockCheckDetailId: string, dto: StockCheckDetailUpdateDTO, ip: string, userAgent: string): Promise<StockCheckDetail> // Cập nhật thông tin chi tiết phiếu kiểm kho theo ID
    delete(requester: Requester, stockCheckDetailId: string, ip: string, userAgent: string): Promise<void> // Xóa chi tiết phiếu kiểm kho theo ID

    get(stockCheckDetailId: string): Promise<StockCheckDetail | null> // Lấy thông tin chi tiết phiếu kiểm kho theo ID  
    list(cond: StockCheckDetailCondDTO, pagingDTO: PagingDTO): Promise<Paginated<StockCheckDetail>> // Lấy danh sách chi tiết phiếu kiểm kho theo điều kiện
    listByIds(ids: string[], pagingDTO: PagingDTO): Promise<Paginated<StockCheckDetail>> // Lấy danh sách chi tiết phiếu kiểm kho theo nhiều ID
}

// Định nghĩa các phương thức mà StockCheckDetailRepository phải triển khai
export interface IStockCheckDetailRepository {
    get(stockCheckDetailId: string): Promise<StockCheckDetail | null> // Lấy thông tin chi tiết phiếu kiểm kho theo ID  
    list(cond: StockCheckDetailCondDTO, pagingDTO: PagingDTO): Promise<Paginated<StockCheckDetail>> // Lấy danh sách chi tiết phiếu kiểm kho theo điều kiện
    listByIds(ids: string[], pagingDTO: PagingDTO): Promise<Paginated<StockCheckDetail>> // Lấy danh sách chi tiết phiếu kiểm kho theo nhiều ID  

    insert(dto: StockCheckDetail): Promise<void> // Tạo mới chi tiết phiếu kiểm kho
    update(stockCheckDetailId: string, dto: StockCheckDetailUpdateDTO): Promise<void> // Cập nhật thông tin chi tiết phiếu kiểm kho theo ID
    delete(stockCheckDetailId: string): Promise<void> // Xóa chi tiết phiếu kiểm kho theo ID
}