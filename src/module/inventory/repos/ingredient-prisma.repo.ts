import { Paginated, PagingDTO } from "src/share";
import { Ingredient } from "../models/ingredient.model";
import { Ingredient as PrismaIngredient } from "@prisma/client";
import type { IngredientCreateDTO, IngredientUpdateDTO, IngredientCondDTO } from "../dtos/ingredient.dto";
import { IIngredientRepository } from "../ports/ingredient.port";
import prisma from "src/share/components/prisma";

// Triển khai IngredientPrismaRepo
export class IngredientPrismaRepo implements IIngredientRepository {
    // Lấy thông tin nguyên liệu theo ID
    async get(ingredientId: string): Promise<Ingredient | null> {
        const result = await prisma.ingredient.findFirst({ where: { id: ingredientId } });

        if (!result) return null;

        return this._toModel(result);
    }

    // Lấy danh sách nguyên liệu theo điều kiện
    async list(cond: IngredientCondDTO, paging: PagingDTO): Promise<Paginated<Ingredient>> {
        const { name, baseUnit, minStock, forecastDataId, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (name) {
            where = {
                ...where,
                name: name,
            }
        }

        if (baseUnit) {
            where = {
                ...where,
                baseUnit: baseUnit,
            }
        }

        if (minStock) {
            where = {
                ...where,
                minStock: minStock,
            }
        }

        if (forecastDataId) {
            where = {
                ...where,
                forecastDataId: forecastDataId,
            }
        }

        const total = await prisma.ingredient.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.ingredient.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { name: 'asc' },
        });

        return {
            data: result.map(this._toModel),
            paging,
            total
        }
    }

    // Lấy danh sách nguyên liệu theo nhiều ID
    async listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Ingredient>> {
        const total = await prisma.ingredient.count({ where: { id: { in: ids } } });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.ingredient.findMany({
            where: { id: { in: ids } },
            skip,
            take: paging.limit,
            orderBy: { name: 'asc' },
        });

        return {
            data: result.map(this._toModel),
            paging,
            total
        }
    }

    // Tạo mới nguyên liệu
    async insert(ingredient: Ingredient): Promise<void> {
        await prisma.ingredient.create({ data: ingredient });
    }

    // Cập nhật thông tin nguyên liệu theo ID
    async update(ingredientId: string, ingredientUpdateDTO: IngredientUpdateDTO): Promise<void> {
        await prisma.ingredient.update({ where: { id: ingredientId }, data: ingredientUpdateDTO });
    }

    // Xóa nguyên liệu theo ID
    async delete(ingredientId: string): Promise<void> {
        await prisma.ingredient.delete({ where: { id: ingredientId } });
    }

    // Chuyển đổi dữ liệu từ PrismaIngredient sang Ingredient
    private _toModel(data: PrismaIngredient): Ingredient {
        return { ...data } as Ingredient;
    }
}