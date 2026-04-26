import { Inject, Injectable } from "@nestjs/common";
import type { IOptionRepository, IOptionService } from "../ports/option.port";
import { OPTION_REPOSITORY } from "../catalog.di-token";
import { AppError, EVENT_PUBLISHER,type IEventPublisher, Paginated, PagingDTO, Requester } from "src/share";
import { CreateOptionGroupDTO, createOptionGroupDTOSchema, CreateOptionItemDTO, createOptionItemDTOSchema, CreateProductOptionConfigDTO, createProductOptionConfigDTOSchema, OptionGroupCondDTO, OptionItemCondDTO, ProductOptionConfigCondDTO, UpdateOptionGroupDTO, updateOptionGroupDTOSchema, UpdateOptionItemDTO, updateOptionItemDTOSchema, UpdateProductOptionConfigDTO } from "../dtos/option.dto";
import { ErrOptionGroupAlreadyExists, ErrOptionGroupNotFound, ErrOptionItemNotFound, OptionGroup, OptionItem, ProductOptionConfig } from "../models/option.model";
import { v7 } from "uuid";
import { id } from "zod/v4/locales";
import { OptionGroupCreatedEvent, OptionGroupDeletedEvent, OptionGroupUpdatedEvent, OptionItemCreatedEvent, OptionItemDeletedEvent, OptionItemUpdatedEvent, ProductOptionConfigRemovedEvent, ProductOptionConfigSetEvent } from "src/share/event/option.evt";

@Injectable()
export class OptionService implements IOptionService {
    constructor(
        @Inject(OPTION_REPOSITORY) private readonly optionRepository: IOptionRepository,
        @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
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

        await this.eventPublisher.publish(OptionGroupCreatedEvent.create({
            optionGroupId: newId,
            name: data.name,
            changeType: 'CREATED',
        }, requester.sub));

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

        await this.eventPublisher.publish(OptionGroupUpdatedEvent.create({
            optionGroupId: result?.id || '',
            name: result?.name,
            changeType: 'UPDATED'
        }, requester.sub))
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

        await this.eventPublisher.publish(OptionGroupDeletedEvent.create({
            optionGroupId: existing.id,
            name: existing.name,
            changeType: 'DELETED'
        }, requester.sub))
    }

    // lấy Option Group theo Id
    async getOptionGroupById(optionGroupId: string): Promise<OptionGroup | null> {
        const optionGroup = await this.optionRepository.getOptionGroup(optionGroupId);
        console.log(optionGroup);
        if (!optionGroup) {
            throw AppError.from(ErrOptionGroupNotFound, 404);
        }
        return optionGroup;
    }

    // lấy danh sách Option Group theo điều kiện
    async getListOptionGroup(cond: OptionGroupCondDTO, paging: PagingDTO): Promise<Paginated<OptionGroup>> {
        const result = await this.optionRepository.getListOptionGroup(cond, paging);
        return result;
    }

    // lấy danh sách Option Group theo mảng Ids
    async getOptionGroupByIds(ids: string[]): Promise<OptionGroup[]> {
        const result = await this.optionRepository.getOptionGroupByIds(ids);
        return result;
    }

    // ===========================
    //         Option Item
    // ===========================

