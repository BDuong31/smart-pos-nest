import { Inject, Injectable } from "@nestjs/common";
import { type IImportInvoiceRepository, IImportInvoiceService } from "../ports/importInvoice.port";
import { IMPORTINVOICE_REPOSITORY } from "../inventory.di-token";
import { ErrImportInvoiceAlreadyExists, ErrImportInvoiceNotFound, ImportInvoice } from "../models/importInvoice.model";
import { Requester } from "src/share/interface";
import { ImportInvoiceCondDTO, ImportInvoiceCreateDTO, importInvoiceCreateDTOSchema, ImportInvoiceUpdateDTO, importInvoiceUpdateDTOSchema } from "../dtos/importInvoice.dto";
import { v7 } from "uuid";
import { AppError, Paginated, PagingDTO } from "src/share"; 

// Lớp ImportInvoiceService cung cấp các phương thức để quản lý hóa đơn nhập hàng   
@Injectable()   
export class ImportInvoiceService implements IImportInvoiceService {
    constructor(
        @Inject(IMPORTINVOICE_REPOSITORY) private readonly importInvoiceRepo: IImportInvoiceRepository,
    ){}

    // Tạo mới hóa đơn nhập hàng
    async create(requester: Requester, dto: ImportInvoiceCreateDTO, ip: string, userAgent: string): Promise<ImportInvoice> {
        // Kiểm tra dữ liệu đầu vào
        const data = importInvoiceCreateDTOSchema.parse(dto);  
        
        // Kiểm tra xem hóa đơn nhập hàng đã tồn tại chưa
        const existing = await this.importInvoiceRepo.list({ code: data.code }, { page: 1, limit: 1 });
        
        if (existing.total > 0) {
            throw AppError.from(ErrImportInvoiceAlreadyExists, 409);
        }
        
        // Tạo hóa đơn nhập hàng mới    
        const newId = v7();
        const importInvoice = {
            id: newId,
            code: data.code,
            supplierId: data.supplierId,
            totalCost: data.totalCost,
            importDate: data.importDate,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.importInvoiceRepo.insert(importInvoice);

        return importInvoice;
    }
    
    // Cập nhật thông tin hóa đơn nhập hàng theo ID
    async update(requester: Requester, importInvoiceId: string, dto: ImportInvoiceUpdateDTO, ip: string, userAgent: string): Promise<ImportInvoice> {
        // Kiểm tra dữ liệu đầu vào
        const data = importInvoiceUpdateDTOSchema.parse(dto);

        // Kiểm tra xem hóa đơn nhập hàng có tồn tại không
        const existing = await this.importInvoiceRepo.get(importInvoiceId);
        if (!existing) {
            throw AppError.from(ErrImportInvoiceNotFound, 404);
        }

        // Cập nhật thông tin hóa đơn nhập hàng
        await this.importInvoiceRepo.update(importInvoiceId, data);

        const updatedImportInvoice = await this.importInvoiceRepo.get(importInvoiceId);
        if (!updatedImportInvoice) {
            throw AppError.from(ErrImportInvoiceNotFound, 404);
        }
        return updatedImportInvoice;
    }

    // Xóa hóa đơn nhập hàng theo ID
    async delete(requester: Requester, importInvoiceId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem hóa đơn nhập hàng có tồn tại không
        const existing = await this.importInvoiceRepo.get(importInvoiceId);
        if (!existing) {
            throw AppError.from(ErrImportInvoiceNotFound, 404);
        }

        // Xóa hóa đơn nhập hàng
        await this.importInvoiceRepo.delete(importInvoiceId);
    }

    // Lấy thông tin hóa đơn nhập hàng theo ID 
    async get(importInvoiceId: string): Promise<ImportInvoice | null> {
        return await this.importInvoiceRepo.get(importInvoiceId);   
    } 

    // Lấy danh sách hóa đơn nhập hàng theo điều kiện
    async list(cond: ImportInvoiceCondDTO, pagingDTO: PagingDTO): Promise<Paginated<ImportInvoice>> {
        return await this.importInvoiceRepo.list(cond, pagingDTO);   
    }

    // Lấy danh sách hóa đơn nhập hàng theo nhiều ID
    async listByIds(importInvoiceIds: string[]): Promise<ImportInvoice[]> {
        return await this.importInvoiceRepo.listByIds(importInvoiceIds);
    }
}