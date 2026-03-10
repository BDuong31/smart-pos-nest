import { Paginated, PagingDTO, Requester } from "src/share";
import { ImportInvoice } from "../models/importInvoice.model";
import { ImportInvoiceCreateDTO, ImportInvoiceUpdateDTO, ImportInvoiceCondDTO } from "../dtos/importInvoice.dto";

// ============================
// Định nghĩa các interface cho ImportInvoice
// ============================ 

// Định nghĩa các phương thức mà ImportInvoiceService phải triển khai   
export interface IImportInvoiceService {    
    create(requester: Requester, dto: ImportInvoiceCreateDTO, ip: string, userAgent: string): Promise<ImportInvoice> // Tạo phiếu nhập kho mới 
    update(requester: Requester, id: string, dto: ImportInvoiceUpdateDTO, ip: string, userAgent: string): Promise<ImportInvoice> // Cập nhật thông tin phiếu nhập kho theo ID
    delete(requester: Requester, id: string, ip: string, userAgent: string): Promise<void> // Xóa phiếu nhập kho theo ID    

    get(id: string): Promise<ImportInvoice | null> // Lấy thông tin phiếu nhập kho theo ID  
    list(cond: ImportInvoiceCondDTO, pagingDTO: PagingDTO): Promise<Paginated<ImportInvoice>> // Lấy danh sách phiếu nhập kho có phân trang
    listByIds(ids: string[], pagingDTO: PagingDTO): Promise<Paginated<ImportInvoice>> // Lấy danh sách phiếu nhập kho theo nhiều ID có phân trang
}   

// Định nghĩa các phương thức mà ImportInvoiceRepository phải triển khai    
export interface IImportInvoiceRepository { 
    get(id: string): Promise<ImportInvoice | null> // Lấy thông tin phiếu nhập kho theo ID  
    list(cond: ImportInvoiceCondDTO, pagingDTO: PagingDTO): Promise<Paginated<ImportInvoice>> // Lấy danh sách phiếu nhập kho có phân trang
    listByIds(ids: string[], pagingDTO: PagingDTO): Promise<Paginated<ImportInvoice>> // Lấy danh sách phiếu nhập kho theo nhiều ID có phân trang   

    insert(dto: ImportInvoice): Promise<void> // Tạo mới phiếu nhập kho
    update(id: string, dto: ImportInvoiceUpdateDTO): Promise<void> // Cập nhật thông tin phiếu nhập kho theo ID
    delete(id: string): Promise<void> // Xóa phiếu nhập kho theo ID
}