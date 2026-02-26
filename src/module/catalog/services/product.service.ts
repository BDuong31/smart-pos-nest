import { Inject, Injectable } from "@nestjs/common";
import type { IProductRepository, IProductService } from "../ports/product.port";
import { PRODUCT_REPOSITORY } from "../catalog.di-token";
import { AppError, Paginated, PagingDTO, Requester } from "src/share";
import { ProductCondDTO, ProductCreatedDTO, productCreatedDTOSchema, ProductUpdateDTO, productUpdateDTOSchema, VariantCondDTO, VariantDTO, variantDTOSchema, VariantUpdateDTO, variantUpdateDTOSchema } from "../dtos/product.dto";
import { ErrProductAlreadyExists, ErrProductNotFound, Product, Variant } from "../models/product.model";
import { v7 } from "uuid";
import { create } from "axios";

// Lớp ProductService chịu trách nhiệm quản lý các sản phẩm trong hệ thống.
@Injectable()
export class ProductService implements IProductService {
    constructor(
        @Inject(PRODUCT_REPOSITORY) private readonly productRepository: IProductRepository,
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
    async getProductByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Product>> {
        const data = await this.productRepository.listByIds(ids, paging);
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
        const existingProduct = await this.productRepository.get(productId);

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
            productId,
            name: data.name,
            priceDiff: data.priceDiff,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.productRepository.insertVariant(newVariant);

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
    async getVariantByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Variant>> {
        const data = await this.productRepository.listVariantByIds(ids, paging);
        return data;
    }
}