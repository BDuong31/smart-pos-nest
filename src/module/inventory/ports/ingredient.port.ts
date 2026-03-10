import { Paginated, PagingDTO, Requester } from "src/share";
import { Ingredient } from "../models/ingredient.model";
import type { IngredientCreateDTO, IngredientUpdateDTO, IngredientCondDTO } from "../dtos/ingredient.dto";

// ============================
// Định nghĩa các interface cho Ingredient
// ============================

// Định nghĩa các phương thức mà IngredientService phải triển khai  
export interface IIngredientService {
    create(requester: Requester, dto: IngredientCreateDTO, ip: string, userAgent: string): Promise<Ingredient> // Tạo nguyên liệu mới
    update(requester: Requester, ingredientId: string, dto: IngredientUpdateDTO, ip: string, userAgent: string): Promise<Ingredient> // Cập nhật thông tin nguyên liệu theo ID
    delete(requester: Requester, ingredientId: string, ip: string, userAgent: string): Promise<void> // Xóa nguyên liệu theo ID 

    get(ingredientId: string): Promise<Ingredient | null> // Lấy thông tin nguyên liệu theo ID  
    list(cond: IngredientCondDTO, pagingDTO: PagingDTO): Promise<Paginated<Ingredient>> // Lấy danh sách nguyên liệu theo điều kiện
    listByIds(ids: string[], pagingDTO: PagingDTO): Promise<Paginated<Ingredient>> // Lấy danh sách nguyên liệu theo nhiều ID
}

// Định nghĩa các phương thức mà IngredientRepository phải triển khai
export interface IIngredientRepository {
    get(ingredientId: string): Promise<Ingredient | null> // Lấy thông tin nguyên liệu theo ID  
    list(cond: IngredientCondDTO, paging: PagingDTO): Promise<Paginated<Ingredient>> // Lấy danh sách nguyên liệu theo điều kiện
    listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Ingredient>> // Lấy danh sách nguyên liệu theo nhiều ID  

    insert(dto: Ingredient): Promise<void> // Tạo mới nguyên liệu
    update(ingredientId: string, dto: IngredientUpdateDTO): Promise<void> // Cập nhật thông tin nguyên liệu theo ID
    delete(ingredientId: string): Promise<void> // Xóa nguyên liệu theo ID
}