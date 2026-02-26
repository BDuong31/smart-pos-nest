import { Paginated, PagingDTO, Requester } from 'src/share'
import { OptionGroup, OptionItem, ProductOptionConfig } from '../models/option.model'
import { CreateOptionGroupDTO, CreateProductOptionConfigDTO, OptionGroupCondDTO, UpdateProductOptionConfigDTO, UpdateOptionGroupDTO, UpdateOptionItemDTO, CreateOptionItemDTO, OptionItemCondDTO } from '../dtos/option.dto';

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
    getOptionGroupByIds(ids: string[], paging: PagingDTO): Promise<Paginated<OptionGroup>>; // Lấy danh sách Option Group theo mảng IDs

    // phương thức cho Option Item
    createOptionItem(requester: Requester, optionGroupId: string, dto: CreateOptionItemDTO, ip: string, userAgent: string): Promise<OptionItem | null>; // Tạo Option Item mới
    updateOptionItem(requester: Requester, optionGroupId: string, optionItemId: string, dto: UpdateOptionItemDTO, ip: string, userAgent: string): Promise<OptionItem | null>; // Cập nhật Option Item
    deleteOptionItem(requester: Requester, optionGroupId: string, optionItemId: string,  ip: string, userAgent: string): Promise<void>; // Xóa Option Item
    getOptionItemById(optionGroupId: string, optionItemId: string): Promise<OptionItem | null>; // Lấy thông tin Option Item theo ID
    getListOptionItem(cond: OptionItemCondDTO, paging: PagingDTO): Promise<Paginated<OptionItem>>; // Lấy danh sách Option Item theo điều kiện lọc
    getOptionItemsByIds(optionGroupId: string, ids: string[], paging: PagingDTO): Promise<Paginated<OptionItem>>; // Lấy danh sách Option Item theo mảng IDs

    // phương thức cho Product Option Config
    setProductOptionConfig(requester: Requester, productId: string, dto: CreateProductOptionConfigDTO, ip: string, userAgent: string): Promise<ProductOptionConfig | null>; // Thiết lập cấu hình Option cho sản phẩm
    getProductOptionConfig(productId: string): Promise<ProductOptionConfig[] | null>; // Lấy cấu hình Option của sản phẩm

}

// Định nghĩa kiểu dữ liệu cho Option Repository
export interface IOptionRepository {
    // truy vấn Option Group
    getOptionGroup(id: string): Promise<OptionGroup | null>; // Lấy Option Group theo ID
    getListOptionGroup(cond: OptionGroupCondDTO, paging: PagingDTO): Promise<Paginated<OptionGroup>>; // Lấy danh sách Option Group theo điều kiện
    getOptionGroupByIds(ids: string[], paging: PagingDTO): Promise<Paginated<OptionGroup>>; // Lấy danh sách Option Group theo mảng IDs
    
    // truy vấn Option Item
    getOptionItem(optionGroupId: string, optionItemId: string): Promise<OptionItem | null>; // Lấy Option Item theo ID
    getListOptionItem(cond: OptionItemCondDTO, paging: PagingDTO): Promise<Paginated<OptionItem>>; // Lấy danh sách Option Item theo điều kiện
    getOptionItemsByIds(optionGroupId: string, ids: string[], paging: PagingDTO): Promise<Paginated<OptionItem>>; // Lấy danh sách Option Item theo mảng IDs
    
    // truy vấn Product Option Config
    getProductOptionConfig(productId: string): Promise<ProductOptionConfig[] | null>; // Lấy cấu hình Option của sản phẩm
    getOptionsConfigByProductIds(productIds: string[], paging: PagingDTO): Promise<Paginated<ProductOptionConfig>>; // Lấy danh sách cấu hình Option của sản phẩm theo mảng product IDs

    // yêu cầu Option Group
    insertOptionGroup(optionGroup: OptionGroup): Promise<void>; // Thêm Option Group mới
    updateOptionGroup(id: string, dto: UpdateOptionGroupDTO): Promise<void>; // Cập nhật thông tin Option Group
    deleteOptionGroup(id: string): Promise<void>; // Xóa Option Group theo ID

    // yêu cầu Option Item
    insertOptionItem(optionItem: OptionItem): Promise<void>; // Thêm Option Item mới
    updateOptionItem(optionGroupId: string, optionItemId: string, dto: UpdateOptionItemDTO): Promise<void>; // Cập nhật thông tin Option Item
    deleteOptionItem(optionGroupId: string, optionItemId: string): Promise<void>; // Xóa Option Item theo ID
    
    // yêu cầu Product Option Config
    insertProductOptionConfig(config: ProductOptionConfig): Promise<void>; // Thêm cấu hình Option cho sản phẩm
    updateProductOptionConfig(productId: string, optionGroupId: string, dto: UpdateProductOptionConfigDTO): Promise<void>; // Cập nhật cấu hình Option cho sản phẩm
    deleteProductOptionConfig(productId: string, optionGroupId: string): Promise<void>; // Xóa cấu hình Option của sản phẩm
}