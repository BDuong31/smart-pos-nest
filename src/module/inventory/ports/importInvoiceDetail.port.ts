import { Paginated, PagingDTO, Requester } from "src/share";
import { ImportInvoiceDetail } from "../models/importInvoiceDetail.model";
import type { ImportInvoiceDetailCreateDTO, ImportInvoiceDetailUpdateDTO, ImportInvoiceDetailCondDTO } from "../dtos/importInvoiceDetail.dto";

// ============================
// Định nghĩa các interface cho ImportInvoiceDetail
// ============================

// Định nghĩa các phương thức mà ImportInvoiceDetailService phải triển khai
export interface IImportInvoiceDetailService {
    create(requester: Requester, dto: ImportInvoiceDetailCreateDTO, ip: string, userAgent: string): Promise<ImportInvoiceDetail> // Tạo chi tiết phiếu nhập mới
    update(requester: Requester, importInvoiceDetailId: string, dto: ImportInvoiceDetailUpdateDTO, ip: string, userAgent: string): Promise<ImportInvoiceDetail> // Cập nhật thông tin chi tiết phiếu nhập theo ID
    delete(requester: Requester, importInvoiceDetailId: string, ip: string, userAgent: string): Promise<void> // Xóa chi tiết phiếu nhập theo ID

    get(importInvoiceDetailId: string): Promise<ImportInvoiceDetail | null> // Lấy thông tin chi tiết phiếu nhập theo ID  
    list(cond: ImportInvoiceDetailCondDTO, pagingDTO: PagingDTO): Promise<Paginated<ImportInvoiceDetail>> // Lấy danh sách chi tiết phiếu nhập theo điều kiện có phân trang
    listByIds(ids: string[], pagingDTO: PagingDTO): Promise<Paginated<ImportInvoiceDetail>> // Lấy danh sách chi tiết phiếu nhập theo nhiều ID có phân trang
}

// Định nghĩa các phương thức mà ImportInvoiceDetailRepository phải triển khai
export interface IImportInvoiceDetailRepository {
    get(importInvoiceDetailId: string): Promise<ImportInvoiceDetail | null> // Lấy thông tin chi tiết phiếu nhập theo ID  
    list(cond: ImportInvoiceDetailCondDTO, pagingDTO: PagingDTO): Promise<Paginated<ImportInvoiceDetail>> // Lấy danh sách chi tiết phiếu nhập theo điều kiện có phân trang
    listByIds(ids: string[], pagingDTO: PagingDTO): Promise<Paginated<ImportInvoiceDetail>> // Lấy danh sách chi tiết phiếu nhập theo nhiều ID có phân trang

    insert(dto: ImportInvoiceDetail): Promise<void> // Tạo mới chi tiết phiếu nhập
    update(importInvoiceDetailId: string, dto: ImportInvoiceDetailUpdateDTO): Promise<void> // Cập nhật thông tin chi tiết phiếu nhập theo ID
    delete(importInvoiceDetailId: string): Promise<void> // Xóa chi tiết phiếu nhập theo ID
}