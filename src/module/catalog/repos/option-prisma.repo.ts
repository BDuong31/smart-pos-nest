import { Injectable } from '@nestjs/common';
import { IOptionRepository } from '../ports/option.port';
import { OptionGroup, OptionItem, ProductOptionConfig } from '../models/option.model';
import prisma from 'src/share/components/prisma';
import { OptionGroup as OptionGroupPrisma, OptionItem as OptionItemPrisma, ProductOptionConfig as ProductOptionConfigPrisma } from '@prisma/client';
import { OptionGroupCondDTO, OptionItemCondDTO, ProductOptionConfigCondDTO, UpdateOptionItemDTO, UpdateProductOptionConfigDTO } from '../dtos/option.dto';
import { Paginated, PagingDTO } from 'src/share';

// Lớp OptionRepository triển khai IOptionRepository sử dụng Prisma
@Injectable()
export class OptionPrismaRepository implements IOptionRepository {
    // ============================
    // Repository cho Option Group
    // ============================

    // tạo Option Group mới
    async insertOptionGroup(optionGroup: OptionGroup): Promise<void> {  
        await prisma.optionGroup.create({
            data: optionGroup
        });
    }

    // cập nhật Option Group
    async updateOptionGroup(id: string, dto: any): Promise<void> {
        await prisma.optionGroup.update({
            where: { id },
            data: dto
        });
    }

    // xóa Option Group
    async deleteOptionGroup(id: string): Promise<void> {
        await prisma.optionGroup.delete({
            where: { id }
        });
    }

    // lấy Option Group theo ID
    async getOptionGroup(id: string): Promise<OptionGroup | null> {
        const data = await prisma.optionGroup.findUnique({
            where: { id }
        });
        return data ? this._toModelOptionGroup(data) : null;
    }

    // lấy danh sách Option Group theo điều kiện
    async getListOptionGroup(cond: OptionGroupCondDTO, paging: PagingDTO): Promise<Paginated<OptionGroup>> {
        const { name } = cond || {};

        let where = {
        }
        
        if (name) {
            where = {
                ...where,
                name: name,
            }
        }

        const page = Number(paging.page);
        const limit = Number(paging.limit);

        const total = await prisma.optionGroup.count({ where });

        const skip = (page - 1) * limit;
        
        const data = await prisma.optionGroup.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                name: 'asc',
            }
        });

        return {
            data: data.map(this._toModelOptionGroup),
            paging,
            total,
        };
    };

    // lấy danh sách Option Group theo mảng IDs
    async getOptionGroupByIds(ids: string[]): Promise<OptionGroup[]> {
        let data;
        if (ids.length > 0) {
            data = await prisma.optionGroup.findMany({ where: { id: { in: ids }} });
        } else {
            data = await prisma.optionGroup.findMany();
        }
        return data.map(this._toModelOptionGroup);
    }
 
    // ============================
    // Repository cho Option Item
    // ============================

    // tạo Option Item mới
    async insertOptionItem(optionItem: OptionItem): Promise<void> {
        await prisma.optionItem.create({
            data: optionItem
        });
    }

    // cập nhật Option Item
    async updateOptionItem(id: string, dto: UpdateOptionItemDTO): Promise<void> {
        await prisma.optionItem.update({
            where: {
                id: id,
            },
            data: dto
        });
    }

    // xóa Option Item
    async deleteOptionItem(id: string): Promise<void> {
        await prisma.optionItem.delete({
            where: {
                id: id,
            }
        });
    }

    // lấy Option Item theo ID
    async getOptionItem(id: string): Promise<OptionItem | null> {
        const data = await prisma.optionItem.findUnique({
            where: {
                id: id,
            }
        });
        return data ? this._toModelOptionItem(data) : null;
    }

    // lấy danh sách Option Item theo điều kiện
    async getListOptionItem(cond: OptionItemCondDTO, paging: PagingDTO): Promise<Paginated<OptionItem>> {
        const { groupId, name } = cond; 

        let where = {   
        }

        if (groupId) {
            where = {
                ...where,
                groupId: groupId,
            }
        }
        if (name) {
            where = {
                ...where,
                name: name,
            }
        }

        const total = await prisma.optionItem.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const data = await prisma.optionItem.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: {
                name: 'asc',
            }
        });

        return {
            data: data.map(this._toModelOptionItem),
            paging,
            total,
        };
    }

    // lấy danh sách Option Item theo mảng IDs
    async getOptionItemsByIds(ids: string[]): Promise<OptionItem[]> {
        let data;
        if (ids.length > 0) {
            data = await prisma.optionItem.findMany({
                where: {
                    id: {
                        in: ids,
                    },
                },
            })
        } else {
            data = await prisma.optionItem.findMany();
        }
            
        return data.map(this._toModelOptionItem);
    }

    // ============================
    // Repository cho Product Option Config
    // ============================

    // tạo Product Option Config mới
    async insertProductOptionConfig(config: ProductOptionConfig): Promise<void> {
        await prisma.productOptionConfig.create({
            data: config
        });
    }

    // cập nhật Product Option Config
    async updateProductOptionConfig(id: string, dto: UpdateProductOptionConfigDTO): Promise<void>{
        await prisma.productOptionConfig.update({
            where: { id },
            data: dto,
        });
    }

    // xóa Product Option Config
    async deleteProductOptionConfig(id: string): Promise<void> {
        await prisma.productOptionConfig.delete({
            where: {
                id: id,
            }
        });
    }

    // lấy Product Option Config theo điều kiện
    async listProductOptionConfig(cond: ProductOptionConfigCondDTO, paging: PagingDTO): Promise<Paginated<ProductOptionConfig>> {
        const { productId, optionGroupId } = cond;

        let where = {
        }

        if (productId) {
            where = {
                ...where,
                productId: productId,
            }
        }

        if (optionGroupId) {
            where = {
                ...where,
                optionGroupId: optionGroupId,
            }
        }

        const page = Number(paging.page);
        const limit = Number(paging.limit);

        const total = await prisma.productOptionConfig.count({ where });

        const skip = (page - 1) * limit;

        const data = await prisma.productOptionConfig.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            }
        });

        return {
            data: data.map(this._toModelProductOptionConfig),
            paging,
            total,
        };
    }

    // lấy Product Option Config theo product ID
    async getProductOptionConfigById(id: string): Promise<ProductOptionConfig | null> {
        const data = await prisma.productOptionConfig.findFirst({
            where: {
                id,
            }
        });

        return data ? this._toModelProductOptionConfig(data) : null;
    }

    // lấy danh sách Product Option Config theo mảng product IDs
    async getProductOptionConfigsByIds(ids: string[]): Promise<ProductOptionConfig[]> {
        let data;
        if (ids.length > 0) {
            data = await prisma.productOptionConfig.findMany({
            where: {
                id: {
                    in: ids,
                }
            }
        });
        } else {
            data = await prisma.productOptionConfig.findMany();
        }
        return data.map(this._toModelProductOptionConfig);
    }

    // Chuyển đổi dữ liệu Prisma sang mô hình OptionGroup
    private _toModelOptionGroup(data: OptionGroupPrisma): OptionGroup {
        return { ...data } as OptionGroup;
    }

    // Chuyển đổi dữ liệu Prisma sang mô hình OptionItem
    private _toModelOptionItem(data: OptionItemPrisma): OptionItem {
        return { ...data } as OptionItem;
    }

    // Chuyển đổi dữ liệu Prisma sang mô hình ProductOptionConfig
    private _toModelProductOptionConfig(data: ProductOptionConfigPrisma): ProductOptionConfig {
        return { ...data } as ProductOptionConfig;
    }
}