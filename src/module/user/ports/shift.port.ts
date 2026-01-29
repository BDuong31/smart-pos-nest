
// ==========================
// Định nghĩa các interface cho Shift Service
// ============================

import { ShiftCondDTO, ShiftCreateDTO, ShiftUpdateDTO } from "../dtos/shift.dto";
import { Shift } from "../models/shift.model";

// Định nghĩa các phương thức mà ShiftService phải triển khai
export interface IShiftService {
    // Nhân viên thao tác
    checkIn(userId: string, dto: ShiftCreateDTO, ip: string, userAgent: string): Promise<void>; // Nhân viên check in bắt đầu ca làm việc
    checkOut(userId: string, shiftId: string, dto: ShiftUpdateDTO, ip: string, userAgent: string): Promise<void>; // Nhân viên check out kết thúc ca làm việc
    
    // Lấy thông tin ca làm việc
    getCurrentShift(userId: string, ip: string, userAgent: string): Promise<Shift>; // Lấy ca làm việc hiện tại của nhân viên
    getShiftHistory(userId: string, ip: string, userAgent: string): Promise<Shift[]>; // Lấy lịch sử ca làm việc của nhân viên
    

    // Quản lý ca làm việc
    findShifts(cond: ShiftCondDTO, ip: string, userAgent: string): Promise<Shift[]>; // Tìm ca làm việc theo điều kiện
    getShiftById(shiftId: string, ip: string, userAgent: string): Promise<Shift>; // Lấy ca làm việc theo ID
}

// Định nghĩa các phương thức mà ShiftRepository phải triển khai
export interface IShiftRepository {
    // Truy vấn
    get(id: string): Promise<Shift | null>; // Lấy ca làm việc theo ID
    findByCond(cond: ShiftCondDTO): Promise<Shift[]>; // Tìm ca làm việc theo điều kiện
    findByCondOr(cond: ShiftCondDTO): Promise<Shift[]>; // Tìm ca làm việc đúng theo 1 trong các điều kiện
    listByIds(ids: string[]): Promise<Shift[]>; // Lấy danh sách ca làm việc theo mảng IDs
    
    // Yêu cầu
    insert(shift: any): Promise<void>; // Thêm ca làm việc mới
    update(id: string, dto: Partial<any>): Promise<void>; // Cập nhật ca làm việc
    delete(id: string): Promise<void>; // Xóa ca làm việc theo ID
}