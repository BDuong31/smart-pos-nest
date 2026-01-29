import { Inject } from "@nestjs/common";
import { type ILoyaltyRepository, ILoyaltyService } from "../ports/loyalty.port";
import { LOYALTY_REPOSITORY, USER_MONGO_AUDIT_REPOSITORY } from "../user.di-token";
import { type IUserMongoAuditRepository } from "../ports/user.port";
import { UserRankDTO } from "../dtos/loyalty.dto";
import { AppError } from "src/share/app-error";
import { ErrUserRankMinPointAlreadyExists, ErrUserRankNameAlreadyExists, UserRank } from "../models/user-rank.model";
import { v7 } from "uuid";

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

        const existingRanks = await this.loyaltyRepository.findUserRanksByCondOr({
            name: name,
            minPoint: minPoint,
        });

        if (existingRanks.length > 0) {
            for (const rank of existingRanks) {
                if (rank.name === name) {
                    throw AppError.from(ErrUserRankNameAlreadyExists, 400);
                }
                if (rank.minPoint === minPoint) {
                    throw AppError.from(ErrUserRankMinPointAlreadyExists, 400);
                }
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
            metadata: {
                rankName: dto.name,
                rankId: newId,
            }
        });

    }

    // Cập nhật hạng khách hàng thân thiết
    async updateUserRank(id: string, dto: UserRankDTO, ip: string, userAgent: string): Promise<void> {}

    // Xóa hạng khách hàng thân thiết
    async deleteUserRank(id: string, ip: string, userAgent: string): Promise<void> {}

    // Lấy danh sách hạng khách hàng thân thiết theo điều kiện
    async getUserRanks(cond: any, ip: string, userAgent: string): Promise<UserRank[]> {
        return [];
    }

    // Tạo lịch sử điểm khách hàng thân thiết mới
    async createPointHistory(dto: any, ip: string, userAgent: string): Promise<void> {}

    // Lấy danh sách lịch sử điểm khách hàng thân thiết theo điều kiện
    async getPointHistories(cond: any, ip: string, userAgent: string): Promise<any[]> {
        return [];
    }
}