import { Paginated, PagingDTO, Requester } from 'src/share'
import { Reservation } from '../models/reservation.model'
import type { ReservationCreatedDTO, ReservationUpdateDTO, ReservationCondDTO } from '../dtos/reservation.dto'

// ============================
// Định nghĩa các interface cho Reservation
// ============================

// Định nghĩa các phương thức mà ReservationService phải triển khai
export interface IReservationService {
    // Service tạo mới, cập nhật, xóa đặt bàn
    create(requester: Requester, dto: ReservationCreatedDTO, ip: string, userAgent: string): Promise<string>; // Tạo đặt bàn mới
    update(requester: Requester, id: string, dto: ReservationUpdateDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật thông tin đặt bàn
    delete(requester: Requester, id: string, ip: string, userAgent: string): Promise<void>; // Xóa đặt bàn theo ID

    // Service truy vấn đặt bàn
    get(id: string): Promise<Reservation | null>; // Lấy thông tin đặt bàn theo ID
    list(cond: ReservationCondDTO, paging: PagingDTO): Promise<Paginated<Reservation>>; // Lấy danh sách đặt bàn theo điều kiện
    listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Reservation>>; // Lấy danh sách đặt bàn theo nhiều ID
}

// Định nghĩa các phương thức mà ReservationRepository phải triển khai
export interface IReservationRepository {
    // truy vấn
    get(id: string): Promise<Reservation | null>; // Lấy thông tin đặt bàn theo ID
    list(cond: ReservationCondDTO, paging: PagingDTO): Promise<Paginated<Reservation>>; // Lấy danh sách đặt bàn theo điều kiện
    listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Reservation>>; // Lấy danh sách đặt bàn theo nhiều 
    listByTime(timeStart: Date, timeEnd: Date): Promise<Reservation[]>; // Lấy danh sách đặt bàn theo khoảng thời gian

    // thao tác dữ liệu
    insert(reservation: Reservation): Promise<void>; // Tạo mới đặt bàn
    update(id: string, dto: ReservationUpdateDTO): Promise<void>; // Cập nhật thông tin đặt bàn
    delete(id: string): Promise<void>; // Xóa đặt bàn theo ID
}