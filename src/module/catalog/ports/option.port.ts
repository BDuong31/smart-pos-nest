import { Paginated, PagingDTO, Requester } from 'src/share'
import { OptionGroup, OptionItem, ProductOptionConfig } from '../models/option.model'
import { CreateOptionGroupDTO, CreateProductOptionConfigDTO, OptionGroupCondDTO, UpdateProductOptionConfigDTO, UpdateOptionGroupDTO, UpdateOptionItemDTO, CreateOptionItemDTO, OptionItemCondDTO, ProductOptionConfigCondDTO } from '../dtos/option.dto';

// ============================
// Định nghĩa các interface cho Option Service
// ============================

// Định nghĩa kiểu dữ liệu cho Option Service
export interface IOptionService {
    // phương thức cho Option Group
    createOptionGroup(requester: Requester, dto: CreateOptionGroupDTO, ip: string, userAgent: string): Promise<OptionGroup | null>; // Tạo Option Group mới
    updateOptionGroup(requester: Requester, optionGroupId: string, dto: UpdateOptionGroupDTO, ip: string, userAgent: string): Promise<OptionGroup | null>; // Cập nhật Option Group
    deleteOptionGroup(requester: Requester, optionGroupId: string, ip: string, userAgent: string): Promise<void>; // Xóa Option Group

    getOptionGroupById(optionGroupId: string): Promise<OptionGroup | null>; // Lấy thông tin Option Group theo ID
    getListOptionGroup(cond: OptionGroupCondDTO,  paging: PagingDTO):  Promise<Paginated<OptionGroup>>; // Lấy danh sách Option Group theo điều kiện lọc
    getOptionGroupByIds(ids: string[]): Promise<OptionGroup[]>; // Lấy danh sách Option Group theo mảng IDs

    // phương thức cho Option Item
    createOptionItem(requester: Requester, dto: CreateOptionItemDTO, ip: string, userAgent: string): Promise<OptionItem | null>; // Tạo Option Item mới
    updateOptionItem(requester: Requester, id: string, dto: UpdateOptionItemDTO, ip: string, userAgent: string): Promise<OptionItem | null>; // Cập nhật Option Item
    deleteOptionItem(requester: Requester, id: string,  ip: string, userAgent: string): Promise<void>; // Xóa Option Item
    getOptionItemById(id: string): Promise<OptionItem | null>; // Lấy thông tin Option Item theo ID
    getListOptionItem(cond: OptionItemCondDTO, paging: PagingDTO): Promise<Paginated<OptionItem>>; // Lấy danh sách Option Item theo điều kiện lọc
    getOptionItemsByIds(ids: string[]): Promise<OptionItem[]>; // Lấy danh sách Option Item theo mảng IDs

    // phương thức cho Product Option Config
    setProductOptionConfig(requester: Requester, dto: CreateProductOptionConfigDTO, ip: string, userAgent: string): Promise<ProductOptionConfig | null>; // Thiết lập cấu hình Option cho sản phẩm
    removeProductOptionConfig(requester: Requester, id: string, ip: string, userAgent: string): Promise<void>; // Xóa cấu hình Option của sản phẩm
    listProductOptionConfig(cond: ProductOptionConfigCondDTO, paging: PagingDTO): Promise<Paginated<ProductOptionConfig>>; // Lấy danh sách cấu hình Option của sản phẩm theo điều kiện lọc
    getProductOptionConfigById(id: string): Promise<ProductOptionConfig | null>; // Lấy cấu hình Option của sản phẩm
    getProductOptionConfigsByIds(ids: string[]): Promise<ProductOptionConfig[]>; // Lấy danh sách cấu hình Option của sản phẩm theo mảng product IDs
}

// Định nghĩa kiểu dữ liệu cho Option Repository
export interface IOptionRepository {
    // truy vấn Option Group
    getOptionGroup(id: string): Promise<OptionGroup | null>; // Lấy Option Group theo ID
    getListOptionGroup(cond: OptionGroupCondDTO, paging: PagingDTO): Promise<Paginated<OptionGroup>>; // Lấy danh sách Option Group theo điều kiện
    getOptionGroupByIds(ids: string[]): Promise<OptionGroup[]>; // Lấy danh sách Option Group theo mảng IDs

    // truy vấn Option Item
    getOptionItem(id: string): Promise<OptionItem | null>; // Lấy Option Item theo ID
    getListOptionItem(cond: OptionItemCondDTO, paging: PagingDTO): Promise<Paginated<OptionItem>>; // Lấy danh sách Option Item theo điều kiện
    getOptionItemsByIds(ids: string[]): Promise<OptionItem[]>; // Lấy danh sách Option Item theo mảng IDs

    // truy vấn Product Option Config
    listProductOptionConfig(cond: ProductOptionConfigCondDTO, paging: PagingDTO): Promise<Paginated<ProductOptionConfig>>; // Lấy danh sách cấu hình Option của sản phẩm theo điều kiện lọc
    getProductOptionConfigById(id: string): Promise<ProductOptionConfig | null>; // Lấy cấu hình Option của sản phẩm
    getProductOptionConfigsByIds(ids: string[]): Promise<ProductOptionConfig[]>; // Lấy danh sách cấu hình Option của sản phẩm theo mảng product IDs

    // yêu cầu Option Group
    insertOptionGroup(optionGroup: OptionGroup): Promise<void>; // Thêm Option Group mới
    updateOptionGroup(id: string, dto: UpdateOptionGroupDTO): Promise<void>; // Cập nhật thông tin Option Group
    deleteOptionGroup(id: string): Promise<void>; // Xóa Option Group theo ID

    // yêu cầu Option Item
    insertOptionItem(optionItem: OptionItem): Promise<void>; // Thêm Option Item mới
    updateOptionItem(id: string, dto: UpdateOptionItemDTO): Promise<void>; // Cập nhật thông tin Option Item
    deleteOptionItem(id: string): Promise<void>; // Xóa Option Item theo ID
    
    // yêu cầu Product Option Config
    insertProductOptionConfig(config: ProductOptionConfig): Promise<void>; // Thêm cấu hình Option cho sản phẩm
    updateProductOptionConfig(id: string, dto: UpdateProductOptionConfigDTO): Promise<void>; // Cập nhật cấu hình Option cho sản phẩm
    deleteProductOptionConfig(id: string): Promise<void>; // Xóa cấu hình Option của sản phẩm
}