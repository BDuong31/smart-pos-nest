import { Inject, Injectable } from '@nestjs/common';
import { type ITableRepository, ITableService } from '../ports/table.port';
import { RESERVATION_REPOSITORY, TABLE_REPOSITORY } from '../operations.di-token'; 
import { ErrTableAlreadyExists, ErrTableNotFound, TableStatus, type Table } from '../models/table.model';
import { Requester } from 'src/share/interface';
import { TableCondDTO, TableCreatedDTO, tableCreatedDTOSchema, TableUpdateDTO, tableUpdateDTOSchema } from '../dtos/table.dto';
import { v7 } from 'uuid';
import { AppError, Paginated, PagingDTO } from 'src/share';
import { type IReservationRepository } from '../ports/reservation.port';

// Lớp TableService cung cấp các phương thức để quản lý bàn
@Injectable()
export class TableService implements ITableService {
    constructor(
        @Inject(TABLE_REPOSITORY) private readonly tableRepo: ITableRepository,
        @Inject(RESERVATION_REPOSITORY) private readonly reservationRepo: IReservationRepository,
    ){}

    // Tạo mới bàn
    async create(requester: Requester, dto: TableCreatedDTO, ip: string, userAgent: string): Promise<string> {
        // Kiểm tra dữ liệu đầu vào
        const data = tableCreatedDTOSchema.parse(dto);  

        // Kiểm tra xem bàn đã tồn tại chưa
        const existing = await this.tableRepo.list({ name: data.name }, { page: 1, limit: 1 });

        if (existing.data.length > 0) {
            throw AppError.from(ErrTableAlreadyExists, 409);
        }

        // Tạo bàn mới
        const newId = v7();

        const qrCode = `table-${data.zoneId}-${newId}`;
        const table: Table = {
            id: newId,
            zoneId: data.zoneId,
            name: data.name,
            qrCode: qrCode,
            capacity: data.capacity,
            isActive: data.isActive ?? true,
            status: TableStatus.AVAILABLE, 
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.tableRepo.insert(table); 

        return newId;
    }

    // Cập nhật thông tin bàn
    async update(requester: Requester, id: string, dto: TableUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = tableUpdateDTOSchema.parse(dto);

        // Kiểm tra xem bàn có tồn tại không
        const existing = await this.tableRepo.get(id);  

        if (!existing) {
            throw AppError.from(ErrTableNotFound, 404);
        }

        // Cập nhật thông tin bàn
        await this.tableRepo.update(id, data); 
    }   

    // Xóa bàn theo ID
    async delete(requester: Requester, id: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem bàn có tồn tại không
        const existing = await this.tableRepo.get(id);

        if (!existing) {
            throw AppError.from(ErrTableNotFound, 404);
        }   

        await this.tableRepo.delete(id);    
    }

    // Lấy thông tin bàn theo ID
    async get(id: string): Promise<Table | null> {
        return await this.tableRepo.get(id);
    }

    // Lấy danh sách bàn theo điều kiện
    async list(cond: TableCondDTO, paging: PagingDTO): Promise<Paginated<Table>> {
        const table = await this.tableRepo.list(cond, paging);

        return table;
    }

    // Lấy danh sách bàn theo điều kiện
    async listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Table>> {
        const table = await this.tableRepo.listByIds(ids, paging);

        return table;
    }

    // Lấy danh sách bàn trống theo thời gian và điều kiện
    async listByAvailable(time: Date, cond: TableCondDTO, paging: PagingDTO): Promise<Paginated<Table>> {
        // Lấy Time trước giờ đặt bàn và Time sau giờ đặt bàn
        const timeStart = new Date(time);
        timeStart.setHours(timeStart.getHours() - 2); // Giả sử thời gian đặt bàn là 2 giờ

        const timeEnd = new Date(time);
        timeEnd.setHours(timeEnd.getHours() + 2); // Giả sử thời gian đặt bàn là 2 giờ

        // Lấy danh sách đặt bàn trong khoảng thời gian đó
        const reservations = await this.reservationRepo.listByTime(timeStart, timeEnd);

        // Lấy danh sách bàn trống theo thời gian và điều kiện
        const tables = await this.tableRepo.listAvailable(reservations, cond, paging);

        return tables;
    }
}