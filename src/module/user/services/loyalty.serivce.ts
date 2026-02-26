import { Inject } from "@nestjs/common";
import { type ILoyaltyRepository, ILoyaltyService } from "../ports/loyalty.port";
import { LOYALTY_REPOSITORY, USER_MONGO_AUDIT_REPOSITORY } from "../user.di-token";
import { type IUserMongoAuditRepository } from "../ports/user.port";
import { PointHistoryCondDTO, PointHistoryDTO, pointHistoryDTOSchema, UserRankCondDTO, UserRankDTO, UserRankUpdateDTO } from "../dtos/loyalty.dto";
import { AppError } from "src/share/app-error";
import { ErrUserRankMinPointAlreadyExists, ErrUserRankNameAlreadyExists, ErrUserRankNotFound, UserRank } from "../models/user-rank.model";
import { v7 } from "uuid";
import { Paginated, PagingDTO } from "src/share";
import { PointHistory } from "../models/point-history.model";

// Lớp LoyaltySerivce triển khai các phương thức quản lý chương trình khách hàng thân thiết
export class LoyaltyService implements ILoyaltyService {
    constructor(
        @Inject(LOYALTY_REPOSITORY) private readonly loyaltyRepository: ILoyaltyRepository,
        @Inject(USER_MONGO_AUDIT_REPOSITORY) private readonly userAuditRepo: IUserMongoAuditRepository,
    ){}

    // Tạo hạng khách hàng thân thiết mới
    async createUserRank(dto: UserRankDTO, ip: string, userAgent: string): Promise<void> {
        // 1. Kiểm tra xem hạng khách hàng thân thiết có tên hoặc điểm tối thiểu đã tồn tại chưa
        const minPoint = dto.minPoint || 0;
        const name = dto.name || '';

        const rankByName = await this.loyaltyRepository.listUserRank({ name }, { page: 1, limit: 1 }).then(res => res.data.length > 0 ? res.data[0] : null);
        const rankByMinPoint = await this.loyaltyRepository.listUserRank({ minPoint }, { page: 1, limit: 1 }).then(res => res.data.length > 0 ? res.data[0] : null);


        if (rankByName || rankByMinPoint) {
            if (rankByName) {
                throw AppError.from(ErrUserRankNameAlreadyExists, 400);
            }
            if (rankByMinPoint) {
                throw AppError.from(ErrUserRankMinPointAlreadyExists, 400);
            }
        }


        // 2. Tạo hạng khách hàng thân thiết mới và lưu vào cơ sở dữ liệu
        const newId = v7();
        const newUserRank: UserRank = {
            ...dto,
            id: newId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await this.loyaltyRepository.insertUserRank(newUserRank);

        // 3. Ghi log hoặc thực hiện các hành động khác nếu cần
        await this.userAuditRepo.logUserAudit({
            userId: 'system',
            action: 'CREATE_USER_RANK',
            success: true,
            ip,
            userAgent,
            // Lưu thông tin bổ sung về hạng khách hàng thân thiết
            metaData: {
                rankName: dto.name,
                rankId: newId,
            }
        });

    }

    // Cập nhật hạng khách hàng thân thiết
    async updateUserRank(id: string, dto: UserRankUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // 1. Kiểm tra xem hạng khách hàng thân thiết có tồn tại không
        const existingRank = await this.loyaltyRepository.getUserRank(id);
        if (!existingRank) {
            throw AppError.from(ErrUserRankNotFound, 404);
        }

        // 2. Cập nhật hạng khách hàng thân thiết và lưu vào cơ sở dữ liệu
        await this.loyaltyRepository.updateUserRank(id, dto);

        // 3. Ghi log hoặc thực hiện các hành động khác nếu cần
        await this.userAuditRepo.logUserAudit({
            userId: 'system',
            action: 'UPDATE_USER_RANK',
            success: true,
            ip,
            userAgent,
            // Lưu thông tin bổ sung về hạng khách hàng thân thiết
            metaData: {
                rankName: dto.name,
                rankId: id,
            }
        });
    }

    // Xóa hạng khách hàng thân thiết
    async deleteUserRank(id: string, ip: string, userAgent: string): Promise<void> {
        // 1. Kiểm tra xem hạng khách hàng thân thiết có tồn tại không
        const existingRank = await this.loyaltyRepository.getUserRank(id);
        if (!existingRank) {
            throw AppError.from(ErrUserRankNotFound, 404);
        }

        // 2. Xóa hạng khách hàng thân thiết khỏi cơ sở dữ liệu
        await this.loyaltyRepository.deleteUserRank(id);

        // 3. Ghi log hoặc thực hiện các hành động khác nếu cần
        await this.userAuditRepo.logUserAudit({
            userId: 'system',
            action: 'DELETE_USER_RANK',
            success: true,
            ip,
            userAgent,
            // Lưu thông tin bổ sung về hạng khách hàng thân thiết
            metaData: {
                rankName: existingRank.name,
                rankId: id,
            }
        });
    }

    // Lấy hạng khách hàng thân thiết theo ID
    async getUserRankById(id: string, ip: string, userAgent: string): Promise<UserRank | null> {
        return this.loyaltyRepository.getUserRank(id);
    }

    // Lấy danh sách hạng khách hàng thân thiết theo điều kiện
    async getUserRanks(cond: UserRankCondDTO, ip: string, userAgent: string, paging: PagingDTO): Promise<Paginated<UserRank>> {
        return this.loyaltyRepository.listUserRank(cond, paging);
    }

    // Tạo lịch sử điểm khách hàng thân thiết mới
    async createPointHistory(dto: PointHistoryDTO, ip: string, userAgent: string): Promise<void> {
        // 1. Validate dữ liệu đầu vào
        const data = pointHistoryDTOSchema.parse(dto);
        
        // 2. Tạo lịch sử điểm khách hàng thân thiết mới và lưu vào cơ sở dữ liệu
        const newId = v7();
        const newPointHistory = {
            id: newId,
            userId: data.userId,
            amount: data.amount,
            reason: data.reason,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await this.loyaltyRepository.insertPointHistory(newPointHistory);
    }

    // Lấy danh sách lịch sử điểm khách hàng thân thiết theo điều kiện
    async getPointHistories(cond: PointHistoryCondDTO, ip: string, userAgent: string, paging: PagingDTO): Promise<Paginated<PointHistory>> {
        return this.loyaltyRepository.listPointHistory(cond, paging);
    }
}
