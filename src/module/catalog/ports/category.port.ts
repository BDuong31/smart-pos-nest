import { Paginated, PagingDTO, Requester} from 'src/share'
import { Category } from '../models/category.model'
import type { CategoryCreatedDTO, CategoryUpdateDTO, CategoryCondDTO} from '../dtos/category.dto'

// ============================
// Định nghĩa các interface cho Category
// ============================

// Định nghĩa các phương thức mà CategoryService phải triển khai
export interface ICategoryService {
    // Service tạo mới, cập nhật, xóa danh mục
    create(requester: Requester, dto: CategoryCreatedDTO, ip: string, userAgent: string): Promise<string>; // Tạo danh mục mới
    update(requester: Requester, id: string, dto: CategoryUpdateDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật thông tin danh mục
    delete(requester: Requester, id: string, ip: string, userAgent: string): Promise<void>; // Xóa danh mục theo ID

    // Service truy vấn danh mục
    get(id: string): Promise<Category | null>; // Lấy thông tin danh mục theo ID
    list(cond: CategoryCondDTO, paging: PagingDTO): Promise<Paginated<Category>>; // Lấy danh sách danh mục theo điều kiện
    listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Category>>; // Lấy danh sách danh mục theo nhiều ID
}

// Định nghĩa các phương thức mà CategoryRepository phải triển khai 
export interface ICategoryRepository {
    // truy vấn
    get(id: string): Promise<Category | null>; // Lấy thông tin danh mục theo ID
    list(cond: CategoryCondDTO, paging: PagingDTO): Promise<Paginated<Category>>; // Lấy danh sách danh mục theo điều kiện
    listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Category>>; // Lấy danh sách danh mục theo nhiều ID

    // thao tác dữ liệu
    insert(category: Category): Promise<void>; // Tạo mới danh mục
    update(id: string, dto: CategoryUpdateDTO): Promise<void>; // Cập nhật thông tin danh mục
    delete(id: string): Promise<void>; // Xóa danh mục theo ID
}