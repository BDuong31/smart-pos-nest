import { Inject, Injectable } from "@nestjs/common";
import { type IUnitConversionRepository, IUnitConversionService } from "../ports/unitConversion.port";
import { UNITCONVERSION_REPOSITORY } from "../inventory.di-token";
import { ErrUnitConversionAlreadyExists, ErrUnitConversionNotFound, UnitConversion } from "../models/unitConversion.model";
import { Requester } from "src/share/interface";
import { UnitConversionCondDTO, UnitConversionCreateDTO, unitConversionCreateDTOSchema, UnitConversionUpdateDTO, unitConversionUpdateDTOSchema } from "../dtos/unitConversion.dto";
import { v7 } from "uuid";
import { AppError, Paginated, PagingDTO } from "src/share";

// Lớp UnitConversionService cung cấp các phương thức để quản lý quy đổi đơn vị
@Injectable()
export class UnitConversionService implements IUnitConversionService {
    constructor(
        @Inject(UNITCONVERSION_REPOSITORY) private readonly unitConversionRepo: IUnitConversionRepository,
    ){}

    // Tạo mới quy đổi đơn vị
    async create(requester: Requester, dto: UnitConversionCreateDTO, ip: string, userAgent: string): Promise<UnitConversion> {
        // Kiểm tra dữ liệu đầu vào
        const data = unitConversionCreateDTOSchema.parse(dto);

        // Kiểm tra xem quy đổi đơn vị đã tồn tại chưa
        const existing = await this.unitConversionRepo.list({ ingredientId: data.ingredientId, fromUnit: data.fromUnit, toUnit: data.toUnit }, { page: 1, limit: 1 });
        
        if (existing.total > 0) {
            throw AppError.from(ErrUnitConversionAlreadyExists, 409);
        }
        
        // Tạo quy đổi đơn vị mới
        const newId = v7();
        const unitConversion = {
            id: newId,
            ingredientId: data.ingredientId,
            fromUnit: data.fromUnit,
            toUnit: data.toUnit,
            factor: data.factor,
            createdAt: new Date(),
            updatedAt: new Date(),
        };  

        await this.unitConversionRepo.insert(unitConversion);

        return unitConversion;
    }

    // Cập nhật thông tin quy đổi đơn vị theo ID
    async update(requester: Requester, unitConversionId: string, dto: UnitConversionUpdateDTO, ip: string, userAgent: string): Promise<UnitConversion> {
        // Kiểm tra dữ liệu đầu vào
        const data = unitConversionUpdateDTOSchema.parse(dto);

        // Cập nhật thông tin quy đổi đơn vị
        await this.unitConversionRepo.update(unitConversionId, data);

        // Trả về thông tin quy đổi đơn vị sau khi cập nhật
        const updatedUnitConversion = await this.unitConversionRepo.get(unitConversionId);
        if (!updatedUnitConversion) {
            throw AppError.from(ErrUnitConversionNotFound, 404);
        }

        return updatedUnitConversion;
    }

    // Xóa quy đổi đơn vị theo ID
    async delete(requester: Requester, unitConversionId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem quy đổi đơn vị có tồn tại không
        const existing = await this.unitConversionRepo.get(unitConversionId);
        if (!existing) {
            throw AppError.from(ErrUnitConversionNotFound, 404);
        }

        // Xóa quy đổi đơn vị
        await this.unitConversionRepo.delete(unitConversionId);
    }

    // Lấy thông tin quy đổi đơn vị theo ID
    async get(unitConversionId: string): Promise<UnitConversion | null> {
        return await this.unitConversionRepo.get(unitConversionId);   
    }

    // Lấy danh sách quy đổi đơn vị theo điều kiện
    async list(cond: UnitConversionCondDTO, paging: PagingDTO): Promise<Paginated<UnitConversion>> {
        return await this.unitConversionRepo.list(cond, paging);
    }
    // Lấy danh sách quy đổi đơn vị theo nhiều ID
    async listByIds(unitConversionIds: string[]): Promise<UnitConversion[]> {
        return await this.unitConversionRepo.listByIds(unitConversionIds);
    }
}