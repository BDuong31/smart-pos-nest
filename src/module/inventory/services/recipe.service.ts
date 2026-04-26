import { Inject, Injectable } from "@nestjs/common";
import { type IRecipeRepository, IRecipeService } from "../ports/recipe.port";
import { RECIPE_REPOSITORY } from "../inventory.di-token";
import { ErrRecipeAlreadyExists, ErrRecipeNotFound, Recipe } from "../models/recipe.model";
import { type IEventPublisher, Requester } from "src/share/interface";
import { RecipeCondDTO, RecipeCreateDTO, recipeCreateDTOSchema, RecipeUpdateDTO, recipeUpdateDTOSchema } from "../dtos/recipe.dto";
import { v7 } from "uuid";
import { AppError, EVENT_PUBLISHER, Paginated, PagingDTO } from "src/share";
import { RecipeCreatedEvent, RecipeDeletedEvent, RecipeUpdatedEvent } from "src/share/event/recipe.evt";

// Lớp RecipeService cung cấp các phương thức để quản lý công thức
@Injectable()
export class RecipeService implements IRecipeService {
    constructor(
        @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: IRecipeRepository,
        @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher
    ){}

    // Tạo mới công thức
    async create(requester: Requester, dto: RecipeCreateDTO, ip: string, userAgent: string): Promise<Recipe> {
        // Kiểm tra dữ liệu đầu vào
        console.log("RecipeCreateDTO:", dto);
        const data = dto
        // const data = recipeCreateDTOSchema.parse(dto);
        console.log("Parsed RecipeCreateDTO:", data);
        let recipeExisting: Paginated<Recipe> | undefined;

        // Kiểm tra công thức của biến thể của sản phẩm
        if (!data.productId && data.variantId && !data.optionItemId) {
            recipeExisting = await this.recipeRepo.list({variantId: data.variantId, ingredientId: data.ingredientId }, { page: 1, limit: 100 });
        } 

        // Kiểm tra công thức của tùy chọn của sản phẩm
        if (!data.productId && !data.variantId && data.optionItemId) {
            recipeExisting = await this.recipeRepo.list({optionItemId: data.optionItemId, ingredientId: data.ingredientId }, { page: 1, limit: 100 });
        }

        // Kiểm tra công thức của sản phẩm
        if (data.productId && !data.variantId && !data.optionItemId) {
            recipeExisting = await this.recipeRepo.list({productId: data.productId, ingredientId: data.ingredientId }, { page: 1, limit: 100 });
        }

        if (recipeExisting && recipeExisting.total > 0) {
            throw AppError.from(ErrRecipeAlreadyExists, 409);
        }
        
        // Tạo công thức mới
        const newId = v7();
        const newRecipe: Recipe = {
            id: newId,
            ingredientId: data.ingredientId!,
            amount: data.amount!,
            productId: data.productId,
            variantId: data.variantId,
            optionItemId: data.optionItemId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.recipeRepo.insert(newRecipe);

        await this.eventPublisher.publish(RecipeCreatedEvent.create({
            recipeId: newId,
            ingredientId: data.ingredientId,
            amount: data.amount,
            productId: data.productId,
            variantId: data.variantId,
            optionItemId: data.optionItemId,
            changeType: 'CREATED'
        }, requester.sub))

        return newRecipe;
    } 
        
    // Cập nhật thông tin công thức theo ID
    async update(requester: Requester, recipeId: string, dto: RecipeUpdateDTO, ip: string, userAgent: string): Promise<Recipe> {
        // Kiểm tra dữ liệu đầu vào
        const data = recipeUpdateDTOSchema.parse(dto);  

        // Kiểm tra xem công thức có tồn tại không
        const existing = await this.recipeRepo.get(recipeId);
        if (!existing) {
            throw AppError.from(ErrRecipeNotFound, 404);
        }

        // Cập nhật thông tin công thức
        await this.recipeRepo.update(recipeId, data);   

        // Trả về thông tin công thức sau khi cập nhật
        const updatedRecipe = await this.recipeRepo.get(recipeId);
        if (!updatedRecipe) {
            throw AppError.from(ErrRecipeNotFound, 404);
        }

        await this.eventPublisher.publish(RecipeUpdatedEvent.create({
            recipeId: updatedRecipe.id,
            ingredientId: updatedRecipe.ingredientId,
            amount: updatedRecipe.amount,
            productId: updatedRecipe.productId,
            variantId: updatedRecipe.variantId,
            optionItemId: updatedRecipe.optionItemId,
            changeType: 'UPDATED'
        }, requester.sub))

        return updatedRecipe;
    }   

    // Xóa công thức theo ID
    async delete(requester: Requester, recipeId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem công thức có tồn tại không
        const existing = await this.recipeRepo.get(recipeId);
        if (!existing) {
            throw AppError.from(ErrRecipeNotFound, 404);
        }

        // Xóa công thức
        await this.recipeRepo.delete(recipeId);

        await this.eventPublisher.publish(RecipeDeletedEvent.create({
            recipeId: existing.id,
            ingredientId: existing.ingredientId,
            amount: existing.amount,
            productId: existing.productId,
            variantId: existing.variantId,
            optionItemId: existing.optionItemId,
            changeType: 'DELETED'
        }, requester.sub))
    }   

    // Lấy thông tin công thức theo ID
    async get(recipeId: string): Promise<Recipe | null> {
        return await this.recipeRepo.get(recipeId);   
    }

    // Lấy danh sách công thức theo điều kiện
    async list(cond: RecipeCondDTO, pagingDTO: PagingDTO): Promise<Paginated<Recipe>> { 
        return await this.recipeRepo.list(cond, pagingDTO);   
    }

    // Lấy danh sách công thức theo nhiều ID
    async listByIds(recipeIds: string[]): Promise<Recipe[]> {
        return await this.recipeRepo.listByIds(recipeIds);
    }
}