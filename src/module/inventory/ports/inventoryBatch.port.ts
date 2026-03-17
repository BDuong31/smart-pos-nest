import { Paginated, PagingDTO, Requester } from "src/share";
import { InventoryBatch } from "../models/inventoryBatch.model";
import type { InventoryBatchCreateDTO, InventoryBatchUpdateDTO, InventoryBatchCondDTO } from "../dtos/inventoryBatch.dto";

// ============================
// Định nghĩa các interface cho InventoryBatch
// ============================

// Định nghĩa các phương thức mà InventoryBatchService phải triển khai  
export interface IInventoryBatchService {
    create(requester: Requester, dto: InventoryBatchCreateDTO, ip: string, userAgent: string): Promise<InventoryBatch> // Tạo lô hàng tồn kho mới
    update(requester: Requester, inventoryBatchId: string, dto: InventoryBatchUpdateDTO, ip: string, userAgent: string): Promise<InventoryBatch> // Cập nhật thông tin lô hàng tồn kho theo ID
    delete(requester: Requester, inventoryBatchId: string, ip: string, userAgent: string): Promise<void> // Xóa lô hàng tồn kho theo ID

    get(inventoryBatchId: string): Promise<InventoryBatch | null> // Lấy thông tin lô hàng tồn kho theo ID  
    list(cond: InventoryBatchCondDTO, pagingDTO: PagingDTO): Promise<Paginated<InventoryBatch>> // Lấy danh sách lô hàng tồn kho theo điều kiện
    listByIds(ids: string[]): Promise<InventoryBatch[]> // Lấy danh sách lô hàng tồn kho theo nhiều ID
}

// Định nghĩa các phương thức mà InventoryBatchRepository phải triển khai
export interface IInventoryBatchRepository {
    get(inventoryBatchId: string): Promise<InventoryBatch | null> // Lấy thông tin lô hàng tồn kho theo ID  
    list(cond: InventoryBatchCondDTO, paging: PagingDTO): Promise<Paginated<InventoryBatch>> // Lấy danh sách lô hàng tồn kho theo điều kiện
    listByIds(ids: string[]): Promise<InventoryBatch[]> // Lấy danh sách lô hàng tồn kho theo nhiều ID  

    insert(dto: InventoryBatch): Promise<void> // Tạo mới lô hàng tồn kho
    update(inventoryBatchId: string, dto: InventoryBatchUpdateDTO): Promise<void> // Cập nhật thông tin lô hàng tồn kho theo ID
    delete(inventoryBatchId: string): Promise<void> // Xóa lô hàng tồn kho theo ID
}   