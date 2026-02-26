import { Paginated, PagingDTO, Requester } from 'src/share'
import { Product, Variant } from '../models/product.model'
import type { ProductCondDTO, ProductCreatedDTO, ProductUpdateDTO, VariantCondDTO, VariantDTO, VariantUpdateDTO} from '../dtos/product.dto'
import { get } from 'axios';

// ============================
// Định nghĩa các interface cho Product Service
// ============================

// Định nghĩa kiểu dữ liệu sản phẩm
export interface IProductService {
    // phương thức cho sản phẩm
    createProduct(requester: Requester, dto: ProductCreatedDTO, ip: string, userAgent: string): Promise<string>; // Tạo sản phẩm mới
    updateProduct(requester: Requester, productId: string,  dto: ProductUpdateDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật sản phẩm
    deleteProduct(requester: Requester, productId: string, ip: string, userAgent: string): Promise<void>; // Xóa sản phẩm

    getProductById(productId: string): Promise<Product | null>; // Lấy thông tin sản phẩm theo ID
    getListProduct(cond: ProductCondDTO, paging: PagingDTO): Promise<Paginated<Product>>; // Lấy danh sách sản phẩm theo điều kiện lọc
    getProductByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Product>>; // Lấy danh sách sản phẩm theo mảng IDs
    getProductBySearch(keyword: string, paging: PagingDTO): Promise<Paginated<Product>>; // Tìm kiếm sản phẩm theo từ khóa

    // phương thức cho biến thể sản phẩm
    createVariant(requester: Requester, productId: string, dto: VariantDTO, ip: string, userAgent: string): Promise<string>; // Tạo biến thể sản phẩm mới
    createVariants(requester: Requester, productId: string, dtos: VariantDTO[], ip: string, userAgent: string): Promise<string[]>; // Tạo nhiều biến thể sản phẩm cùng lúc
    updateVariant(requester: Requester, productId: string, variantId: string, dto: VariantUpdateDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật biến thể sản phẩm
    deleteVariant(requester: Requester, productId: string, variantId: string, ip: string, userAgent: string): Promise<void>; // Xóa biến thể sản phẩm
    getVariantById(variantId: string): Promise<Variant | null>; // Lấy thông tin biến thể sản phẩm theo ID
    getListVariant(cond: VariantCondDTO, paging: PagingDTO): Promise<Paginated<Variant>>; // Lấy danh sách biến thể sản phẩm theo điều kiện lọc
    getVariantByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Variant>>; // Lấy danh sách biến thể sản phẩm theo mảng IDs
}

// Định nghĩa kiểu dữ liệu cho Product Repository
export interface IProductRepository {
    // truy vấn
    get(id: string): Promise<Product | null>; // Lấy sản phẩm theo ID
    list(cond: ProductCondDTO, paging: PagingDTO): Promise<Paginated<Product>>; // Lấy danh sách sản phẩm theo điều kiện lọc
    listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Product>>; // Lấy danh sách sản phẩm theo mảng IDs
    searchByKeyword(keyword: string, paging: PagingDTO): Promise<Paginated<Product>>; // Tìm kiếm sản phẩm theo từ khóa

    // yêu cầu
    insert(product: Product): Promise<void>; // Thêm sản phẩm mới
    update(id: string, dto: ProductUpdateDTO): Promise<void>; // Cập nhật thông tin sản phẩm
    delete(id: string): Promise<void>; // Xóa sản phẩm theo ID

    // truy vấn biến thể sản phẩm
    getVariant(id: string): Promise<Variant | null>; // Lấy biến thể sản phẩm theo ID
    listVariant(cond: VariantCondDTO, paging: PagingDTO): Promise<Paginated<Variant>>; // Lấy danh sách biến thể sản phẩm theo điều kiện lọc
    listVariantByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Variant>>; // Lấy danh sách biến thể sản phẩm theo mảng IDs

    // yêu cầu biến thể sản phẩm
    insertVariant(variant: Variant): Promise<void>; // Thêm biến thể sản phẩm mới
    insertVariants(variants: Variant[]): Promise<void>; // Thêm nhiều biến thể sản phẩm cùng lúc
    updateVariant(id: string, dto: VariantUpdateDTO): Promise<void>; // Cập nhật thông tin biến thể sản phẩm
    deleteVariant(id: string): Promise<void>; // Xóa biến thể sản phẩm theo ID
}