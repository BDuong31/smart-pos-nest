import { Inject, Injectable } from "@nestjs/common";
import { type IInventoryBatchRepository, IInventoryBatchService } from "../ports/inventoryBatch.port";
import { INVENTORYBATCH_REPOSITORY } from "../inventory.di-token";
import { ErrInventoryBatchAlreadyExists, ErrInventoryBatchNotFound, InventoryBatch } from "../models/inventoryBatch.model";
import { type IEventPublisher, Requester } from "src/share/interface";
import { InventoryBatchCondDTO, InventoryBatchCreateDTO, inventoryBatchCreateDTOSchema, InventoryBatchUpdateDTO, inventoryBatchUpdateDTOSchema } from "../dtos/inventoryBatch.dto";
import { v7 } from "uuid";
import { AppError, EVENT_PUBLISHER, Paginated, PagingDTO } from "src/share";
import { InventoryBatchCreatedEvent, InventoryBatchDeletedEvent, InventoryBatchUpdatedEvent } from "src/share/event/inventory-batch.evt";

// Lớp InventoryBatchService cung cấp các phương thức để quản lý lô hàng tồn kho
@Injectable()
export class InventoryBatchService implements IInventoryBatchService {
    constructor(
        @Inject(INVENTORYBATCH_REPOSITORY) private readonly inventoryBatchRepo: IInventoryBatchRepository,
        @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
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
            importInvoiceDetailId: data.importInvoiceDetailId,
            quantity: data.quantity,
            expiryDate: data.expiryDate,
            importDate: data.importDate,
            createdAt: new Date(),
            updatedAt: new Date(),
        };  

        await this.inventoryBatchRepo.insert(inventoryBatch);

        await this.eventPublisher.publish(InventoryBatchCreatedEvent.create({
            batchId: newId,
            ingredientId: data.ingredientId,
            quantity: data.quantity,
            expiryDate: data.expiryDate,
            importDate: data.importDate,
            changeType: 'CREATED',
        }, requester.sub));

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

        await this.eventPublisher.publish(InventoryBatchUpdatedEvent.create({
            batchId: inventoryBatchId,
            ingredientId: data.ingredientId || updatedInventoryBatch.ingredientId,
            quantity: data.quantity || updatedInventoryBatch.quantity,
            expiryDate: data.expiryDate || updatedInventoryBatch.expiryDate,
            importDate: data.importDate || updatedInventoryBatch.importDate,
            changeType: 'UPDATED',
        }, requester.sub));

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

        await this.eventPublisher.publish(InventoryBatchDeletedEvent.create({
            batchId: inventoryBatchId,
            ingredientId: existing.ingredientId,
            quantity: existing.quantity,
            expiryDate: existing.expiryDate,
            importDate: existing.importDate,
            changeType: 'DELETED',
        }, requester.sub));
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