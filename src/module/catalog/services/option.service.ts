import { Inject, Injectable } from "@nestjs/common";
import type { IOptionRepository, IOptionService } from "../ports/option.port";
import { OPTION_REPOSITORY } from "../catalog.di-token";
import { AppError, Paginated, PagingDTO, Requester } from "src/share";
import { CreateOptionGroupDTO, createOptionGroupDTOSchema, CreateOptionItemDTO, createOptionItemDTOSchema, CreateProductOptionConfigDTO, createProductOptionConfigDTOSchema, OptionGroupCondDTO, OptionItemCondDTO, UpdateOptionGroupDTO, updateOptionGroupDTOSchema, UpdateOptionItemDTO, updateOptionItemDTOSchema, UpdateProductOptionConfigDTO } from "../dtos/option.dto";
import { ErrOptionGroupAlreadyExists, ErrOptionGroupNotFound, ErrOptionItemNotFound, OptionGroup, OptionItem, ProductOptionConfig } from "../models/option.model";
import { v7 } from "uuid";
import { id } from "zod/v4/locales";

@Injectable()
export class OptionService implements IOptionService {
    constructor(
        @Inject(OPTION_REPOSITORY) private readonly optionRepository: IOptionRepository,
    ){}

    // ===========================
    //        Option Group
    // ===========================
    
