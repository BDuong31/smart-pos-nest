import { IProductRepository } from '../ports/product.port';
import { Product, Variant, Combo, ComboItem } from '../models/product.model';
import prisma from 'src/share/components/prisma';
import {Prisma , Product as ProductPrisma, Variant as VariantPrisma, Combo as ComboPrisma, ComboItem as ComboItemPrisma } from '@prisma/client';
import { ProductCondDTO, ProductUpdateDTO, VariantCondDTO, VariantUpdateDTO, ComboCreateDTO, ComboUpdateDTO, ComboCondDTO, ComboItemCreateDTO, ComboItemUpdateDTO, ComboItemCondDTO } from '../dtos/product.dto';
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
    async listByIds(ids: string[]): Promise<Product[]> {
        let data;
        if (ids.length > 0){
            data = await prisma.product.findMany({
                where: { id: { in: ids } },
            });
        } else {
            data = await prisma.product.findMany();
        }
        return data.map(this._toModel);
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
    async listVariantByIds(ids: string[]): Promise<Variant[]> {
        let data
        if (ids && ids.length > 0){
            data = await prisma.variant.findMany({
                where: { id: { in: ids } },
            });
        } else {
            data = await prisma.variant.findMany();
        }
        return data.map(this._toModelVariant);
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

    // ============================
    // Thao tác với combo sản phẩm
    // ============================

    // Lấy combo sản phẩm theo ID
    async getCombo(id: string): Promise<Combo | null> {
        const data = await prisma.combo.findUnique({ where: { id } });
        return data ? this._toModelCombo(data) : null;
    }

    // Lấy danh sách combo sản phẩm theo điều kiện lọc
    async listCombo(cond: ComboCondDTO, paging: PagingDTO): Promise<Paginated<Combo>> {
        const { name, price } = cond; 

        let where = {}

        if (name) {
            where = {
                ...where,
                name: name,
            }
        }

        if (price) {
            where = {
                ...where,
                price: price,
            }
        }

        const page = Number(paging.page) || 1;
        const limit = Number(paging.limit) || 10;
        
        const skip = (page - 1) * limit;
        const total = await prisma.combo.count({ where });

        const data = await prisma.combo.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: 'asc' },
        });

        return {
            data: data.map(this._toModelCombo),
            paging,
            total
        };
    }

    // Lấy danh sách combo sản phẩm theo mảng IDs
    async listComboByIds(ids: string[]): Promise<Combo[]> {
        const data = await prisma.combo.findMany({
            where: { id: { in: ids } },
        });
        return data.map(this._toModelCombo);
    }

    // Tạo combo sản phẩm mới
    async insertCombo(combo: Combo): Promise<void> {
        await prisma.combo.create({ data: combo });
    }

    // Cập nhật thông tin combo sản phẩm
    async updateCombo(id: string, dto: ComboUpdateDTO): Promise<void> {
        await prisma.combo.update({ where: { id }, data: dto });
    }

    // Xóa combo sản phẩm theo ID
    async deleteCombo(id: string): Promise<void> {
        await prisma.combo.delete({ where: { id } });
    }

     // ============================
    // Thao tác với mục combo sản phẩm
    // ============================

     // Lấy mục combo sản phẩm theo ID
     async getComboItem(id: string): Promise<ComboItem | null> {
        const data = await prisma.comboItem.findUnique({ where: { id } });
        return data ? this._toModelComboItem(data) : null;
    }

    // Lấy danh sách mục combo sản phẩm theo điều kiện lọc
    async listComboItem(cond: ComboItemCondDTO, paging: PagingDTO): Promise<Paginated<ComboItem>> {
        const { comboId, productId, variantId, quantity } = cond;    
        let where = {}  

        if (comboId) {
            where = {
                ...where,
                comboId: comboId,
            }
        }

        if (productId) {
            where = {
                ...where,
                productId: productId,
            }
        }

        if (variantId) {
            where = {
                ...where,
                variantId: variantId,
            }
        }

        if (quantity) {
            where = {
                ...where,
                quantity: quantity,
            }
        }

        const page = Number(paging.page) || 1;
        const limit = Number(paging.limit) || 10;
        
        const skip = (page - 1) * limit;
        const total = await prisma.comboItem.count({ where });

        const data = await prisma.comboItem.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'asc' },
        });

        return {
            data: data.map(this._toModelComboItem),
            paging,
            total
        };
    }

    // Lấy danh sách mục combo sản phẩm theo mảng IDs
    async listComboItemsByIds(ids: string[]): Promise<ComboItem[]> {
        const data = await prisma.comboItem.findMany({
            where: { id: { in: ids } },
        });
        return data.map(this._toModelComboItem);
    }

    // Tạo mục combo sản phẩm mới
    async insertComboItem(comboItem: ComboItem): Promise<void> {
        await prisma.comboItem.create({ data: comboItem });
    }

    // Cập nhật thông tin mục combo sản phẩm
    async updateComboItem(id: string, dto: ComboItemUpdateDTO): Promise<void> {
        await prisma.comboItem.update({ where: { id }, data: dto });
    }

    // Xóa mục combo sản phẩm theo ID
    async deleteComboItem(id: string): Promise<void> {
        await prisma.comboItem.delete({ where: { id } });
    }

    // Chuyển đổi dữ liệu từ Prisma sang Model
    private _toModel(data: ProductPrisma): Product {
        return {...data} as Product;
    }

    private _toModelVariant(data: VariantPrisma): Variant {
        return {...data} as Variant;
    }

    private _toModelCombo(data: ComboPrisma): Combo {
        return {...data} as Combo;
    }

    private _toModelComboItem(data: ComboItemPrisma): ComboItem {
        return {...data} as ComboItem;
    }
}