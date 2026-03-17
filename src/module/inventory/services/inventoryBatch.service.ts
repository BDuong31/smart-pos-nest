import { Inject, Injectable } from "@nestjs/common";
import { type IInventoryBatchRepository, IInventoryBatchService } from "../ports/inventoryBatch.port";
import { INVENTORYBATCH_REPOSITORY } from "../inventory.di-token";
import { ErrInventoryBatchAlreadyExists, ErrInventoryBatchNotFound, InventoryBatch } from "../models/inventoryBatch.model";
import { Requester } from "src/share/interface";
import { InventoryBatchCondDTO, InventoryBatchCreateDTO, inventoryBatchCreateDTOSchema, InventoryBatchUpdateDTO, inventoryBatchUpdateDTOSchema } from "../dtos/inventoryBatch.dto";
import { v7 } from "uuid";
import { AppError, Paginated, PagingDTO } from "src/share";

// Lớp InventoryBatchService cung cấp các phương thức để quản lý lô hàng tồn kho
@Injectable()
export class InventoryBatchService implements IInventoryBatchService {
    constructor(
        @Inject(INVENTORYBATCH_REPOSITORY) private readonly inventoryBatchRepo: IInventoryBatchRepository,
    ){}

    // Tạo mới lô hàng tồn kho
    async create(requester: Requester, dto: InventoryBatchCreateDTO, ip: string, userAgent: string): Promise<InventoryBatch> {
        // Kiểm tra dữ liệu đầu vào
        const data = inventoryBatchCreateDTOSchema.parse(dto);

        // Tạo lô hàng tồn kho mới
        const newId = v7();
        const inventoryBatch = {
            id: newId,
            ingredientId: data.ingredientId,
            quantity: data.quantity,
            expiryDate: data.expiryDate,
            importDate: data.importDate,
            createdAt: new Date(),
            updatedAt: new Date(),
        };  

        await this.inventoryBatchRepo.insert(inventoryBatch);

        return inventoryBatch;
    }

    // Cập nhật thông tin lô hàng tồn kho theo ID
    async update(requester: Requester, inventoryBatchId: string, dto: InventoryBatchUpdateDTO, ip: string, userAgent: string): Promise<InventoryBatch> {
        // Kiểm tra dữ liệu đầu vào
        const data = inventoryBatchUpdateDTOSchema.parse(dto);

        // Cập nhật thông tin lô hàng tồn kho
        await this.inventoryBatchRepo.update(inventoryBatchId, data);

        // Trả về thông tin lô hàng tồn kho sau khi cập nhật
        const updatedInventoryBatch = await this.inventoryBatchRepo.get(inventoryBatchId);
        if (!updatedInventoryBatch) {
            throw AppError.from(ErrInventoryBatchNotFound, 404);
        }

        return updatedInventoryBatch;
    }

    // Xóa lô hàng tồn kho theo ID
    async delete(requester: Requester, inventoryBatchId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem lô hàng tồn kho có tồn tại không
        const existing = await this.inventoryBatchRepo.get(inventoryBatchId);
        if (!existing) {
            throw AppError.from(ErrInventoryBatchNotFound, 404);
        }

        // Xóa lô hàng tồn kho
        await this.inventoryBatchRepo.delete(inventoryBatchId);
    }

    // Lấy thông tin lô hàng tồn kho theo ID   
    async get(inventoryBatchId: string): Promise<InventoryBatch | null> {
        return await this.inventoryBatchRepo.get(inventoryBatchId);   
    } 

    // Lấy danh sách lô hàng tồn kho theo điều kiện
    async list(cond: InventoryBatchCondDTO, pagingDTO: PagingDTO): Promise<Paginated<InventoryBatch>> {
        return await this.inventoryBatchRepo.list(cond, pagingDTO);   
    }

    // Lấy danh sách lô hàng tồn kho theo nhiều ID
    async listByIds(inventoryBatchIds: string[]): Promise<InventoryBatch[]> {
        return await this.inventoryBatchRepo.listByIds(inventoryBatchIds);
    }
}