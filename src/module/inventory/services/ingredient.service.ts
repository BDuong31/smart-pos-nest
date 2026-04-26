import { Inject, Injectable } from "@nestjs/common";
import { type IIngredientRepository, IIngredientService } from "../ports/ingredient.port";
import { INGREDIENT_REPOSITORY } from "../inventory.di-token";
import { ErrIngredientAlreadyExists, ErrIngredientNotFound, Ingredient } from "../models/ingredient.model";
import { type IEventPublisher, Requester } from "src/share/interface";
import { IngredientCondDTO, IngredientCreateDTO, ingredientCreateDTOSchema, IngredientUpdateDTO, ingredientUpdateDTOSchema } from "../dtos/ingredient.dto";
import { v7 } from "uuid";
import { AppError, EVENT_PUBLISHER, Paginated, PagingDTO } from "src/share";
import { IngredientCreatedEvent, IngredientDeletedEvent, IngredientUpdatedEvent } from "src/share/event/ingredient.evt";

// Lớp IngredientService cung cấp các phương thức để quản lý nguyên liệu
@Injectable()
export class IngredientService implements IIngredientService {
    constructor(
        @Inject(INGREDIENT_REPOSITORY) private readonly ingredientRepo: IIngredientRepository,
        @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
    ){}

    // Tạo mới nguyên liệu
    async create(requester: Requester, dto: IngredientCreateDTO, ip: string, userAgent: string): Promise<Ingredient> {
        // Kiểm tra dữ liệu đầu vào
        const data = ingredientCreateDTOSchema.parse(dto);

        // Kiểm tra xem nguyên liệu đã tồn tại chưa
        const existing = await this.ingredientRepo.list({ name: data.name }, { page: 1, limit: 1 });
        
        if (existing.total > 0) {
            throw AppError.from(ErrIngredientAlreadyExists, 409);
        }
        
        // Tạo nguyên liệu mới
        const newId = v7();
        const ingredient = {
            id: newId,
            name: data.name,
            baseUnit: data.baseUnit,
            minStock: data.minStock,
            forecastDataId: data.forecastDataId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };  

        await this.ingredientRepo.insert(ingredient);

        await this.eventPublisher.publish(IngredientCreatedEvent.create({
            ingredientId: newId,
            name: data.name,
            baseUnit: data.baseUnit,
            minStock: data.minStock,
            forecastDataId: data.forecastDataId,
            changeType: 'CREATED',
        }, requester.sub));

        return ingredient;
    }

    // Cập nhật thông tin nguyên liệu theo ID
    async update(requester: Requester, ingredientId: string, dto: IngredientUpdateDTO, ip: string, userAgent: string): Promise<Ingredient> {
        // Kiểm tra dữ liệu đầu vào
        const data = ingredientUpdateDTOSchema.parse(dto);

        // Cập nhật thông tin nguyên liệu
        await this.ingredientRepo.update(ingredientId, data);

        // Trả về thông tin nguyên liệu sau khi cập nhật
        const updatedIngredient = await this.ingredientRepo.get(ingredientId);
        if (!updatedIngredient) {
            throw AppError.from(ErrIngredientNotFound, 404);
        }

        await this.eventPublisher.publish(IngredientUpdatedEvent.create({
            ingredientId: ingredientId,
            name: data.name,
            baseUnit: data.baseUnit,
            minStock: data.minStock,
            forecastDataId: data.forecastDataId,
            changeType: 'UPDATED',
        }, requester.sub));

        return updatedIngredient;
    }
    
    // Xóa nguyên liệu theo ID
    async delete(requester: Requester, ingredientId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem nguyên liệu có tồn tại không
        const existing = await this.ingredientRepo.get(ingredientId);
        if (!existing) {
            throw AppError.from(ErrIngredientNotFound, 404);
        }

        // Xóa nguyên liệu
        await this.ingredientRepo.delete(ingredientId);

        await this.eventPublisher.publish(IngredientDeletedEvent.create({
            ingredientId: ingredientId,
            name: existing.name,
            baseUnit: existing.baseUnit,
            minStock: existing.minStock,
            forecastDataId: existing.forecastDataId,
            changeType: 'DELETED',
        }, requester.sub));
    }

    // Lấy thông tin nguyên liệu theo ID
    async get(ingredientId: string): Promise<Ingredient | null> {
        return await this.ingredientRepo.get(ingredientId);   
    }
    
    // Lấy danh sách nguyên liệu theo điều kiện
    async list(cond: IngredientCondDTO, paging: PagingDTO): Promise<Paginated<Ingredient>> {
        return await this.ingredientRepo.list(cond, paging);
    } 
    
    // Lấy danh sách nguyên liệu theo nhiều ID
    async listByIds(ingredientIds: string[]): Promise<Ingredient[]> {
        return await this.ingredientRepo.listByIds(ingredientIds);
    }
}