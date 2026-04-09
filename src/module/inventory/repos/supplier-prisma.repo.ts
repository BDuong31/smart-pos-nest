import { Paginated, PagingDTO } from "src/share";
import { Supplier } from "../models/supplier.model";
import { Supplier as PrismaSupplier } from "@prisma/client";
import type { SupplierCreateDTO, SupplierUpdateDTO, SupplierCondDTO } from "../dtos/supplier.dto";
import { ISupplierRepository } from "../ports/supplier.port";
import prisma from "src/share/components/prisma";

// Triển khai SupplierPrismaRepo
export class SupplierPrismaRepo implements ISupplierRepository {
    // Lấy thông tin nhà cung cấp theo ID
    async get(supplierId: string): Promise<Supplier | null> {
        const result = await prisma.supplier.findFirst({ where: { id: supplierId } });  

        if (!result) return null;

        return this._toModel(result);
    }

    // Lấy danh sách nhà cung cấp theo điều kiện
    async list(cond: SupplierCondDTO, paging: PagingDTO): Promise<Paginated<Supplier>> {
        const { name, contact, ...rest } = cond;

        let where = {
        }

        if (name) {
            where = {
                ...where,
                name: name,
            }
        }

        if (contact) {
            where = {
                ...where,
                contact: contact,
            }
        }

        const page = Number(paging.page) || 1;
        const limit = Number(paging.limit) || 10;

        const total = await prisma.supplier.count({ where });

        const skip = (page - 1) * limit;
        
        const result = await prisma.supplier.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: 'asc' },
        });

        return {
            data: result.map(this._toModel),
            paging,
            total
        }
    }

    // Lấy danh sách nhà cung cấp theo nhiều ID
    async listByIds(supplierIds: string[]): Promise<Supplier[]> {
        const result = await prisma.supplier.findMany({ where: { id: { in: supplierIds } } });

        return result.map(this._toModel);
    }

    // Tạo mới nhà cung cấp
    async insert(supplier: Supplier): Promise<void> {
        await prisma.supplier.create({ data: supplier });
    }

    // Cập nhật thông tin nhà cung cấp theo ID  
    async update(supplierId: string, supplierUpdateDTO: SupplierUpdateDTO): Promise<void> {
        await prisma.supplier.update({ where: { id: supplierId }, data: supplierUpdateDTO });
    }
    
    // Xóa nhà cung cấp theo ID
    async delete(supplierId: string): Promise<void> {
        await prisma.supplier.delete({ where: { id: supplierId } });
    }

    // Chuyển đổi dữ liệu từ database sang model Supplier
    private _toModel(data: PrismaSupplier): Supplier {
        return { ...data } as Supplier 
    }
}

