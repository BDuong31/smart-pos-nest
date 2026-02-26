import { Inject, Injectable } from '@nestjs/common';
import { type IReservationRepository, IReservationService } from '../ports/reservation.port';
import { RESERVATION_REPOSITORY } from '../operations.di-token';
import { ErrReservationAlreadyExists, ErrReservationNotFound, ReservationStatus, type Reservation } from '../models/reservation.model';
import { Requester } from 'src/share/interface';
import { ReservationCondDTO, ReservationCreatedDTO, reservationCreatedDTOSchema, ReservationUpdateDTO, reservationUpdateDTOSchema } from '../dtos/reservation.dto';
import { v7 } from 'uuid';
import { AppError, Paginated, PagingDTO } from 'src/share';

// Lớp ReservationService cung cấp các phương thức để quản lý đặt bàn
@Injectable()
export class ReservationService implements IReservationService {
    constructor(
        @Inject(RESERVATION_REPOSITORY) private readonly reservationRepo: IReservationRepository,
    ){}

    // Tạo mới đặt bàn
    async create(requester: Requester, dto: ReservationCreatedDTO, ip: string, userAgent: string): Promise<string> {
        // Kiểm tra dữ liệu đầu vào
        const data = reservationCreatedDTOSchema.parse(dto);

        // Kiểm tra xem đặt bàn đã tồn tại chưa
        const existing = await this.reservationRepo.list({ 
            userId: data.userId,
            tableId: data.tableId,
            time: data.time,
        }, { page: 1, limit: 1 });
        
        if (existing.data.length > 0) {
            throw AppError.from(ErrReservationAlreadyExists, 409);
        }

        // Tạo đặt bàn mới
        const newId = v7();
        const reservation: Reservation = {
            ...data,
            id: newId,
            status: ReservationStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.reservationRepo.insert(reservation);

        return newId;
    }

    // Cập nhật thông tin đặt bàn
    async update(requester: Requester, id: string, dto: ReservationUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = reservationUpdateDTOSchema.parse(dto);

        // Kiểm tra xem đặt bàn có tồn tại không
        const existing = await this.reservationRepo.get(id);

        if (!existing) {
            throw AppError.from(ErrReservationNotFound, 404);
        }

        // Cập nhật thông tin đặt bàn
        await this.reservationRepo.update(id, data);
    }

    // Xóa đặt bàn theo ID
    async delete(requester: Requester, id: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem đặt bàn có tồn tại không
        const existing = await this.reservationRepo.get(id);

        if (!existing) {
            throw AppError.from(ErrReservationNotFound, 404);
        }

        // Xóa đặt bàn
        await this.reservationRepo.delete(id);
    }

    // Lấy thông tin đặt bàn theo ID
    async get(id: string): Promise<Reservation | null> {
        return await this.reservationRepo.get(id);
    }   

    // Lấy danh sách đặt bàn theo điều kiện
    async list(cond: ReservationCondDTO, paging: PagingDTO): Promise<Paginated<Reservation>> {
        const reservation = await this.reservationRepo.list(cond, paging);
        return reservation;
    }
    
    // Lấy danh sách đặt bàn theo nhiều ID
    async listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Reservation>> {
        const reservation = await this.reservationRepo.listByIds(ids, paging);
        return reservation;
    }
}