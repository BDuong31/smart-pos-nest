import { Inject, Injectable } from "@nestjs/common";
import type { IProductRepository, IProductService } from "../ports/product.port";
import { PRODUCT_REPOSITORY } from "../catalog.di-token";
import { AppError, EVENT_PUBLISHER,type IEventPublisher, Paginated, PagingDTO, Requester } from "src/share";
import { ComboCreateDTO, ProductCondDTO, ProductCreatedDTO, productCreatedDTOSchema, ProductUpdateDTO, productUpdateDTOSchema, VariantCondDTO, VariantDTO, variantDTOSchema, VariantUpdateDTO, variantUpdateDTOSchema, comboCreateDTOSchema, ComboUpdateDTO, comboUpdateDTOSchema, ComboCondDTO, ComboItemCreateDTO, comboItemCreateDTOSchema, comboItemUpdateDTOSchema, ComboItemUpdateDTO, ComboItemCondDTO } from "../dtos/product.dto";
import { Combo, ComboItem, ErrProductAlreadyExists, ErrProductNotFound, Product, Variant } from "../models/product.model";
import { v7 } from "uuid";
import { create } from "axios";
import { ProductComboCreatedEvent, ProductComboDeletedEvent, ProductComboItemCreatedEvent, ProductComboItemDeletedEvent, ProductComboItemUpdatedEvent, ProductComboUpdatedEvent, ProductCreatedEvent, ProductDeletedEvent, ProductUpdatedEvent, ProductVariantCreatedEvent, ProductVariantDeletedEvent, ProductVariantUpdatedEvent } from "src/share/event/product.evt";

// Lớp ProductService chịu trách nhiệm quản lý các sản phẩm trong hệ thống.
@Injectable()
export class ProductService implements IProductService {
    constructor(
        @Inject(PRODUCT_REPOSITORY) private readonly productRepository: IProductRepository,
        @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
    ){}

    // ============================
    // Phương thức cho sản phẩm
    // ============================

