import { Paginated, PagingDTO, Requester } from "src/share";
import { Recipe } from "../models/recipe.model";
import type { RecipeCreateDTO, RecipeUpdateDTO, RecipeCondDTO } from "../dtos/recipe.dto";

// ============================
// Định nghĩa các interface cho Recipe
// ============================

// Định nghĩa các phương thức mà RecipeService phải triển khai
export interface IRecipeService {
    create(requester: Requester, dto: RecipeCreateDTO, ip: string, userAgent: string): Promise<Recipe> // Tạo công thức mới
    update(requester: Requester, recipeId: string, dto: RecipeUpdateDTO, ip: string, userAgent: string): Promise<Recipe> // Cập nhật thông tin công thức theo ID
    delete(requester: Requester, recipeId: string, ip: string, userAgent: string): Promise<void> // Xóa công thức theo ID

    get(recipeId: string): Promise<Recipe | null> // Lấy thông tin công thức theo ID  
    list(cond: RecipeCondDTO, pagingDTO: PagingDTO): Promise<Paginated<Recipe>> // Lấy danh sách công thức theo điều kiện
    listByIds(ids: string[], pagingDTO: PagingDTO): Promise<Paginated<Recipe>> // Lấy danh sách công thức theo nhiều ID
}

// Định nghĩa các phương thức mà RecipeRepository phải triển khai
export interface IRecipeRepository {
    get(recipeId: string): Promise<Recipe | null> // Lấy thông tin công thức theo ID  
    list(cond: RecipeCondDTO, paging: PagingDTO): Promise<Paginated<Recipe>> // Lấy danh sách công thức theo điều kiện
    listByIds(ids: string[], pagingDTO: PagingDTO): Promise<Paginated<Recipe>> // Lấy danh sách công thức theo nhiều ID  

    insert(dto: Recipe): Promise<void> // Tạo mới công thức
    update(recipeId: string, dto: RecipeUpdateDTO): Promise<void> // Cập nhật thông tin công thức theo ID
    delete(recipeId: string): Promise<void> // Xóa công thức theo ID
}