 import { ILoyaltyRepository } from "../ports/loyalty.port";
import prisma from "src/share/components/prisma"
import { UserRank as UserRankPrisma, PointHistory as PointHistoryPrisma, PointHistory } from "@prisma/client";
import { UserRank } from "../models/user-rank.model";
import { PointHistoryCondDTO, PointHistoryDTO, UserRankCondDTO, UserRankDTO, UserRankUpdateDTO } from "../dtos/loyalty.dto";
// Lớp LoyaltyPrismaRepository cung cấp phương thức truy vấn dữ liệu hệ thống khách hàng thân thiết từ Prisma
export class LoyaltyPrismaRepository implements ILoyaltyRepository {
    // Phương thức lấy hạng khách hàng thân thiết theo ID
    async getUserRank(id: string): Promise<UserRank | null> {
        const data = await prisma.userRank.findFirst({
            where: { id }
        });
        if (!data) return null;
        return this._toUserRankModel(data);
    }

    // Phương thức tìm hạng khách hàng thân thiết theo điều kiện
    async findUserRanksByCond(cond: UserRankCondDTO): Promise<UserRank[]> {
        const data = await prisma.userRank.findMany({
            where: { ...cond }
        });
        return data.map(this._toUserRankModel);
    }

    // Phương thức tìm hạng khách hàng thân thiết đúng theo 1 trong các điều kiện
    async findUserRanksByCondOr(cond: UserRankCondDTO): Promise<UserRank[]> {
        const data = await prisma.userRank.findMany({
            where: { OR: [ ...Object.entries(cond).map(([key, value]) => ({ [key]: value })) ] }
        });
        return data.map(this._toUserRankModel);
    }
    
    // Phương thức lấy danh sách hạng khách hàng thân thiết theo mảng IDs
    async listUserRanksByIds(ids: string[]): Promise<UserRank[]> {
        const data = await prisma.userRank.findMany({
            where: { id: { in: ids } }
        });
        return data.map(this._toUserRankModel);
    }

    // Phương thức thêm hạng khách hàng thân thiết mới
    async insertUserRank(userRank: UserRankDTO): Promise<void> {
        await prisma.userRank.create({ data: userRank });
    }
    // Phương thức cập nhật hạng khách hàng thân thiết
    async updateUserRank(id: string, dto: UserRankUpdateDTO): Promise<void> {
        await prisma.userRank.update({
            where: { id },
            data: dto
        });
    }

    // Phương thức xóa hạng khách hàng thân thiết theo ID
    async deleteUserRank(id: string): Promise<void> {
        await prisma.userRank.delete({
            where: { id }
        });
    }

    // Phương thức lấy lịch sử điểm khách hàng thân thiết theo ID
    async getPointHistory(id: string): Promise<PointHistory | null> {
        const data = await prisma.pointHistory.findFirst({
            where: { id }
        });
        if (!data) return null;
        return this._toPointHistoryModel(data);
    }

    // Phương thức tìm lịch sử điểm khách hàng thân thiết theo điều kiện
    async findPointHistoriesByCond(cond: PointHistoryCondDTO): Promise<PointHistory[]> {
        const data = await prisma.pointHistory.findMany({
            where: { ...cond }
        });
        return data.map(this._toPointHistoryModel);
    }
    // Phương thức tìm lịch sử điểm khách hàng thân thiết đúng theo 1 trong các điều kiện
    async findPointHistoriesByCondOr(cond: PointHistoryCondDTO): Promise<PointHistory[]> {
        const data = await prisma.pointHistory.findMany({
            where: { OR: [ ...Object.entries(cond).map(([key, value]) => ({ [key]: value })) ] }
        });
        return data.map(this._toPointHistoryModel);
    }

    // Phương thức lấy danh sách lịch sử điểm khách hàng thân thiết theo mảng IDs
    async listPointHistoriesByIds(ids: string[]): Promise<PointHistory[]> {
        const data = await prisma.pointHistory.findMany({
            where: { id: { in: ids } }
        });
        return data.map(this._toPointHistoryModel);
    }

    // Phương thức thêm lịch sử điểm khách hàng thân thiết mới
    async insertPointHistory(pointHistory: PointHistory): Promise<void> {
        await prisma.pointHistory.create({ data: pointHistory });
    }

    // Phương thức cập nhật lịch sử điểm khách hàng thân thiết
    async updatePointHistory(id: string, dto: Partial<PointHistory>): Promise<void> {
        await prisma.pointHistory.update({
            where: { id },
            data: dto
        });
    }

    // Phương thức xóa lịch sử điểm khách hàng thân thiết theo ID
    async deletePointHistory(id: string): Promise<void> {
        await prisma.pointHistory.delete({
            where: { id }
        });
    }

    // Chuyển đổi dữ liệu từ Prisma sang Model (user-rank)
    private _toUserRankModel(data: UserRankPrisma): UserRank {
        return {...data} as UserRank;
    }
    // Chuyển đổi dữ liệu từ Prisma sang Model (point-history)\
    private _toPointHistoryModel(data: PointHistoryPrisma): PointHistory {
        return {...data} as PointHistory;
    }
}