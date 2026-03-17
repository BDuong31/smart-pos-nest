import { Paginated, PagingDTO, Requester } from "src/share";
import { Supplier } from "../models/supplier.model";
import type { SupplierCreateDTO, SupplierUpdateDTO, SupplierCondDTO } from "../dtos/supplier.dto";

// ============================
// Định nghĩa các interface cho Supplier
// ============================

// Định nghĩa các phương thức mà SupplierService phải triển khai    
export interface ISupplierService {
    create(requester: Requester, dto: SupplierCreateDTO, ip: string, userAgent: string): Promise<Supplier> // Tạo nhà cung cấp mới
    update(requester: Requester, supplierId: string, dto: SupplierUpdateDTO, ip: string, userAgent: string): Promise<Supplier> // Cập nhật thông tin nhà cung cấp theo ID
    delete(requester: Requester, supplierId: string, ip: string, userAgent: string): Promise<void> // Xóa nhà cung cấp theo ID
    
    get(supplierId: string): Promise<Supplier | null> // Lấy thông tin nhà cung cấp theo ID
    list(cond: SupplierCondDTO, pagingDTO: PagingDTO): Promise<Paginated<Supplier>> // Lấy danh sách nhà cung cấp theo điều kiện
    listByIds(ids: string[]): Promise<Supplier[]> // Lấy danh sách nhà cung cấp theo nhiều ID
}

// Định nghĩa các phương thức mà SupplierRepository phải triển khai
export interface ISupplierRepository {
    get(supplierId: string): Promise<Supplier | null> // Lấy thông tin nhà cung cấp theo ID
    list(cond: SupplierCondDTO, paging: PagingDTO): Promise<Paginated<Supplier>> // Lấy danh sách nhà cung cấp theo điều kiện
    listByIds(ids: string[]): Promise<Supplier[]> // Lấy danh sách nhà cung cấp theo nhiều ID

    insert(dto: Supplier): Promise<void> // Tạo mới nhà cung cấp
    update(supplierId: string, dto: SupplierUpdateDTO): Promise<void> // Cập nhật thông tin nhà cung cấp theo ID
    delete(supplierId: string): Promise<void> // Xóa nhà cung cấp theo ID
}       