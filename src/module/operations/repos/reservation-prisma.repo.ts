import prisma from 'src/share/components/prisma'
import { Injectable } from '@nestjs/common';
import { Reservation } from '../models/reservation.model';
import type { ReservationCreatedDTO, ReservationUpdateDTO, ReservationCondDTO} from '../dtos/reservation.dto';
import type { IReservationRepository } from '../ports/reservation.port';
import type { Reservation as ReservationPrisma } from '@prisma/client';
import { Paginated, PagingDTO } from 'src/share/data-model';

// Lớp ReservationPrismaRepo cung cấp phương thức truy vấn dữ liệu đặt bàn từ Prisma
@Injectable()
export class ReservationPrismaRepo implements IReservationRepository {
    // Lấy đặt bàn theo ID
    async get(id: string): Promise<Reservation | null> {
        const data = await prisma.reservation.findFirst({ where: { id } }); 

        if (!data) return null;
        
        return this._toModel(data);
    }

    // Lấy danh sách đặt bàn
    async list(cond: ReservationCondDTO, paging: PagingDTO): Promise<Paginated<Reservation>> {
        const { userId, tableId, customerName, phone, time, guestCount, status, ...rest} = cond;

        let where = {
            ...rest,
        }

        if (userId) {
            where = {
                ...where,
                userId: userId,
            }
        }

        if (tableId) {
            where = {
                ...where,
                tableId: tableId,
            }
        }

        if (customerName) { 
            where = {
                ...where,
                customerName: customerName,
            }
        }

        if (phone) {
            where = {
                ...where,
                phone: phone,
            }
        }

        if (time) {
            where = {
                ...where,
                time: time,
            }
        }

        if (guestCount) {
            where = {
                ...where,
                guestCount: guestCount,
            }
        }

        if (status) {
            where = {
                ...where,
                status: status,
            }
        }

        const total = await prisma.reservation.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.reservation.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { time: 'desc' },
        });

        return {
            data: result.map(this._toModel),
            paging,
            total
        }
    }

    // Lấy danh sách đặt bàn theo nhiều ID
    async listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Reservation>> {
        const total = await prisma.reservation.count({ where: { id: { in: ids } } });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.reservation.findMany({
            where: { id: { in: ids } },
            skip,
            take: paging.limit,
            orderBy: { time: 'desc' },
        });

        return {
            data: result.map(this._toModel),
            paging,
            total
        }
    }

    // Lấy danh sách đặt bàn theo khoảng thời gian
    async listByTime(timeStart: Date, timeEnd: Date): Promise<Reservation[]> {
        const data = await prisma.reservation.findMany({
            where: {
                time: {
                    gte: timeStart,
                    lte: timeEnd,
                }
            },
            orderBy: { time: 'desc' },
        });

        return data.map(this._toModel);
    }

    // Tạo mới đặt bàn
    async insert(reservation: Reservation): Promise<void> {
        await prisma.reservation.create({ data: reservation });
    }

    // Cập nhật đặt bàn
    async update(id: string, dto: ReservationUpdateDTO): Promise<void> {
        await prisma.reservation.update({ where: { id }, data: dto });
    }

    // Xóa đặt bàn theo ID
    async delete(id: string): Promise<void> {
        await prisma.reservation.delete({ where: { id } });
    }


    // Chuyển đổi dữ liệu từ Prisma sang Model
    private _toModel(data: ReservationPrisma): Reservation {
        return { ...data } as Reservation;
    }
}