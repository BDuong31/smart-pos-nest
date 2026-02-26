import { Requester } from 'src/share'
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
    getPrintersCond(cond: PrinterCondDTO): Promise<Printer[]>; // Lấy danh sách máy in theo điều kiện lọc
    getPrintersCondOr(cond: PrinterCondDTO): Promise<Printer[]>; // Lấy danh sách máy in theo điều kiện lọc (OR)
}

// Định nghĩa kiểu dữ liệu cho Printer Repository
export interface IPrinterRepository {
    // truy vấn
    get(id: string): Promise<Printer | null>; // Lấy máy in theo ID
    findByCond(cond: PrinterCondDTO): Promise<Printer[]>; // Tìm máy in theo điều kiện
    findByCondOr(cond: PrinterCondDTO): Promise<Printer[]>; // Tìm máy in đúng theo 1 trong các điều kiện
    listByIds(ids: string[]): Promise<Printer[]>; // Lấy danh sách máy in theo mảng IDs

    // yêu cầu
    insert(printer: Printer): Promise<void>; // Thêm máy in mới
    update(id: string, dto: UpdatePrinterDTO): Promise<void>; // Cập nhật thông tin máy in
    delete(id: string): Promise<void>; // Xóa máy in theo ID
}