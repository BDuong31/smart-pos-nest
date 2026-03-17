import { Inject, Injectable } from "@nestjs/common";
import { type IStockCheckRepository, IStockCheckService } from "../ports/stockCheck.port";
import { STOCKCHECK_REPOSITORY } from "../inventory.di-token";
import { ErrStockCheckAlreadyExists, ErrStockCheckNotFound, StockCheck } from "../models/stockCheck.model";
import { Requester } from "src/share/interface";
import { StockCheckCondDTO, StockCheckCreateDTO, stockCheckCreateDTOSchema, StockCheckUpdateDTO, stockCheckUpdateDTOSchema } from "../dtos/stockCheck.dto";
import { v7 } from "uuid";
import { AppError, Paginated, PagingDTO } from "src/share";

// Lớp StockCheckService cung cấp các phương thức để quản lý kiểm kê tồn kho
@Injectable()
export class StockCheckService implements IStockCheckService {
    constructor(
        @Inject(STOCKCHECK_REPOSITORY) private readonly stockCheckRepo: IStockCheckRepository,
    ){}

    // Tạo mới kiểm kê tồn kho
    async create(requester: Requester, dto: StockCheckCreateDTO, ip: string, userAgent: string): Promise<StockCheck> {
        // Kiểm tra dữ liệu đầu vào
        const data = stockCheckCreateDTOSchema.parse(dto);

        // Kiểm tra xem kiểm kê tồn kho đã tồn tại chưa
        const existing = await this.stockCheckRepo.list({ code: data.code }, { page: 1, limit: 1 });
        
        if (existing.total > 0) {
            throw AppError.from(ErrStockCheckAlreadyExists, 409);
        }  

        // Tạo kiểm kê tồn kho mới
        const chekDate = new Date();
        const newId = v7();
        const stockCheck: StockCheck = {
            id: newId,
            code: data.code,
            userId: data.userId || "",
            note: data.note,
            checkDate: chekDate,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.stockCheckRepo.insert(stockCheck);

        return stockCheck;
    }

    // Cập nhật thông tin kiểm kê tồn kho theo ID
    async update(requester: Requester, stockCheckId: string, dto: StockCheckUpdateDTO, ip: string, userAgent: string): Promise<StockCheck> {    
        // Kiểm tra dữ liệu đầu vào
        const data = stockCheckUpdateDTOSchema.parse(dto);

        // Kiểm tra xem kiểm kê tồn kho có tồn tại không
        const existing = await this.stockCheckRepo.get(stockCheckId);
        if (!existing) {
            throw AppError.from(ErrStockCheckNotFound, 404);
        }   

        // Cập nhật thông tin kiểm kê tồn kho
        await this.stockCheckRepo.update(stockCheckId, data);

        // Trả về thông tin kiểm kê tồn kho sau khi cập nhật
        const updatedStockCheck = await this.stockCheckRepo.get(stockCheckId);
        if (!updatedStockCheck) {
            throw AppError.from(ErrStockCheckNotFound, 404);
        }

        return updatedStockCheck;
    }

    // Xóa kiểm kê tồn kho theo ID
    async delete(requester: Requester, stockCheckId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem kiểm kê tồn kho có tồn tại không
        const existing = await this.stockCheckRepo.get(stockCheckId);
        if (!existing) {
            throw AppError.from(ErrStockCheckNotFound, 404);
        }

        // Xóa kiểm kê tồn kho
        await this.stockCheckRepo.delete(stockCheckId);
    }

    // Lấy thông tin kiểm kê tồn kho theo ID
    async get(stockCheckId: string): Promise<StockCheck | null> {
        return await this.stockCheckRepo.get(stockCheckId);   
    }

    // Lấy danh sách kiểm kê tồn kho theo điều kiện
    async list(cond: StockCheckCondDTO, paging: PagingDTO): Promise<Paginated<StockCheck>> {
        return await this.stockCheckRepo.list(cond, paging);
    }

    // Lấy danh sách kiểm kê tồn kho theo nhiều ID
    async listByIds(stockCheckIds: string[]): Promise<StockCheck[]> {
        return await this.stockCheckRepo.listByIds(stockCheckIds);
    }
}