import { Injectable } from '@nestjs/common';
import { IOptionRepository } from '../ports/option.port';
import { OptionGroup, OptionItem, ProductOptionConfig } from '../models/option.model';
import prisma from 'src/share/components/prisma';
import { OptionGroup as OptionGroupPrisma, OptionItem as OptionItemPrisma, ProductOptionConfig as ProductOptionConfigPrisma } from '@prisma/client';
import { OptionGroupCondDTO, OptionItemCondDTO, UpdateOptionItemDTO, UpdateProductOptionConfigDTO } from '../dtos/option.dto';
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
        const { name, ...rest } = cond;

        let where = {
            ...rest,
        }
        
        if (name) {
            where = {
                ...where,
                name: name,
            }
        }

        const total = await prisma.optionGroup.count({ where });

        const skip = (paging.page - 1) * paging.limit;
        
        const data = await prisma.optionGroup.findMany({
            where,
            skip,
            take: paging.limit,
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
    async getOptionGroupByIds(ids: string[], paging: PagingDTO): Promise<Paginated<OptionGroup>> {
        const total = await prisma.optionGroup.count({
            where: {
                id: {
                    in: ids,
                }
            }
        });

        const skip = (paging.page - 1) * paging.limit;

        const data = await prisma.optionGroup.findMany({
            where: {
                id: {
                    in: ids,
                }
            },
            skip,
            take: paging.limit,
            orderBy: {
                name: 'asc',
            }
        });

        return {
            data: data.map(this._toModelOptionGroup),
            paging,
            total,
        };
    }
 
    // ============================
    // Repository cho Option Item
    // ============================

    // tạo Option Item mới
    async insertOptionItem(optionItem: any): Promise<void> {
        await prisma.optionItem.create({
            data: optionItem
        });
    }

    // cập nhật Option Item
    async updateOptionItem(optionGroupId: string, optionItemId: string, dto: UpdateOptionItemDTO): Promise<void> {
        await prisma.optionItem.update({
            where: {
                id: optionItemId,
            },
            data: dto
        });
    }

    // xóa Option Item
    async deleteOptionItem(optionGroupId: string, optionItemId: string): Promise<void> {
        await prisma.optionItem.delete({
            where: {
                id: optionItemId,
            }
        });
    }

    // lấy Option Item theo ID
    async getOptionItem(optionGroupId: string, optionItemId: string): Promise<OptionItem | null> {
        const data = await prisma.optionItem.findUnique({
            where: {
                id: optionItemId,
            }
        });
        return data ? this._toModelOptionItem(data) : null;
    }

    // lấy danh sách Option Item theo điều kiện
    async getListOptionItem(cond: OptionItemCondDTO, paging: PagingDTO): Promise<Paginated<OptionItem>> {
        const { groupId, name, ...rest } = cond; 

        let where = {   
            ...rest,
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
    async getOptionItemsByIds(optionGroupId: string, ids: string[], paging: PagingDTO): Promise<Paginated<OptionItem>> {
        const total = await prisma.optionItem.count({
            where: {
                id: {
                    in: ids,
                },
                groupId: optionGroupId,
            }
        });

        const skip = (paging.page - 1) * paging.limit;

        const data = await prisma.optionItem.findMany({
            where: {
                id: {
                    in: ids,
                },
                groupId: optionGroupId,
            },
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
    async updateProductOptionConfig(productId: string, optionGroupId: string, dto: UpdateProductOptionConfigDTO): Promise<void>{
        await prisma.productOptionConfig.update({
            where: {
                productId_optionGroupId: {
                    productId,
                    optionGroupId,
                }
            },
            data: dto
        });
    }

    // xóa Product Option Config
    async deleteProductOptionConfig(productId: string, optionGroupId: string): Promise<void> {
        await prisma.productOptionConfig.delete({
            where: {
                productId_optionGroupId: {
                    productId,
                    optionGroupId,
                }
            }
        });
    }

    // lấy Product Option Config theo product ID
    async getProductOptionConfig(productId: string): Promise<ProductOptionConfig[] | null> {
        const data = await prisma.productOptionConfig.findMany({
            where: {
                productId,
            }
        });

        return data.length > 0 ? data.map(this._toModelProductOptionConfig) : null;
    }

    // lấy danh sách Product Option Config theo mảng product IDs
    async getOptionsConfigByProductIds(productIds: string[], paging: PagingDTO): Promise<Paginated<ProductOptionConfig>> {
        const total = await prisma.productOptionConfig.count({
            where: {
                productId: {
                    in: productIds,
                }
            }
        });

        const skip = (paging.page - 1) * paging.limit;

        const data = await prisma.productOptionConfig.findMany({
            where: {
                productId: {
                    in: productIds,
                }
            },
            skip,
            take: paging.limit,
            orderBy: {
                productId: 'asc',
            }
        });

        return {
            data: data.map(this._toModelProductOptionConfig),
            paging,
            total,
        };
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