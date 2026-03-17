import { Paginated, PagingDTO, Requester } from 'src/share'
import { Product, Variant, Combo, ComboItem } from '../models/product.model'
import type { ProductCondDTO, ProductCreatedDTO, ProductUpdateDTO, VariantCondDTO, VariantDTO, VariantUpdateDTO, ComboCreateDTO, ComboUpdateDTO, ComboCondDTO, ComboItemCreateDTO, ComboItemUpdateDTO, ComboItemCondDTO} from '../dtos/product.dto'
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
    getProductByIds(ids: string[]): Promise<Product[]>; // Lấy danh sách sản phẩm theo mảng IDs
    getProductBySearch(keyword: string, paging: PagingDTO): Promise<Paginated<Product>>; // Tìm kiếm sản phẩm theo từ khóa

    // phương thức cho biến thể sản phẩm
    createVariant(requester: Requester, productId: string, dto: VariantDTO, ip: string, userAgent: string): Promise<string>; // Tạo biến thể sản phẩm mới
    createVariants(requester: Requester, productId: string, dtos: VariantDTO[], ip: string, userAgent: string): Promise<string[]>; // Tạo nhiều biến thể sản phẩm cùng lúc
    updateVariant(requester: Requester, productId: string, variantId: string, dto: VariantUpdateDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật biến thể sản phẩm
    deleteVariant(requester: Requester, productId: string, variantId: string, ip: string, userAgent: string): Promise<void>; // Xóa biến thể sản phẩm
    getVariantById(variantId: string): Promise<Variant | null>; // Lấy thông tin biến thể sản phẩm theo ID
    getListVariant(cond: VariantCondDTO, paging: PagingDTO): Promise<Paginated<Variant>>; // Lấy danh sách biến thể sản phẩm theo điều kiện lọc
    getVariantByIds(ids: string[]): Promise<Variant[]>; // Lấy danh sách biến thể sản phẩm theo mảng IDs

    // phương thức cho combo sản phẩm
    createCombo(requester: Requester, dto: ComboCreateDTO, ip: string, userAgent: string): Promise<string>; // Tạo combo sản phẩm mới
    updateCombo(requester: Requester, comboId: string, dto: ComboUpdateDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật combo sản phẩm
    deleteCombo(requester: Requester, comboId: string, ip: string, userAgent: string): Promise<void>; // Xóa combo sản phẩm
    getComboById(comboId: string): Promise<Combo | null>; // Lấy thông tin combo sản phẩm theo ID
    getListCombo(cond: ComboCondDTO, paging: PagingDTO): Promise<Paginated<Combo>>; // Lấy danh sách combo sản phẩm theo điều kiện lọc
    getComboByIds(ids: string[]): Promise<Combo[]>; // Lấy danh sách combo sản phẩm theo mảng IDs

    // phương thức cho mục combo sản phẩm
    createComboItem(requester: Requester, dto: ComboItemCreateDTO, ip: string, userAgent: string): Promise<string>; // Tạo mục combo sản phẩm mới
    updateComboItem(requester: Requester, id: string, dto: ComboItemUpdateDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật mục combo sản phẩm
    deleteComboItem(requester: Requester, id: string, ip: string, userAgent: string): Promise<void>; // Xóa mục combo sản phẩm
    getComboItemById(id: string): Promise<ComboItem | null>; // Lấy thông tin mục combo sản phẩm theo ID
    getListComboItem(cond: ComboItemCondDTO, paging: PagingDTO): Promise<Paginated<ComboItem>>; // Lấy danh sách mục combo sản phẩm theo điều kiện lọc
    getComboItemsByIds(ids: string[]): Promise<ComboItem[]>; // Lấy danh sách mục combo sản phẩm theo mảng IDs
}

// Định nghĩa kiểu dữ liệu cho Product Repository
export interface IProductRepository {
    // truy vấn
    get(id: string): Promise<Product | null>; // Lấy sản phẩm theo ID
    list(cond: ProductCondDTO, paging: PagingDTO): Promise<Paginated<Product>>; // Lấy danh sách sản phẩm theo điều kiện lọc
    listByIds(ids: string[]): Promise<Product[]>; // Lấy danh sách sản phẩm theo mảng IDs
    searchByKeyword(keyword: string, paging: PagingDTO): Promise<Paginated<Product>>; // Tìm kiếm sản phẩm theo từ khóa

    // yêu cầu
    insert(product: Product): Promise<void>; // Thêm sản phẩm mới
    update(id: string, dto: ProductUpdateDTO): Promise<void>; // Cập nhật thông tin sản phẩm
    delete(id: string): Promise<void>; // Xóa sản phẩm theo ID

    // truy vấn biến thể sản phẩm
    getVariant(id: string): Promise<Variant | null>; // Lấy biến thể sản phẩm theo ID
    listVariant(cond: VariantCondDTO, paging: PagingDTO): Promise<Paginated<Variant>>; // Lấy danh sách biến thể sản phẩm theo điều kiện lọc
    listVariantByIds(ids: string[]): Promise<Variant[]>; // Lấy danh sách biến thể sản phẩm theo mảng IDs

    // yêu cầu biến thể sản phẩm
    insertVariant(variant: Variant): Promise<void>; // Thêm biến thể sản phẩm mới
    insertVariants(variants: Variant[]): Promise<void>; // Thêm nhiều biến thể sản phẩm cùng lúc
    updateVariant(id: string, dto: VariantUpdateDTO): Promise<void>; // Cập nhật thông tin biến thể sản phẩm
    deleteVariant(id: string): Promise<void>; // Xóa biến thể sản phẩm theo ID

    // truy vấn combo sản phẩm
    getCombo(id: string): Promise<Combo | null>; // Lấy combo sản phẩm theo ID
    listCombo(cond: ComboCondDTO, paging: PagingDTO): Promise<Paginated<Combo>>; // Lấy danh sách combo sản phẩm theo điều kiện lọc
    listComboByIds(ids: string[]): Promise<Combo[]>; // Lấy danh sách combo sản phẩm theo mảng IDs  

    // yêu cầu combo sản phẩm
    insertCombo(combo: Combo): Promise<void>; // Thêm combo sản phẩm mới
    updateCombo(id: string, dto: ComboUpdateDTO): Promise<void>; // Cập nhật thông tin combo sản phẩm
    deleteCombo(id: string): Promise<void>; // Xóa combo sản phẩm theo ID

    // truy vấn mục combo sản phẩm
    getComboItem(id: string): Promise<ComboItem | null>; // Lấy mục combo sản phẩm theo ID
    listComboItem(cond: ComboItemCondDTO, paging: PagingDTO): Promise<Paginated<ComboItem>>; // Lấy danh sách mục combo sản phẩm theo điều kiện lọc
    listComboItemsByIds(ids: string[]): Promise<ComboItem[]>; // Lấy danh sách mục combo sản phẩm theo mảng IDs

    // yêu cầu mục combo sản phẩm
    insertComboItem(item: ComboItem): Promise<void>; // Thêm mục combo sản phẩm mới
    updateComboItem(id: string, dto: ComboItemUpdateDTO): Promise<void>; // Cập nhật thông tin mục combo sản phẩm
    deleteComboItem(id: string): Promise<void>; // Xóa mục combo sản phẩm theo ID
}