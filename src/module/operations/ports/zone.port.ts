import { Paginated, PagingDTO, Requester } from 'src/share'
import { Zone } from '../models/zone.model'
import type { ZoneCreatedDTO, ZoneUpdateDTO, ZoneCondDTO } from '../dtos/zone.dto'

// ============================
// Định nghĩa các interface cho Zone
// ============================ 

// Định nghĩa các phương thức mà ZoneService phải triển khai
export interface IZoneService {
    // Service tạo mới, cập nhật, xóa khu vực
    create(requester: Requester, dto: ZoneCreatedDTO, ip: string, userAgent: string): Promise<string>; // Tạo khu vực mới
    update(requester: Requester, id: string, dto: ZoneUpdateDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật thông tin khu vực
    delete(requester: Requester, id: string, ip: string, userAgent: string): Promise<void>; // Xóa khu vực theo ID

    // Service truy vấn khu vực
    get(id: string): Promise<Zone | null>; // Lấy thông tin khu vực theo ID
    list(cond: ZoneCondDTO, paging: PagingDTO): Promise<Paginated<Zone>>; // Lấy danh sách khu vực theo điều kiện
    listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Zone>>; // Lấy danh sách khu vực theo nhiều ID
}

// Định nghĩa các phương thức mà ZoneRepository phải triển khai
export interface IZoneRepository {
    // truy vấn
    get(id: string): Promise<Zone | null>; // Lấy thông tin khu vực theo ID
    list(cond: ZoneCondDTO, paging: PagingDTO): Promise<Paginated<Zone>>; // Lấy danh sách khu vực theo điều kiện
    listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Zone>>; // Lấy danh sách khu vực theo nhiều ID

    // thao tác dữ liệu
    insert(zone: Zone): Promise<void>; // Tạo mới khu vực
    update(id: string, dto: ZoneUpdateDTO): Promise<void>; // Cập nhật thông tin khu vực
    delete(id: string): Promise<void>; // Xóa khu vực theo ID
}