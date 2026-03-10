import { Inject, Injectable } from "@nestjs/common";
import { type IStockCheckDetailRepository, IStockCheckDetailService } from "../ports/stockCheckDetail.port";
import { STOCKCHECKDETAIL_REPOSITORY } from "../inventory.di-token";
import { ErrStockCheckDetailAlreadyExists, ErrStockCheckDetailNotFound, StockCheckDetail } from "../models/stockCheckDetail.model";
import { Requester } from "src/share/interface";
import { StockCheckDetailCondDTO, StockCheckDetailCreateDTO, stockCheckDetailCreateDTOSchema, StockCheckDetailUpdateDTO, stockCheckDetailUpdateDTOSchema } from "../dtos/stockCheckDetail.dto";
import { v7 } from "uuid";
import { AppError, Paginated, PagingDTO } from "src/share";

// Lớp StockCheckDetailService cung cấp các phương thức để quản lý chi tiết kiểm kê tồn kho
@Injectable()
export class StockCheckDetailService implements IStockCheckDetailService {
    constructor(
        @Inject(STOCKCHECKDETAIL_REPOSITORY) private readonly stockCheckDetailRepo: IStockCheckDetailRepository,
    ){}

    // Tạo mới chi tiết kiểm kê tồn kho
    async create(requester: Requester, dto: StockCheckDetailCreateDTO, ip: string, userAgent: string): Promise<StockCheckDetail> {
        // Kiểm tra dữ liệu đầu vào
        const data = stockCheckDetailCreateDTOSchema.parse(dto);

        // Kiểm tra xem chi tiết kiểm kê tồn kho đã tồn tại chưa
        const existing = await this.stockCheckDetailRepo.list({ checkId: data.checkId, ingredientId: data.ingredientId }, { page: 1, limit: 1 });
        if (existing.total > 0) {
            throw AppError.from(ErrStockCheckDetailAlreadyExists, 409);
        }

        // Tạo chi tiết kiểm kê tồn kho mới
        const newId = v7();
        const stockCheckDetail: StockCheckDetail = {
            id: newId,
            checkId: data.checkId,
            ingredientId: data.ingredientId,
            systemQty: data.systemQty,
            actualQty: data.actualQty,
            reason: data.reason,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.stockCheckDetailRepo.insert(stockCheckDetail);

        return stockCheckDetail;
    }

    // Cập nhật thông tin chi tiết kiểm kê tồn kho theo ID
    async update(requester: Requester, stockCheckDetailId: string, dto: StockCheckDetailUpdateDTO, ip: string, userAgent: string): Promise<StockCheckDetail> {    
        // Kiểm tra dữ liệu đầu vào
        const data = stockCheckDetailUpdateDTOSchema.parse(dto);    

        // Kiểm tra xem chi tiết kiểm kê tồn kho có tồn tại không
        const existing = await this.stockCheckDetailRepo.get(stockCheckDetailId);
        if (!existing) {
            throw AppError.from(ErrStockCheckDetailNotFound, 404);
        }

        // Cập nhật thông tin chi tiết kiểm kê tồn kho
        await this.stockCheckDetailRepo.update(stockCheckDetailId, data);

        // Trả về chi tiết kiểm kê tồn kho sau khi cập nhật
        const updated = await this.stockCheckDetailRepo.get(stockCheckDetailId);
        return updated!;
    }   

    // Xóa chi tiết kiểm kê tồn kho theo ID
    async delete(requester: Requester, stockCheckDetailId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem chi tiết kiểm kê tồn kho có tồn tại không
        const existing = await this.stockCheckDetailRepo.get(stockCheckDetailId);
        if (!existing) {
            throw AppError.from(ErrStockCheckDetailNotFound, 404);
        }

        // Xóa chi tiết kiểm kê tồn kho
        await this.stockCheckDetailRepo.delete(stockCheckDetailId);
    }

    // Lấy danh sách chi tiết kiểm kê tồn kho theo điều kiện
    async list(cond: StockCheckDetailCondDTO, paging: PagingDTO): Promise<Paginated<StockCheckDetail>> {
        return await this.stockCheckDetailRepo.list(cond, paging);
    }

    // Lấy thông tin chi tiết kiểm kê tồn kho theo ID
    async get(stockCheckDetailId: string): Promise<StockCheckDetail | null> {
        return await this.stockCheckDetailRepo.get(stockCheckDetailId);
    }

    // Lấy danh sách chi tiết kiểm kê tồn kho theo nhiều ID
    async listByIds(stockCheckDetailIds: string[], paging: PagingDTO): Promise<Paginated<StockCheckDetail>> {
        return await this.stockCheckDetailRepo.listByIds(stockCheckDetailIds, paging);
    }
}