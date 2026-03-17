import { Paginated, PagingDTO, Requester } from "src/share";
import { StockCheck } from "../models/stockCheck.model";
import type { StockCheckCreateDTO, StockCheckUpdateDTO, StockCheckCondDTO } from "../dtos/stockCheck.dto";

// ============================
// Định nghĩa các interface cho StockCheck
// ============================

// Định nghĩa các phương thức mà StockCheckService phải triển khai
export interface IStockCheckService {
    create(requester: Requester, dto: StockCheckCreateDTO, ip: string, userAgent: string): Promise<StockCheck> // Tạo phiếu kiểm kho mới
    update(requester: Requester, stockCheckId: string, dto: StockCheckUpdateDTO, ip: string, userAgent: string): Promise<StockCheck> // Cập nhật thông tin phiếu kiểm kho theo ID
    delete(requester: Requester, stockCheckId: string, ip: string, userAgent: string): Promise<void> // Xóa phiếu kiểm kho theo ID

    get(stockCheckId: string): Promise<StockCheck | null> // Lấy thông tin phiếu kiểm kho theo ID  
    list(cond: StockCheckCondDTO, pagingDTO: PagingDTO): Promise<Paginated<StockCheck>> // Lấy danh sách phiếu kiểm kho theo điều kiện
    listByIds(ids: string[]): Promise<StockCheck[]> // Lấy danh sách phiếu kiểm kho theo nhiều ID
}

// Định nghĩa các phương thức mà StockCheckRepository phải triển khai
export interface IStockCheckRepository {
    get(stockCheckId: string): Promise<StockCheck | null> // Lấy thông tin phiếu kiểm kho theo ID  
    list(cond: StockCheckCondDTO, paging: PagingDTO): Promise<Paginated<StockCheck>> // Lấy danh sách phiếu kiểm kho theo điều kiện
    listByIds(ids: string[]): Promise<StockCheck[]> // Lấy danh sách phiếu kiểm kho theo nhiều ID  

    insert(dto: StockCheck): Promise<void> // Tạo mới phiếu kiểm kho
    update(stockCheckId: string, dto: StockCheckUpdateDTO): Promise<void> // Cập nhật thông tin phiếu kiểm kho theo ID
    delete(stockCheckId: string): Promise<void> // Xóa phiếu kiểm kho theo ID
}