import { Paginated, PagingDTO, Requester } from 'src/share'
import { Table } from '../models/table.model'
import type { TableCreatedDTO, TableUpdateDTO, TableCondDTO } from '../dtos/table.dto'
import { Reservation } from '../models/reservation.model';

// ============================
// Định nghĩa các interface cho Table
// ============================

// Định nghĩa các phương thức mà TableService phải triển khai
export interface ITableService {
    // Service tạo mới, cập nhật, xóa bàn
    create(requester: Requester, dto: TableCreatedDTO, ip: string, userAgent: string): Promise<string>; // Tạo bàn mới
    update(requester: Requester, id: string, dto: TableUpdateDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật thông tin bàn
    delete(requester: Requester, id: string, ip: string, userAgent: string): Promise<void>; // Xóa bàn theo ID

    // Service truy vấn bàn
    get(id: string): Promise<Table | null>; // Lấy thông tin bàn theo ID
    list(cond: TableCondDTO, paging: PagingDTO): Promise<Paginated<Table>>; // Lấy danh sách bàn theo điều kiện
    listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Table>>; // Lấy danh sách bàn theo nhiều ID
    listByAvailable(time: Date, cond: TableCondDTO, paging: PagingDTO): Promise<Paginated<Table>>; // Lấy danh sách bàn trống
}

// Định nghĩa các phương thức mà TableRepository phải triển khai
export interface ITableRepository {
    // truy vấn
    get(id: string): Promise<Table | null>; // Lấy thông tin bàn theo ID
    list(cond: TableCondDTO, paging: PagingDTO): Promise<Paginated<Table>>; // Lấy danh sách bàn theo điều kiện
    listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Table>>; // Lấy danh sách bàn theo nhiều 
    listAvailable(reservations: Reservation[], cond: TableCondDTO, paging: PagingDTO): Promise<Paginated<Table>>; // Lấy danh sách bàn trống theo thời gian và điều kiện
    
    // thao tác dữ liệu
    insert(table: Table): Promise<void>; // Tạo mới bàn
    update(id: string, dto: TableUpdateDTO): Promise<void>; // Cập nhật thông tin bàn
    delete(id: string): Promise<void>; // Xóa bàn theo ID
} 