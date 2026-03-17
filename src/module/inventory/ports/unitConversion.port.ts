import { Paginated, PagingDTO, Requester } from "src/share";
import type { UnitConversionCreateDTO, UnitConversionUpdateDTO, UnitConversionCondDTO } from "../dtos/unitConversion.dto";
import { UnitConversion } from "../models/unitConversion.model";

// ============================
// Định nghĩa các interface cho UnitConversion
// ============================

// Định nghĩa các phương thức mà UnitConversionService phải triển khai  
export interface IUnitConversionService {
    create(requester: Requester, dto: UnitConversionCreateDTO, ip: string, userAgent: string): Promise<UnitConversion> // Tạo quy đổi đơn vị mới
    update(requester: Requester, id: string, dto: UnitConversionUpdateDTO, ip: string, userAgent: string): Promise<UnitConversion> // Cập nhật thông tin quy đổi đơn vị theo ID
    delete(requester: Requester, id: string, ip: string, userAgent: string): Promise<void> // Xóa quy đổi đơn vị theo ID

    get(id: string): Promise<UnitConversion | null> // Lấy thông tin quy đổi đơn vị theo ID  
    list(cond: UnitConversionCondDTO, pagingDTO: PagingDTO): Promise<Paginated<UnitConversion>> // Lấy danh sách quy đổi đơn vị có phân trang
    listByIds(ids: string[]): Promise<UnitConversion[]> // Lấy danh sách quy đổi đơn vị theo nhiều ID có phân trang
}

// Định nghĩa các phương thức mà UnitConversionRepository phải triển khai
export interface IUnitConversionRepository {
    get(id: string): Promise<UnitConversion | null> // Lấy thông tin quy đổi đơn vị theo ID  
    list(cond: UnitConversionCondDTO, pagingDTO: PagingDTO): Promise<Paginated<UnitConversion>> // Lấy danh sách quy đổi đơn vị có phân trang
    listByIds(ids: string[]): Promise<UnitConversion[]> // Lấy danh sách quy đổi đơn vị theo nhiều ID có phân trang  

    insert(dto: UnitConversion): Promise<void> // Tạo mới quy đổi đơn vị
    update(id: string, dto: Partial<UnitConversionUpdateDTO>): Promise<void> // Cập nhật thông tin quy đổi đơn vị theo ID
    delete(id: string): Promise<void> // Xóa quy đổi đơn vị theo ID
}