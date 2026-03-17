import { Inject, Injectable } from "@nestjs/common";
import { type ISupplierRepository, ISupplierService } from "../ports/supplier.port";
import { SUPPLIER_REPOSITORY } from "../inventory.di-token";
import { ErrSupplierAlreadyExists, ErrSupplierNotFound, Supplier } from "../models/supplier.model";
import { Requester } from "src/share/interface";
import { SupplierCondDTO, SupplierCreateDTO, supplierCreateDTOSchema, SupplierUpdateDTO, supplierUpdateDTOSchema } from "../dtos/supplier.dto";
import { v7 } from "uuid";
import { AppError, Paginated, PagingDTO } from "src/share";

// Lớp SupplierService cung cấp các phương thức để quản lý nhà cung cấp
@Injectable()
export class SupplierService implements ISupplierService {
    constructor(
        @Inject(SUPPLIER_REPOSITORY) private readonly supplierRepo: ISupplierRepository,
    ){}

    // Tạo mới nhà cung cấp 
    async create(requester: Requester, dto: SupplierCreateDTO, ip: string, userAgent: string): Promise<Supplier> {
        // Kiểm tra dữ liệu đầu vào
        const data = supplierCreateDTOSchema.parse(dto);

        // Kiểm tra xem nhà cung cấp đã tồn tại chưa
        const existing = await this.supplierRepo.list({ name: data.name }, { page: 1, limit: 1 });
        
        if (existing.total > 0) {
            throw AppError.from(ErrSupplierAlreadyExists, 409);
        }
        
        // Tạo nhà cung cấp mới
        const newId = v7();
        const supplier = {
            id: newId,
            name: data.name,
            contact: data.contact,
            createdAt: new Date(),
            updatedAt: new Date(),
        };  

        await this.supplierRepo.insert(supplier);

        return supplier;
    }

    // Cập nhật thông tin nhà cung cấp theo ID
    async update(requester: Requester, supplierId: string, dto: SupplierUpdateDTO, ip: string, userAgent: string): Promise<Supplier> {
        // Kiểm tra dữ liệu đầu vào
        const data = supplierUpdateDTOSchema.parse(dto);

        // Cập nhật thông tin nhà cung cấp
        await this.supplierRepo.update(supplierId, data);

        // Trả về thông tin nhà cung cấp sau khi cập nhật
        const updatedSupplier = await this.supplierRepo.get(supplierId);
        if (!updatedSupplier) {
            throw AppError.from(ErrSupplierNotFound, 404);
        }

        return updatedSupplier;
    }

    // Xóa nhà cung cấp theo ID
    async delete(requester: Requester, supplierId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem nhà cung cấp có tồn tại không
        const existing = await this.supplierRepo.get(supplierId);
        if (!existing) {
            throw AppError.from(ErrSupplierNotFound, 404);
        }

        // Xóa nhà cung cấp
        await this.supplierRepo.delete(supplierId);
    }

    // Lấy thông tin nhà cung cấp theo ID
    async get(supplierId: string): Promise<Supplier | null> {
        return await this.supplierRepo.get(supplierId);   
    }

    // Lấy danh sách nhà cung cấp theo điều kiện
    async list(cond: SupplierCondDTO, pagingDTO: PagingDTO): Promise<Paginated<Supplier>> {
        return await this.supplierRepo.list(cond, pagingDTO);   
    }

    // Lấy danh sách nhà cung cấp theo nhiều ID
    async listByIds(supplierIds: string[]): Promise<Supplier[]> {
        return await this.supplierRepo.listByIds(supplierIds);
    }
}