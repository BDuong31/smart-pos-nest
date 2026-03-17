import { Paginated, PagingDTO, Requester } from 'src/share'
import { Printer } from '../models/printer.model'
import type { CreatePrinterDTO, UpdatePrinterDTO, PrinterCondDTO  } from '../dtos/printer.dto'
// ===============================================
// Định nghĩa các interface cho Printer Service
// ===============================================

// Định nghĩa kiểu dữ liệu cho Printer Service
export interface IPrinterService {
    // phương thức cho Printer
    createPrinter(requester: Requester, dto: CreatePrinterDTO, ip: string, userAgent: string): Promise<Printer>; // Tạo máy in mới
    updatePrinter(requester: Requester, printerId: string, dto: UpdatePrinterDTO, ip: string, userAgent: string): Promise<Printer>; // Cập nhật máy in
    deletePrinter(requester: Requester, printerId: string, ip: string, userAgent: string): Promise<void>; // Xóa máy in
    getPrinterById(printerId: string): Promise<Printer | null>; // Lấy thông tin máy in theo ID
    getListPrinter(cond: PrinterCondDTO, paging: PagingDTO): Promise<Paginated<Printer>>; // Lấy danh sách máy in theo điều kiện lọc
    getPrinterByIds(ids: string[]): Promise<Printer[]>; // Lấy danh sách máy in theo mảng IDs
}

// Định nghĩa kiểu dữ liệu cho Printer Repository
export interface IPrinterRepository {
    // truy vấn
    get(id: string): Promise<Printer | null>; // Lấy máy in theo ID
    list(cond: PrinterCondDTO, paging: PagingDTO): Promise<Paginated<Printer>>; // Lấy danh sách máy in theo điều kiện lọc
    listByIds(ids: string[]): Promise<Printer[]>; // Lấy danh sách máy in theo mảng IDs
   
    // yêu cầu
    insert(printer: Printer): Promise<void>; // Thêm máy in mới
    update(id: string, dto: UpdatePrinterDTO): Promise<void>; // Cập nhật thông tin máy in
    delete(id: string): Promise<void>; // Xóa máy in theo ID
}