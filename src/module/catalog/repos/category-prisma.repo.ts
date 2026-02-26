import prisma from 'src/share/components/prisma'
import { Injectable } from '@nestjs/common';
import { Category } from '../models/category.model';
import type { CategoryCreatedDTO, CategoryUpdateDTO, CategoryCondDTO} from '../dtos/category.dto';
import type { ICategoryRepository } from '../ports/category.port';
import type { Category as CategoryPrisma } from '@prisma/client';
import { Paginated, PagingDTO } from 'src/share/data-model';

// Lớp CategoryPrismaRepo cung cấp phương thức truy vấn dữ liệu danh mục từ Prisma
@Injectable()
export class CategoryPrismaRepo implements ICategoryRepository {
    // Lấy danh mục theo ID
    async get(id: string): Promise<Category | null> {
        const data = await prisma.category.findFirst({ where: { id } });

        if (!data) return null;
        
        return this._toModel(data);
    }

    // Lấy danh sách danh mục
    async list(cond: CategoryCondDTO, paging: PagingDTO): Promise<Paginated<Category>> {
        const { name, parentId, ...rest} = cond;
        
        let where = {
            ...rest,
        }

        if (name) {
            where = {
                ...where,
                name: name,
            }
        }

        if (parentId) {
            where = {
                ...where,
                parentId: parentId,
            }
        }

        const total = await prisma.category.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.category.findMany({
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

    // Lấy danh sách danh mục theo nhiều ID
    async listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Category>> {
        const total = await prisma.category.count({ where: { id: { in: ids } } });  

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.category.findMany({
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

    // Tạo mới danh mục
    async insert(category: Category): Promise<void> {
        await prisma.category.create({ data: category });
    }

    // Cập nhật thông tin danh mục
    async update(id: string, dto: CategoryUpdateDTO): Promise<void> {
        await prisma.category.update({ where: { id }, data: dto });
    }

    // Xóa danh mục theo ID
    async delete(id: string): Promise<void> {
        await prisma.category.delete({ where: { id } });
    }

    // Chuyển đổi dữ liệu từ Prisma sang Model
    private _toModel(data: CategoryPrisma): Category {
        return {...data } as Category;
    }
}