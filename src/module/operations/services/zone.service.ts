import { Inject, Injectable } from "@nestjs/common";
import { type IZoneRepository, IZoneService } from "../ports/zone.port";
import { ZONE_REPOSITORY } from "../operations.di-token";
import { ErrZoneAlreadyExists, ErrZoneNotFound, type Zone } from "../models/zone.model";
import { Requester } from "src/share/interface";
import { ZoneCondDTO, ZoneCreatedDTO, zoneCreatedDTOSchema, ZoneUpdateDTO, zoneUpdateDTOSchema } from "../dtos/zone.dto";
import { v7 } from "uuid";
import { AppError, Paginated, PagingDTO } from "src/share";

// Lớp ZoneService cung cấp các phương thức để quản lý khu vực
@Injectable()
export class ZoneService implements IZoneService {
    constructor(
        @Inject(ZONE_REPOSITORY) private readonly zoneRepo: IZoneRepository,
    ){}

    // Tạo mới khu vực
    async create(requester: Requester, dto: ZoneCreatedDTO, ip: string, userAgent: string): Promise<string> {
        // Kiểm tra dữ liệu đầu vào
        const data = zoneCreatedDTOSchema.parse(dto);

        // Kiểm tra xem khu vực đã tồn tại chưa
        const existing = await this.zoneRepo.list({ name: data.name }, { page: 1, limit: 1 });

        if (existing.data.length > 0) {
            throw AppError.from(ErrZoneAlreadyExists, 409);
        }

        // Tạo khu vực mới
        const newId = v7();
        const zone: Zone = {
            ...data,
            id: newId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.zoneRepo.insert(zone);

        // Ghi log hành động tạo khu vực (MongoDB)

        return newId;
    }

    // Cập nhật thông tin khu vực
    async update(requester: Requester, id: string, dto: ZoneUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = zoneUpdateDTOSchema.parse(dto);

        // Kiểm tra xem khu vực có tồn tại không
        const existing = await this.zoneRepo.get(id);

        if (!existing) {
            throw AppError.from(ErrZoneNotFound, 404);
        }

        // Cập nhật thông tin khu vực
        await this.zoneRepo.update(id, data);

        // Ghi log hành động cập nhật khu vực (MongoDB)
    }

    // Xóa khu vực theo ID
    async delete(requester: Requester, id: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem khu vực có tồn tại không
        const existing = await this.zoneRepo.get(id);

        if (!existing) {
            throw AppError.from(ErrZoneNotFound, 404);
        }   

        // Xóa khu vực theo ID
        await this.zoneRepo.delete(id);

        // Ghi log hành động xóa khu vực (MongoDB)
    }

    // Lấy thông tin khu vực theo ID
    async get(id: string): Promise<Zone | null> {
        return await this.zoneRepo.get(id);
    }   

    // Lấy danh sách khu vực theo điều kiện
    async list(cond: ZoneCondDTO, paging: PagingDTO): Promise<Paginated<Zone>> {
        const zone = await this.zoneRepo.list(cond, paging);
        return zone;
    }

    // Lấy danh sách khu vực theo nhiều ID
    async listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Zone>> {
        const zone = await this.zoneRepo.listByIds(ids, paging);
        return zone;
    }
}