import { Paginated, PagingDTO } from "src/share";
import { Recipe } from "../models/recipe.model";
import { Recipe as PrismaRecipe } from "@prisma/client";
import type { RecipeCreateDTO, RecipeUpdateDTO, RecipeCondDTO } from "../dtos/recipe.dto";
import { IRecipeRepository } from "../ports/recipe.port";
import prisma from "src/share/components/prisma";

// Triển khai RecipePrismaRepo
export class RecipePrismaRepo implements IRecipeRepository {
    // Lấy thông tin công thức theo ID
    async get(recipeId: string): Promise<Recipe | null> {
        const result = await prisma.recipe.findFirst({ where: { id: recipeId } });

        if (!result) return null;

        return this._toModel(result);
    }

    // Lấy danh sách công thức theo điều kiện
    async list(cond: RecipeCondDTO, paging: PagingDTO): Promise<Paginated<Recipe>> {
        const { ingredientId, amount, productId, variantId, optionItemId, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (ingredientId) {
            where = {
                ...where,
                ingredientId: ingredientId,
            }
        }

        if (amount) {
            where = {
                ...where,
                amount: amount,
            }
        }

        if (productId) {
            where = {
                ...where,
                productId: productId,
            }
        }

        if (variantId) {
            where = {
                ...where,
                variantId: variantId,
            }
        }
        
        if (optionItemId) {
            where = {
                ...where,
                optionItemId: optionItemId,
            }
        }

        const total = await prisma.recipe.count({ where });
        
        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.recipe.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { createdAt: "desc" },
        });

        return {
            data: result.map(this._toModel),
            paging,
            total,
        }
    }

    // Lấy danh sách công thức theo nhiều ID
    async listByIds(recipeIds: string[]): Promise<Recipe[]> {
        const result = await prisma.recipe.findMany({ where: { id: { in: recipeIds } } });

        return result.map(this._toModel);
    }

    // Tạo mới công thức
    async insert(dto: Recipe): Promise<void> {
        await prisma.recipe.create({ data: dto });
    }

    // Cập nhật công thức
    async update(recipeId: string, dto: RecipeUpdateDTO): Promise<void> {
        await prisma.recipe.update({ where: { id: recipeId }, data: dto });
    }

    // Xóa công thức
    async delete(recipeId: string): Promise<void> {
        await prisma.recipe.delete({ where: { id: recipeId } });
    }

    // Chuyển đổi dữ liệu từ Prisma sang Model
    private _toModel(data: PrismaRecipe): Recipe {
        return { ...data } as Recipe;
    }
}