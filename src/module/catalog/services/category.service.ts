import { Inject, Injectable } from "@nestjs/common";
import {type ICategoryRepository, ICategoryService } from "../ports/category.port";
import { CATEGORY_REPOSITORY } from "../catalog.di-token";
import { ErrCategoryAlreadyExists, ErrCategoryNotFound, type Category } from "../models/category.model";
import { Requester } from "src/share/interface";
import { CategoryCondDTO, CategoryCreatedDTO, categoryCreatedDTOSchema, CategoryUpdateDTO, categoryUpdateDTOSchema } from "../dtos/category.dto";
import { v7 } from "uuid";
import { AppError, Paginated, PagingDTO } from "src/share";

// Lớp CategoryService cung cấp các phương thức để quản lý danh mục sản phẩm
@Injectable()
export class CategoryService implements ICategoryService {
    constructor(
        @Inject(CATEGORY_REPOSITORY) private readonly categoryRepo: ICategoryRepository,
    ){}

    // Tạo mới danh mục
    async create(requester: Requester, dto: CategoryCreatedDTO, ip: string, userAgent: string): Promise<string> {
        // Kiểm tra dữ liệu đầu vào
        const data = categoryCreatedDTOSchema.parse(dto);

        // Kiểm tra xem danh mục đã tồn tại chưa
        const existing = await this.categoryRepo.list({ name: data.name }, { page: 1, limit: 1 });

        if (existing.data.length > 0) {
            throw AppError.from(ErrCategoryAlreadyExists, 409);
        }

        // Tạo danh mục mới
        const newId = v7();
        const category: Category = {
            ...data,
            id: newId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.categoryRepo.insert(category);

        // Ghi log hành động tạo danh mục (MongoDB)
        // TODO: Ghi log hành động tạo danh mục với thông tin requester, ip, userAgent
        // Chưa triển khai phần này

        return newId;
    }

    // Cập nhật thông tin danh mục
    async update(requester: Requester, id: string, dto: CategoryUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = categoryUpdateDTOSchema.parse(dto);

        // Kiểm tra xem danh mục có tồn tại không
        const existing = await this.categoryRepo.get(id);

        if (!existing) {
            throw AppError.from(ErrCategoryNotFound, 404);
        }

        // Cập nhật thông tin danh mục
        await this.categoryRepo.update(id, data);

        // Ghi log hành động cập nhật danh mục (MongoDB)
    }

    // Xóa danh mục theo ID
    async delete(requester: Requester, id: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem danh mục có tồn tại không
        const existing = await this.categoryRepo.get(id);

        if (!existing) {
            throw AppError.from(ErrCategoryNotFound, 404);
        }

        // Xóa danh mục
        await this.categoryRepo.delete(id);

        // Ghi log hành động xóa danh mục (MongoDB)
    }

    // Lấy thông tin danh mục theo ID
    async get(id: string): Promise<Category | null> {
        const category = await this.categoryRepo.get(id);
        return category;
    }

    // Lấy danh sách danh mục theo điều kiện
    async list(cond: CategoryCondDTO, paging: PagingDTO): Promise<Paginated<Category>> {
        const data = await this.categoryRepo.list(cond, paging);
        return data;
    }

    // Lấy danh sách danh mục theo điều kiện
    async listByIds(ids: string[], paging: PagingDTO): Promise<Paginated<Category>> {
        const data = await this.categoryRepo.listByIds(ids, paging);
        return data;
    }   
}