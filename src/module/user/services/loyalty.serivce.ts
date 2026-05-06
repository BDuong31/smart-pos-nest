import { Inject } from "@nestjs/common";
import { type ILoyaltyRepository, ILoyaltyService } from "../ports/loyalty.port";
import { LOYALTY_REPOSITORY, USER_MONGO_AUDIT_REPOSITORY } from "../user.di-token";
import { type IUserMongoAuditRepository } from "../ports/user.port";
import { PointHistoryCondDTO, PointHistoryDTO, pointHistoryDTOSchema, UserRankCondDTO, UserRankDTO, UserRankUpdateDTO } from "../dtos/loyalty.dto";
import { AppError } from "src/share/app-error";
import { ErrUserRankMinPointAlreadyExists, ErrUserRankNameAlreadyExists, ErrUserRankNotFound, UserRank } from "../models/user-rank.model";
import { v7 } from "uuid";
import { EVENT_PUBLISHER,type IEventPublisher, type IPublicUserRpc, Paginated, PagingDTO, USER_RPC } from "src/share";
import { PointHistory } from "../models/point-history.model";
import { PointsDecreasedEvent, PointsIncreasedEvent, RankCreatedEvent, RankDeletedEvent, RankUpdatedEvent, UserRankChangedEvent } from "src/share/event/loyalty.evt";
import { ErrUserNotFound } from "../models/user.model";
// Lớp LoyaltySerivce triển khai các phương thức quản lý chương trình khách hàng thân thiết
export class LoyaltyService implements ILoyaltyService {
    constructor(
        @Inject(LOYALTY_REPOSITORY) private readonly loyaltyRepository: ILoyaltyRepository,
        @Inject(USER_MONGO_AUDIT_REPOSITORY) private readonly userAuditRepo: IUserMongoAuditRepository,
        @Inject(USER_RPC) private readonly userRpc: IPublicUserRpc,
        @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
    ){}

    // Tạo hạng khách hàng thân thiết mới
    async createUserRank(dto: UserRankDTO, ip: string, userAgent: string): Promise<string> {
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

        await this.eventPublisher.publish(RankCreatedEvent.create({
            rankId: newId,
            rankName: dto.name,
            rankChanges: 'CREATED',
        }, 'system'));

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

        return newId;
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

        await this.eventPublisher.publish(RankUpdatedEvent.create({
            rankId: id,
            rankName: dto.name,
            rankChanges: 'UPDATED',
        }, 'system'));
        
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

        await this.eventPublisher.publish(RankDeletedEvent.create({
            rankId: id,
            rankName: existingRank.name,
            rankChanges: 'DELETED',
        }, 'system'));

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
    async getUserRankById(id: string): Promise<UserRank | null> {
        return this.loyaltyRepository.getUserRank(id);
    }

    // Lấy danh sách hạng khách hàng thân thiết theo điều kiện
    async getUserRanks(cond: UserRankCondDTO, paging: PagingDTO): Promise<Paginated<UserRank>> {
        return this.loyaltyRepository.listUserRank(cond, paging);
    }

    // Lấy danh sách hạng khách hàng thân thiết theo mảng ID
    async getUserRankByIds(ids: string[]): Promise<UserRank[] | null> {
        return this.loyaltyRepository.listUserRanksByIds(ids);
    }   

    // Tạo lịch sử điểm khách hàng thân thiết mới
    async createPointHistory(dto: PointHistoryDTO, ip: string, userAgent: string): Promise<string> {
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

        const user = await this.userRpc.getUserById(data.userId);
        if (!user) {
            throw AppError.from(ErrUserNotFound, 404);
        }

        const listRank = await this.loyaltyRepository.listUserRanksByIds([])

        if(listRank.length == 0) {
            throw AppError.from(ErrUserRankNotFound, 404);
        }

        if (data.amount > 0) {
            await this.eventPublisher.publish(PointsIncreasedEvent.create({
                userId: data.userId,
                points: data.amount,
                rankChanges: 'INCREASED',
            }, 'system'));

            const currentPoints = user.currentPoints + data.amount;

            let nextRank;
            for (const rank of listRank) {
                if (currentPoints >= rank.minPoint) {
                    nextRank = rank;
                } else {
                    break;
                }
            }
            if (nextRank && nextRank.id !== user.rankId) {
                await this.eventPublisher.publish(UserRankChangedEvent.create({
                    userId: data.userId,
                    oldRankId: user.rankId || '',
                    newRankId: nextRank.id || '',
                    rankChanges: 'CHANGED',
                }, 'system'))
            }
        } else if (data.amount < 0) {
            await this.eventPublisher.publish(PointsDecreasedEvent.create({
                userId: data.userId,
                points: data.amount,
                rankChanges: 'DECREASED',
            }, 'system'));

            const currentPoints = user.currentPoints - data.amount;
            let prevRank;
            for (const rank of listRank) {
                if (currentPoints >= rank.minPoint) {
                    prevRank = rank;
                } else {
                    break;
                }
            }
            if (prevRank && prevRank.id !== user.rankId) {
                await this.eventPublisher.publish(UserRankChangedEvent.create({
                    userId: data.userId,
                    oldRankId: user.rankId || '',
                    newRankId: prevRank.id || '',
                    rankChanges: 'CHANGED',
                }, 'system'))
            }
        }

        return newId;
    }

    // Lấy danh sách lịch sử điểm khách hàng thân thiết theo điều kiện
    async getPointHistories(cond: PointHistoryCondDTO, paging: PagingDTO): Promise<Paginated<PointHistory>> {
        return this.loyaltyRepository.listPointHistory(cond, paging);
    }
}
