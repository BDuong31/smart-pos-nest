import { IProductRepository } from '../ports/product.port';
import { Product, Variant } from '../models/product.model';
import prisma from 'src/share/components/prisma';
import {Prisma , Product as ProductPrisma, Variant as VariantPrisma } from '@prisma/client';
import { ProductCondDTO, ProductUpdateDTO, VariantCondDTO, VariantUpdateDTO } from '../dtos/product.dto';
import { Paginated, PagingDTO } from 'src/share/data-model';

// Lớp ProductRepository sử dụng Prisma để tương tác với cơ sở dữ liệu`
export class ProductRepository implements IProductRepository {
    // ============================
    // Thao tác với sản phẩm
    // ============================

    // Lấy sản phẩm theo ID
    async get(id: string): Promise<Product | null> {
        const data = await prisma.product.findUnique({ where: { id } });
        return data ? this._toModel(data) : null;
    }

    // Lấy danh sách sản phẩm theo điều kiện lọc
    async list(cond: ProductCondDTO, paging: PagingDTO): Promise<Paginated<Product>> {
        const { name, categoryId, printerId, isActive, isCombo, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (name) {
            where = {
                ...where,
                name: name,
            }
        }

        if (categoryId) {
            where = {
                ...where,
                categoryId: categoryId,
            }
        }

        if (printerId) {
            where = {
                ...where,
                printerId: printerId,
            }
        }

        if (isActive !== undefined) {
            where = {
                ...where,
                isActive: isActive,
            }
        }

        if (isCombo !== undefined) {
            where = {
                ...where,
                isCombo: isCombo,
            }
        }   

        const total = await prisma.product.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const data = await prisma.product.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { name: 'asc' },
        });

        return {
            data: data.map(this._toModel),
            paging,
            total
        };
    }

    // Lấy danh sách sản phẩm theo mảng IDs
    async listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Product>> {
        const total = await prisma.product.count({ where: { id: { in: ids } } });

        const skip = (paging.page - 1) * paging.limit;

        const data = await prisma.product.findMany({
            where: { id: { in: ids } },
            skip,
            take: paging.limit,
            orderBy: { name: 'asc' },
        });

        return {
            data: data.map(this._toModel),
            paging,
            total
        };
    }

    // Tìm kiếm sản phẩm theo từ khóa
    async searchByKeyword(keyword: string, paging: PagingDTO): Promise<Paginated<Product>> {
         const where = {
            name: { contains: keyword, mode: 'insensitive' as Prisma.QueryMode },
        };

        const total = await prisma.product.count({ where: where });

        const skip = (paging.page - 1) * paging.limit;

        const data = await prisma.product.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { name: 'asc' },
        });

        return {
            data: data.map(this._toModel),
            paging,
            total
        };    
    }

    // Tạo mới sản phẩm
    async insert(product: Product): Promise<void> {
        await prisma.product.create({ data: product });
    }

    // Cập nhật thông tin sản phẩm
    async update(id: string, dto: ProductUpdateDTO): Promise<void> {
        await prisma.product.update({ where: { id }, data: dto });
    }

    // Xóa sản phẩm theo ID
    async delete(id: string): Promise<void> {
        await prisma.product.delete({ where: { id } });
    }

    // ============================
    // Thao tác với biến thể sản phẩm
    // ============================

    // Lấy biến thể sản phẩm theo ID
    async getVariant(id: string): Promise<Variant | null> {
        const data = await prisma.variant.findUnique({ where: { id } });
        return data ? this._toModelVariant(data) : null;
    }

    // Lấy danh sách biến thể sản phẩm theo điều kiện lọc
    async listVariant(cond: VariantCondDTO, paging: PagingDTO): Promise<Paginated<Variant>> {
        const { productId, name, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (productId) {
            where = {
                ...where,
                productId: productId,
            }
        }

        if (name) {
            where = {
                ...where,
                name: name,
            }
        }

        const total = await prisma.variant.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const data = await prisma.variant.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { name: 'asc' },
        });

        return {
            data: data.map(this._toModelVariant),
            paging,
            total
        };
    }

    // Lấy danh sách biến thể sản phẩm theo mảng IDs
    async listVariantByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Variant>> {
        const total = await prisma.variant.count({ where: { id: { in: ids } } });   

        const skip = (paging.page - 1) * paging.limit;
        
        const data = await prisma.variant.findMany({
            where: { id: { in: ids } },
            skip,
            take: paging.limit,
            orderBy: { name: 'asc' },
        });

        return {
            data: data.map(this._toModelVariant),
            paging,
            total
        };
    }

    // Thêm biến thể sản phẩm mới
    async insertVariant(variant: Variant): Promise<void> {
        await prisma.variant.create({ data: variant });
    }

    // Thêm nhiều biến thể sản phẩm cùng lúc
    async insertVariants(variants: Variant[]): Promise<void> {
        await prisma.variant.createMany({ data: variants });
    }

    // Cập nhật thông tin biến thể sản phẩm
    async updateVariant(id: string, dto: VariantUpdateDTO): Promise<void> {
        await prisma.variant.update({ where: { id }, data: dto });
    }

    // Xóa biến thể sản phẩm theo ID
    async deleteVariant(id: string): Promise<void> {
        await prisma.variant.delete({ where: { id } });
    }

    // Chuyển đổi dữ liệu từ Prisma sang Model
    private _toModel(data: ProductPrisma): Product {
        return {...data} as Product;
    }

    private _toModelVariant(data: VariantPrisma): Variant {
        return {...data} as Variant;
    }
}