    // Tạo sản phẩm mới
    async createProduct(requester: Requester, dto: ProductCreatedDTO, ip: string, userAgent: string): Promise<string> {
        // validate dữ liệu đầu vào
        const data = productCreatedDTOSchema.parse(dto);

        // Kiểm tra xem sản phẩm tồn tại chưa (theo tên sản phẩm)
        const existingProducts = await this.productRepository.list({ name: data.name }, { page: 1, limit: 1 });

        if (existingProducts.data.length > 0) {
            throw AppError.from(ErrProductAlreadyExists, 409);
        }
        
        // Tạo mới sản phẩm
        const id = v7();
        const newProduct = {
            id,
            name: data.name,
            categoryId: data.categoryId,
            printerId: data.printerId,
            basePrice: data.basePrice,
            isActive: data.isActive,
            isCombo: data.isCombo,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.productRepository.insert(newProduct);

        await this.eventPublisher.publish(ProductCreatedEvent.create({
            productId: id,
            name: data.name,
            changeType: 'CREATED'
        }, requester.sub))
        // Ghi log tạo sản phẩm (có thể sử dụng một service riêng để quản lý log)
        
        return id;
    }

    // Cập nhật sản phẩm
    async updateProduct(requester: Requester, productId: string, dto: ProductUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // validate dữ liệu đầu vào
        const data = productUpdateDTOSchema.parse(dto);

        // Kiểm tra xem sản phẩm tồn tại chưa
        const existingProduct = await this.productRepository.get(productId);

        if (!existingProduct) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        // Cập nhật sản phẩm
        await this.productRepository.update(productId, data);

        await this.eventPublisher.publish(ProductUpdatedEvent.create({
            productId: existingProduct.id,
            name: existingProduct.name,
            changeType: 'UPDATED'
        }, requester.sub))
        // Ghi log cập nhật sản phẩm (có thể sử dụng một service riêng để quản lý log)
    }

    // Xóa sản phẩm
    async deleteProduct(requester: Requester, productId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem sản phẩm tồn tại chưa
        const existingProduct = await this.productRepository.get(productId);

        if (!existingProduct) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        // Xóa sản phẩm
        await this.productRepository.delete(productId);

        await this.eventPublisher.publish(ProductDeletedEvent.create({
            productId: existingProduct.id,
            name: existingProduct.name,
            changeType: 'DELETED'
        }, requester.sub))
        // Ghi log xóa sản phẩm (có thể sử dụng một service riêng để quản lý log)
    }

    // Lấy thông tin sản phẩm theo ID
    async getProductById(productId: string): Promise<Product | null> {
        return await this.productRepository.get(productId);
    }

    // Lấy danh sách sản phẩm theo điều kiện lọc
    async getListProduct(cond: ProductCondDTO, paging: PagingDTO): Promise<Paginated<Product>> {
        const data = await this.productRepository.list(cond, paging);
        return data;
    }

    // Lấy danh sách sản phẩm theo mảng IDs
    async getProductByIds(ids: string[]): Promise<Product[]> {
        const data = await this.productRepository.listByIds(ids);
        return data;
    }

    // Tìm kiếm sản phẩm theo từ khóa
    async getProductBySearch(keyword: string, paging: PagingDTO): Promise<Paginated<Product>> {
        const data = await this.productRepository.searchByKeyword(keyword, paging);
        return data;
    }

    // ============================
    // Phương thức cho biến thể sản phẩm
    // ============================

    // Tạo biến thể sản phẩm mới
    async createVariant(requester: Requester, productId: string, dto: VariantDTO, ip: string, userAgent: string): Promise<string> {
        // validate dữ liệu đầu vào
        const data = variantDTOSchema.parse(dto);


        // Kiểm tra xem sản phẩm chính tồn tại chưa
        const existingProduct = await this.productRepository.get(dto.productId);

        if (!existingProduct) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        // Kiểm tra xem biến thể đã tồn tại chưa (theo tên biến thể)
        const existingVariants = await this.productRepository.listVariant({ productId, name: data.name }, { page: 1, limit: 1 });

        if (existingVariants.data.length > 0) {
            throw AppError.from(ErrProductAlreadyExists, 409);
        }

        // Tạo mới biến thể sản phẩm
        const id = v7();
        const newVariant = {
            id,
            productId: data.productId,
            name: data.name,
            priceDiff: data.priceDiff,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.productRepository.insertVariant(newVariant);

        await this.eventPublisher.publish(ProductVariantCreatedEvent.create({
            productId: data.productId,
            variantId: id,
            name: data.name,
            priceDiff: data.priceDiff,
            changeType: 'CREATED'
        }, requester.sub))
        // Ghi log tạo biến thể sản phẩm (có thể sử dụng một service riêng để quản lý log)
        
        return id;
    }

    // Tạo nhiều biến thể sản phẩm cùng lúc
    async createVariants(requester: Requester, productId: string, dtos: VariantDTO[], ip: string, userAgent: string): Promise<string[]> {
        // Kiểm tra dữ liệu đầu vào
        const data = dtos.map(dto => variantDTOSchema.parse(dto));
        
        // Kiểm tra xem sản phẩm chính tồn tại chưa
        const existingProduct = await this.productRepository.get(productId);
        if (!existingProduct) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        // Kiểm tra xem có biến thể nào bị trùng tên không
        const Variant = await this.productRepository.listVariant({ productId }, { page: 1, limit: 1000 }); // Giả sử không có sản phẩm nào có hơn 1000 biến thể
        const existingVariantNames = new Set(Variant.data.map(v => v.name));
        for (const dto of data) {
            if (existingVariantNames.has(dto.name)) {
                throw AppError.from(ErrProductAlreadyExists, 409);
            }
        }

        // Tạo mới các biến thể sản phẩm
        const ids = data.map(dto => v7());
        const newVariants = data.map((dto, index) => ({
            id: ids[index],
            productId,
            name: dto.name,
            priceDiff: dto.priceDiff,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await this.productRepository.insertVariants(newVariants);

        await Promise.all(
            data.map(async (dto, index) => {
                await this.eventPublisher.publish(ProductVariantCreatedEvent.create({
                    productId: dto.productId, // Đổi 'data' thành 'dto'
                    variantId: ids[index],        // Giả sử id lấy từ dto
                    name: dto.name,           // Đổi 'data' thành 'dto'
                    priceDiff: dto.priceDiff, // Đổi 'data' thành 'dto'
                    changeType: 'CREATED'
                }, requester.sub));
            })
        );
        // Ghi log tạo biến thể sản phẩm (có thể sử dụng một service riêng để quản lý log)
        
        return ids;
    }

    // Cập nhật biến thể sản phẩm
    async updateVariant(requester: Requester, productId: string, variantId: string, dto: VariantUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // validate dữ liệu đầu vào
        const data = variantUpdateDTOSchema.parse(dto);

        // Kiểm tra xem sản phẩm chính tồn tại chưa
        const existingProduct = await this.productRepository.get(productId);
        if (!existingProduct) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        // Kiểm tra xem biến thể cần cập nhật có tồn tại không
        const existingVariant = await this.productRepository.getVariant(variantId);
        if (!existingVariant || existingVariant.productId !== productId) {
            throw AppError.from(ErrProductNotFound, 404);
        }   

        // Cập nhật biến thể sản phẩm
        await this.productRepository.updateVariant(variantId, data);

        await this.eventPublisher.publish(ProductVariantUpdatedEvent.create({
            productId: existingVariant.productId,
            variantId: existingVariant.id,
            name: existingVariant.name,
            priceDiff: existingVariant.priceDiff,
            changeType: 'UPDATED'
        }, requester.sub))
        // Ghi log cập nhật biến thể sản phẩm (có thể sử dụng một service riêng để quản lý log)
    }

    // Xóa biến thể sản phẩm
    async deleteVariant(requester: Requester, productId: string, variantId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem sản phẩm chính tồn tại chưa
        const existingProduct = await this.productRepository.get(productId);
        if (!existingProduct) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        // Kiểm tra xem biến thể cần xóa có tồn tại không
        const existingVariant = await this.productRepository.getVariant(variantId);
        if (!existingVariant || existingVariant.productId !== productId) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        // Xóa biến thể sản phẩm
        await this.productRepository.deleteVariant(variantId);

        await this.eventPublisher.publish(ProductVariantDeletedEvent.create({
            productId: existingVariant.productId,
            variantId: existingVariant.id,
            name: existingVariant.name,
            priceDiff: existingVariant.priceDiff,
            changeType: 'DELETED'
        }, requester.sub))
        // Ghi log xóa biến thể sản phẩm (có thể sử dụng một service riêng để quản lý log)
    }

    // Lấy thông tin biến thể sản phẩm theo ID
    async getVariantById(variantId: string): Promise<Variant | null> {
        return await this.productRepository.getVariant(variantId);
    }

    // Lấy danh sách biến thể sản phẩm theo điều kiện lọc
    async getListVariant(cond: VariantCondDTO, paging: PagingDTO): Promise<Paginated<Variant>> {
        const data = await this.productRepository.listVariant(cond, paging);
        return data;
    }

    // Lấy danh sách biến thể sản phẩm theo mảng IDs
    async getVariantByIds(ids: string[]): Promise<Variant[]> {
        const data = await this.productRepository.listVariantByIds(ids);
        return data;
    }

    // ============================
    // Phương thức cho combo sản phẩm
    // ============================

    // Tạo combo sản phẩm mới
    async createCombo(requester: Requester, dto: ComboCreateDTO, ip: string, userAgent: string): Promise<string> {
        // validate dữ liệu đầu vào
        const data = comboCreateDTOSchema.parse(dto);

        // Kiểm tra xem combo sản phẩm tồn tại chưa (theo tên combo sản phẩm)
        const existingCombos = await this.productRepository.listCombo({ name: data.name }, { page: 1, limit: 1 });

        if (existingCombos.data.length > 0) {
            throw AppError.from(ErrProductAlreadyExists, 409);
        }
        
        // Tạo mới combo sản phẩm
        const id = v7();
        const newCombo = {
            id,
            name: data.name,
            price: data.price,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.productRepository.insertCombo(newCombo);

        await this.eventPublisher.publish(ProductComboCreatedEvent.create({
            comboId: id,
            name: data.name,
            price: data.price,
            changeType: 'CREATED'
        }, requester.sub))
        // Ghi log tạo combo sản phẩm (có thể sử dụng một service riêng để quản lý log) 
        return id;
    }

    // Cập nhật combo sản phẩm
    async updateCombo(requester: Requester, comboId: string, dto: ComboUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // validate dữ liệu đầu vào
        const data = comboUpdateDTOSchema.parse(dto);

        // Kiểm tra xem combo sản phẩm tồn tại chưa
        const existingCombo = await this.productRepository.getCombo(comboId);

        if (!existingCombo) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        // Cập nhật combo sản phẩm
        await this.productRepository.updateCombo(comboId, data);

        await this.eventPublisher.publish(ProductComboUpdatedEvent.create({
            comboId: existingCombo.id,
            name: existingCombo.name,
            price: existingCombo.price,
            changeType: 'UPDATED'
        }, requester.sub))
        // Ghi log cập nhật combo sản phẩm (có thể sử dụng một service riêng để quản lý log)
    }

    // Xóa combo sản phẩm
    async deleteCombo(requester: Requester, comboId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem combo sản phẩm tồn tại chưa
        const existingCombo = await this.productRepository.getCombo(comboId);

        if (!existingCombo) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        // Xóa combo sản phẩm
        await this.productRepository.deleteCombo(comboId);

        await this.eventPublisher.publish(ProductComboDeletedEvent.create({
            comboId: existingCombo.id,
            name: existingCombo.name,
            price: existingCombo.price,
            changeType: 'DELETED'
        }, requester.sub))
        // Ghi log xóa combo sản phẩm (có thể sử dụng một service riêng để quản lý log)
    }

    // Lấy thông tin combo sản phẩm theo ID
    async getComboById(comboId: string): Promise<Combo | null> {
        return await this.productRepository.getCombo(comboId);
    }

    // Lấy danh sách combo sản phẩm theo điều kiện lọc
    async getListCombo(cond: ComboCondDTO, paging: PagingDTO): Promise<Paginated<Combo>> {
        const data = await this.productRepository.listCombo(cond, paging);
        return data;
    }

    // Lấy danh sách combo sản phẩm theo mảng IDs
    async getComboByIds(ids: string[]): Promise<Combo[]> {
        const data = await this.productRepository.listComboByIds(ids);
        return data;
    }

    // ============================
    // Phương thức cho mục combo sản phẩm
    // ============================

    // Tạo mục combo sản phẩm mới
    async createComboItem(requester: Requester, dto: ComboItemCreateDTO, ip: string, userAgent: string): Promise<string> { 
        // validate dữ liệu đầu vào
        const data = comboItemCreateDTOSchema.parse(dto);

        // Kiểm tra xem combo sản phẩm chính tồn tại chưa
        const existingCombo = await this.productRepository.getCombo(data.comboId);   

        if (!existingCombo) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        // Kiểm tra xem sản phẩm trong mục combo có tồn tại không
        const existingProduct = await this.productRepository.get(data.productId);
        if (!existingProduct) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        // Tạo mới mục combo sản phẩm
        const id = v7();
        const newComboItem = {
            id,
            comboId: data.comboId,
            productId: data.productId,
            variantId: data.variantId,
            quantity: data.quantity,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.productRepository.insertComboItem(newComboItem);

        await this.eventPublisher.publish(ProductComboItemCreatedEvent.create({
            comboItemId: id,
            comboId: data.comboId,
            productId: data.productId,
            quantity: data.quantity,
            changeType: 'CREATED'
        }, requester.sub))
        // Ghi log tạo mục combo sản phẩm (có thể sử dụng một service riêng để quản lý log) 
        return id;
    }

    // Cập nhật mục combo sản phẩm
    async updateComboItem(requester: Requester, id: string, dto: ComboItemUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // validate dữ liệu đầu vào
        const data = comboItemUpdateDTOSchema.parse(dto);

        // Kiểm tra xem mục combo sản phẩm cần cập nhật có tồn tại không
        const existingComboItem = await this.productRepository.getComboItem(id);
        if (!existingComboItem) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        // Cập nhật mục combo sản phẩm
        await this.productRepository.updateComboItem(id, data);

        await this.eventPublisher.publish(ProductComboItemUpdatedEvent.create({
            comboItemId: existingComboItem.id,
            comboId: existingComboItem.comboId,
            productId: existingComboItem.productId,
            quantity: existingComboItem.quantity,
            changeType: 'UPDATED'
        }, requester.sub))
        // Ghi log cập nhật mục combo sản phẩm (có thể sử dụng một service riêng để quản lý log)
    }

    // Xóa mục combo sản phẩm
    async deleteComboItem(requester: Requester, id: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem combo sản phẩm chính tồn tại chưa
        const existingComboItem = await this.productRepository.getComboItem(id);

        if (!existingComboItem) {
            throw AppError.from(ErrProductNotFound, 404);
        }

         // Xóa mục combo sản phẩm
         await this.productRepository.deleteComboItem(id);

         await this.eventPublisher.publish(ProductComboItemDeletedEvent.create({
            comboItemId: existingComboItem.id,
            comboId: existingComboItem.comboId,
            productId: existingComboItem.productId,
            quantity: existingComboItem.quantity,
            changeType: 'UPDATED'
        }, requester.sub))
        // Ghi log xóa mục combo sản phẩm (có thể sử dụng một service riêng để quản lý log)
    }

    // Lấy thông tin mục combo sản phẩm theo ID
    async getComboItemById( id: string): Promise<ComboItem | null> {
        return await this.productRepository.getComboItem(id);
    }

    // Lấy danh sách mục combo sản phẩm theo điều kiện lọc
    async getListComboItem(cond: ComboItemCondDTO, paging: PagingDTO): Promise<Paginated<ComboItem>> {
        const data = await this.productRepository.listComboItem(cond, paging);
        return data;
     }

    // Lấy danh sách mục combo sản phẩm theo mảng IDs
    async getComboItemsByIds(ids: string[]): Promise<ComboItem[]> {
        const data = await this.productRepository.listComboItemsByIds(ids);
        return data;
     }
}