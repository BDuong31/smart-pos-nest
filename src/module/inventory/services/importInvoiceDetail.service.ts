import { Inject, Injectable } from "@nestjs/common";
import { type IImportInvoiceDetailRepository, IImportInvoiceDetailService } from "../ports/importInvoiceDetail.port";
import { IMPORTINVOICEDETAIL_REPOSITORY } from "../inventory.di-token";
import { ErrImportInvoiceDetailAlreadyExists, ErrImportInvoiceDetailNotFound, ImportInvoiceDetail } from "../models/importInvoiceDetail.model";
import { Requester } from "src/share/interface";
import { ImportInvoiceDetailCondDTO, ImportInvoiceDetailCreateDTO, importInvoiceDetailCreateDTOSchema, ImportInvoiceDetailUpdateDTO, importInvoiceDetailUpdateDTOSchema } from "../dtos/importInvoiceDetail.dto";
import { v7 } from "uuid";
import { AppError, Paginated, PagingDTO } from "src/share";

// Lớp ImportInvoiceDetailService cung cấp các phương thức để quản lý chi tiết hóa đơn nhập hàng
@Injectable()
export class ImportInvoiceDetailService implements IImportInvoiceDetailService {
    constructor(
        @Inject(IMPORTINVOICEDETAIL_REPOSITORY) private readonly importInvoiceDetailRepo: IImportInvoiceDetailRepository,
    ){}

    // Tạo mới chi tiết hóa đơn nhập hàng
    async create(requester: Requester, dto: ImportInvoiceDetailCreateDTO, ip: string, userAgent: string): Promise<ImportInvoiceDetail> {
        // Kiểm tra dữ liệu đầu vào
        const data = importInvoiceDetailCreateDTOSchema.parse(dto);

        // Kiểm tra xem chi tiết hóa đơn nhập hàng đã tồn tại chưa
        const existing = await this.importInvoiceDetailRepo.list({ invoiceId: data.invoiceId, ingredientId: data.ingredientId }, { page: 1, limit: 1 });

        if (existing.total > 0) {
            throw AppError.from(ErrImportInvoiceDetailAlreadyExists, 409);
        }

        // Tạo chi tiết hóa đơn nhập hàng mới
        const newId = v7();
        const importInvoiceDetail = {
            id: newId,
            invoiceId: data.invoiceId,
            ingredientId: data.ingredientId,
            quantity: data.quantity,
            unit: data.unit,
            unitPrice: data.unitPrice,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.importInvoiceDetailRepo.insert(importInvoiceDetail);

        return importInvoiceDetail;
    }

    // Cập nhật thông tin chi tiết hóa đơn nhập hàng theo ID
    async update(requester: Requester, importInvoiceDetailId: string, dto: ImportInvoiceDetailUpdateDTO, ip: string, userAgent: string): Promise<ImportInvoiceDetail> {
        // Kiểm tra dữ liệu đầu vào
        const data = importInvoiceDetailUpdateDTOSchema.parse(dto);

        // Kiểm tra xem chi tiết hóa đơn nhập hàng có tồn tại không
        const existing = await this.importInvoiceDetailRepo.get(importInvoiceDetailId);
        if (!existing) {
            throw AppError.from(ErrImportInvoiceDetailNotFound, 404);
        }

        // Cập nhật thông tin chi tiết hóa đơn nhập hàng
        await this.importInvoiceDetailRepo.update(importInvoiceDetailId, data); 

        const updatedImportInvoiceDetail = await this.importInvoiceDetailRepo.get(importInvoiceDetailId);   

        if (!updatedImportInvoiceDetail) {  
            throw AppError.from(ErrImportInvoiceDetailNotFound, 404);
        }

        return updatedImportInvoiceDetail;
    }

    // Xóa chi tiết hóa đơn nhập hàng theo ID
    async delete(requester: Requester, importInvoiceDetailId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem chi tiết hóa đơn nhập hàng có tồn tại không
        const existing = await this.importInvoiceDetailRepo.get(importInvoiceDetailId);
        if (!existing) {
            throw AppError.from(ErrImportInvoiceDetailNotFound, 404);
        }

        // Xóa chi tiết hóa đơn nhập hàng
        await this.importInvoiceDetailRepo.delete(importInvoiceDetailId);
    }
    
    // Lấy thông tin chi tiết hóa đơn nhập hàng theo ID
    async get(importInvoiceDetailId: string): Promise<ImportInvoiceDetail | null> {
        return await this.importInvoiceDetailRepo.get(importInvoiceDetailId);   
    }

    // Lấy danh sách chi tiết hóa đơn nhập hàng theo điều kiện
    async list(cond: ImportInvoiceDetailCondDTO, pagingDTO: PagingDTO): Promise<Paginated<ImportInvoiceDetail>> {
        return await this.importInvoiceDetailRepo.list(cond, pagingDTO);   
     }

    // Lấy danh sách chi tiết hóa đơn nhập hàng theo nhiều ID
    async listByIds(ids: string[], pagingDTO: PagingDTO): Promise<Paginated<ImportInvoiceDetail>> {
        return await this.importInvoiceDetailRepo.listByIds(ids, pagingDTO);
    }
}