    // tạo Option Group mới
    async createOptionGroup(requester: Requester, dto: CreateOptionGroupDTO, ip: string, userAgent: string): Promise<OptionGroup | null>{
        // 1. Kiểm tra dữ liệu đầu vào
        const data = createOptionGroupDTOSchema.parse(dto);

        // 2. Kiểm tra xem Option Group đã tồn tại chưa
        const existing = await this.optionRepository.getListOptionGroup({ name: data.name }, { page: 1, limit: 1 });

        if (existing.total > 0) {
            throw AppError.from(ErrOptionGroupAlreadyExists, 409) // lỗi config đúng ko 
        }

        // 3. Tạo mới Option Group
        const newId = v7();
        const newOptionGroup = {
            id: newId,
            name: data.name,
            isMultiSelect: data.isMultiSelect,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.optionRepository.insertOptionGroup(newOptionGroup);

        // 4. Trả về kết quả
        return newOptionGroup;
    }; 

    // cập nhật Option Group
    async updateOptionGroup(requester: Requester, optionGroupId: string, dto: UpdateOptionGroupDTO, ip: string, userAgent: string): Promise<OptionGroup | null>{
        // 1. Kiểm tra dữ liệu đầu vào  
        const data = updateOptionGroupDTOSchema.parse(dto);

        // 2. Kiểm tra xem Option Group có tồn tại không
        const existing = await this.optionRepository.getOptionGroup(optionGroupId);

        if (!existing) {
            throw AppError.from(ErrOptionGroupNotFound, 404);
        }

        // 3. Cập nhật Option Group
        const updatedOptionGroup = {
            ...existing,
            name: data.name,
            isMultiSelect: data.isMultiSelect,
            updatedAt: new Date(),
        }

        await this.optionRepository.updateOptionGroup(optionGroupId, updatedOptionGroup);

        const result = await this.optionRepository.getOptionGroup(optionGroupId);
        // 4. Trả về kết quả
        return result;
    };

    // xoá Option Group
    async deleteOptionGroup(requester: Requester, optionGroupId: string, ip: string, userAgent: string): Promise<void> {
        // 1. Kiểm tra xem Option Group có tồn tại không
        const existing = await this.optionRepository.getOptionGroup(optionGroupId);

        if (!existing) {
            throw AppError.from(ErrOptionGroupNotFound, 404);
        }

        // 2. Xóa Option Group
        await this.optionRepository.deleteOptionGroup(optionGroupId);
    }

    // lấy Option Group theo Id
    async getOptionGroupById(optionGroupId: string): Promise<OptionGroup | null> {
        const optionGroup = await this.optionRepository.getOptionGroup(optionGroupId);
        return optionGroup ? optionGroup : null;
    }

    // lấy danh sách Option Group theo điều kiện
    async getListOptionGroup(cond: OptionGroupCondDTO, paging: PagingDTO): Promise<Paginated<OptionGroup>> {
        const result = await this.optionRepository.getListOptionGroup(cond, paging);
        return result;
    }

    // lấy danh sách Option Group theo mảng Ids
    async getOptionGroupByIds(ids: string[], paging: PagingDTO): Promise<Paginated<OptionGroup>> {
        const result = await this.optionRepository.getOptionGroupByIds(ids, paging);
        return result;
    }

    // ===========================
    //         Option Item
    // ===========================

    // tạo Option Item mới
    async createOptionItem(requester: Requester, optionGroupId: string, dto: CreateOptionItemDTO, ip: string, userAgent: string): Promise<OptionItem | null> {
        // 1. Kiểm tra dữ liệu đầu vào
        const data = createOptionItemDTOSchema.parse(dto);

        // 2. Kiểm tra xem Option Group có tồn tại không
        const optionGroup = await this.optionRepository.getOptionGroup(optionGroupId);

        if (!optionGroup) {
            throw AppError.from(ErrOptionGroupNotFound, 404);
        }

        // 3. Tạo mới Option Item
        const newId = v7();
        const newOptionItem = {
            id: newId,
            groupId: optionGroupId,
            name: data.name,
            priceExtra: data.priceExtra,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.optionRepository.insertOptionItem(newOptionItem);

        // 4. Trả về kết quả
        return newOptionItem;
    }

    // cập nhật Option Item
    async updateOptionItem(requester: Requester, optionGroupId: string, optionItemId: string, dto: UpdateOptionItemDTO, ip: string, userAgent: string): Promise<OptionItem | null> {
        // 1. Kiểm tra dữ liệu đầu vào
        const data = updateOptionItemDTOSchema.parse(dto);

        // 2. Kiểm tra xem Option Group có tồn tại không
        const optionGroup = await this.optionRepository.getOptionGroup(optionGroupId);

        if (!optionGroup) {
            throw AppError.from(ErrOptionGroupNotFound, 404);
        }

        // 3. Kiểm tra xem Option Item có tồn tại không
        const optionItem = await this.optionRepository.getOptionItem(optionGroupId, optionItemId);

        if (!optionItem) {
            throw AppError.from(ErrOptionItemNotFound, 404);
        }

        // 4. Cập nhật Option Item
        const updatedOptionItem = {
            ...optionItem,
            name: data.name,
            priceExtra: data.priceExtra,
            updatedAt: new Date(),
        }

        await this.optionRepository.updateOptionItem(optionGroupId, optionItemId, updatedOptionItem);

        const result = await this.optionRepository.getOptionItem(optionGroupId, optionItemId);
        // 5. Trả về kết quả
        return result;
    }

    // xoá Option Item
    async deleteOptionItem(requester: Requester, optionGroupId: string, optionItemId: string, ip: string, userAgent: string): Promise<void> {
        // 1. Kiểm tra xem Option Group có tồn tại không
        const optionGroup = await this.optionRepository.getOptionGroup(optionGroupId);

        if (!optionGroup) {
            throw AppError.from(ErrOptionGroupNotFound, 404);
        }
        
        // 2. Xóa Option Item
        await this.optionRepository.deleteOptionItem(optionGroupId, optionItemId);
    }

    // lấy Option Item theo Id
    async getOptionItemById(optionGroupId: string, optionItemId: string): Promise<OptionItem | null> {
        const optionItem = await this.optionRepository.getOptionItem(optionGroupId, optionItemId);
        return optionItem ? optionItem : null;  
    }

    // lấy danh sách Option Item theo điều kiện
    async getListOptionItem(cond: OptionItemCondDTO, paging: PagingDTO): Promise<Paginated<OptionItem>> {
        const result = await this.optionRepository.getListOptionItem(cond, paging);
        return result;
    }

    // lấy danh sách Option Item theo mảng Ids
    async getOptionItemsByIds(optionGroupId: string, ids: string[], paging: PagingDTO): Promise<Paginated<OptionItem>> {
        const result = await this.optionRepository.getOptionItemsByIds(optionGroupId, ids, paging);
        return result;
    }

    // ===========================
    //     Product Option Config
    // ===========================
    
    // thiết lập cấu hình Option cho sản phẩm 
    async setProductOptionConfig(requester: Requester, productId: string, dto: ProductOptionConfig, ip: string, userAgent: string): Promise<ProductOptionConfig | null> {
        // 1. Kiểm tra dữ liệu đầu vào
        const data = createProductOptionConfigDTOSchema.parse(dto);

        // 2. Kiểm tra xem cấu hình giữa sản phẩm và nhóm tùy chọn đã tồn tại chưa
        const existing = await this.optionRepository.getProductOptionConfig(productId);

        if (existing) {
            const existConfig = existing.find(config => config.optionGroupId === data.optionGroupId);
            if (existConfig) {
                // 3. Cập nhật cấu hình Option cho sản phẩm
                await this.optionRepository.updateProductOptionConfig(productId, data.optionGroupId, data);
            } else {
                // 4. Thêm mới cấu hình Option cho sản phẩm
                const newConfig = {
                    productId: data.productId,
                    optionGroupId: data.optionGroupId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }

                await this.optionRepository.insertProductOptionConfig(newConfig);
            }
        } else {
            // 4. Thêm mới cấu hình Option cho sản phẩm
            const newConfig = {
                productId: data.productId,
                optionGroupId: data.optionGroupId,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            await this.optionRepository.insertProductOptionConfig(newConfig);
        }

        const result = await this.optionRepository.getProductOptionConfig(productId);
        
        // 5. Trả về kết quả
        return result ? (result.find(config => config.optionGroupId === data.optionGroupId) ?? null) : null;
    }  

    // lấy cấu hình Option của sản phẩm
    async getProductOptionConfig(productId: string): Promise<ProductOptionConfig[] | null> {
        const configs = await this.optionRepository.getProductOptionConfig(productId);
        return configs ? configs : null;
    }
}