    // tạo Option Item mới
    async createOptionItem(requester: Requester, dto: CreateOptionItemDTO, ip: string, userAgent: string): Promise<OptionItem | null> {
        // 1. Kiểm tra dữ liệu đầu vào
        const data = createOptionItemDTOSchema.parse(dto);

        // 2. Kiểm tra xem Option Group có tồn tại không
        const optionGroup = await this.optionRepository.getOptionGroup(data.groupId);

        if (!optionGroup) {
            throw AppError.from(ErrOptionGroupNotFound, 404);
        }

        // 3. Tạo mới Option Item
        const newId = v7();
        const newOptionItem = {
            id: newId,
            groupId: data.groupId,
            name: data.name,
            priceExtra: data.priceExtra,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.optionRepository.insertOptionItem(newOptionItem);

        await this.eventPublisher.publish(OptionItemCreatedEvent.create({
            groupId: data.groupId,
            optionItemId: newId,
            name: data.name,
            priceExtra: data.priceExtra,
            changeType: 'CREATED'
        }, requester.sub))

        // 4. Trả về kết quả
        return newOptionItem;
    }

    // cập nhật Option Item
    async updateOptionItem(requester: Requester, id: string, dto: UpdateOptionItemDTO, ip: string, userAgent: string): Promise<OptionItem | null> {
        // 1. Kiểm tra dữ liệu đầu vào
        const data = updateOptionItemDTOSchema.parse(dto);

        // 2. Kiểm tra xem Option Group có tồn tại không
        const optionGroup = await this.optionRepository.getOptionGroup(id);

        if (!optionGroup) {
            throw AppError.from(ErrOptionGroupNotFound, 404);
        }

        // 3. Kiểm tra xem Option Item có tồn tại không
        const optionItem = await this.optionRepository.getOptionItem(id);

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

        await this.optionRepository.updateOptionItem(id, updatedOptionItem);

        const result = await this.optionRepository.getOptionItem(id);

        await this.eventPublisher.publish(OptionItemUpdatedEvent.create({
            groupId: result?.groupId || '',
            optionItemId: result?.id || '',
            name: result?.name,
            priceExtra: result?.priceExtra,
            changeType: 'UPDATED'
        }, requester.sub))
        // 5. Trả về kết quả
        return result;
    }

    // xoá Option Item
    async deleteOptionItem(requester: Requester, id: string, ip: string, userAgent: string): Promise<void> {
        // 1. Kiểm tra xem Option Item có tồn tại không
        const optionItem = await this.optionRepository.getOptionItem(id);

        if (!optionItem) {
            throw AppError.from(ErrOptionItemNotFound, 404);
        }
        
        // 2. Xóa Option Item
        await this.optionRepository.deleteOptionItem(id);

        await this.eventPublisher.publish(OptionItemDeletedEvent.create({
            groupId: optionItem.groupId,
            optionItemId: optionItem.id,
            name: optionItem.name,
            priceExtra: optionItem.priceExtra,
            changeType: 'DELETED'
        }, requester.sub))
    }

    // lấy Option Item theo Id
    async getOptionItemById(id: string): Promise<OptionItem | null> {
        const optionItem = await this.optionRepository.getOptionItem(id);
        return optionItem ? optionItem : null;  
    }

    // lấy danh sách Option Item theo điều kiện
    async getListOptionItem(cond: OptionItemCondDTO, paging: PagingDTO): Promise<Paginated<OptionItem>> {
        const result = await this.optionRepository.getListOptionItem(cond, paging);
        return result;
    }

    // lấy danh sách Option Item theo mảng Ids
    async getOptionItemsByIds(ids: string[]): Promise<OptionItem[]> {
        const result = await this.optionRepository.getOptionItemsByIds(ids);
        return result;
    }

    // ===========================
    //     Product Option Config
    // ===========================
    
    // thiết lập cấu hình Option cho sản phẩm 
    async setProductOptionConfig(requester: Requester, dto: ProductOptionConfig, ip: string, userAgent: string): Promise<ProductOptionConfig | null> {
        // 1. Kiểm tra dữ liệu đầu vào
        const data = createProductOptionConfigDTOSchema.parse(dto);

        // 2. Kiểm tra xem cấu hình giữa sản phẩm và nhóm tùy chọn đã tồn tại chưa
        const existing = await this.optionRepository.listProductOptionConfig(dto, { page: 1, limit: 1 });

        let id;
        if (existing) {
            const existConfig = existing.data.find(config => config.optionGroupId === data.optionGroupId);

            if (existConfig) {
                id = existConfig.id;
                // 3. Cập nhật cấu hình Option cho sản phẩm
                const updatedConfig = {
                    ...existConfig,
                    updatedAt: new Date(),
                }

                await this.optionRepository.updateProductOptionConfig(existConfig.id, updatedConfig);
            }   
        } else {
            // 4. Thêm mới cấu hình Option cho sản phẩm
            id = v7();
            const newConfig = {
                id: id,
                productId: data.productId,
                optionGroupId: data.optionGroupId,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            await this.optionRepository.insertProductOptionConfig(newConfig);
        }

        const result = await this.optionRepository.getProductOptionConfigById(id);
        
        await this.eventPublisher.publish(ProductOptionConfigSetEvent.create({
            productId: result?.productId || '',
            optionGroupId: result?.optionGroupId || '',
            changeType:  'SET'
        }, requester.sub))
        // 5. Trả về kết quả
        return result ;
    }  

    // xóa cấu hình Option của sản phẩm
    async removeProductOptionConfig(requester: Requester, id: string, ip: string, userAgent: string): Promise<void> {
        // 1. Kiểm tra xem cấu hình giữa sản phẩm và nhóm tùy chọn có tồn tại không
        const existing = await this.optionRepository.getProductOptionConfigById(id);

        if (!existing) {
            throw AppError.from(ErrOptionGroupNotFound, 404);
        }

        // 2. Xóa cấu hình Option của sản phẩm
        await this.optionRepository.deleteProductOptionConfig(id);

        await this.eventPublisher.publish(ProductOptionConfigRemovedEvent.create({
            productId: existing.productId,
            optionGroupId: existing.optionGroupId,
            changeType: 'REMOVED'
        }, requester.sub))
    }

    // lấy cấu hình Option của sản phẩm
    async getProductOptionConfigById(id: string): Promise<ProductOptionConfig | null> {
        const config = await this.optionRepository.getProductOptionConfigById(id);
        return config ? config : null;
    }

    // lấy danh sách cấu hình Option của sản phẩm theo điều kiện
    async listProductOptionConfig(cond: ProductOptionConfigCondDTO, paging: PagingDTO): Promise<Paginated<ProductOptionConfig>> {
        const result = await this.optionRepository.listProductOptionConfig(cond, paging);
        return result;
    }

    // lấy danh sách cấu hình Option của sản phẩm theo mảng product IDs
    async getProductOptionConfigsByIds(ids: string[]): Promise<ProductOptionConfig[]> {
        const result = await this.optionRepository.getProductOptionConfigsByIds(ids);
        return result;
    }
}