import { Paginated, PagingDTO } from 'src/share';
import { UserRankDTO, UserRankCondDTO, PointHistoryDTO, PointHistoryCondDTO, UserRankUpdateDTO } from '../dtos/loyalty.dto';
import { PointHistory } from '../models/point-history.model';
import { UserRank } from '../models/user-rank.model';
// ============================
// Định nghĩa các interface cho Loyalty Service
// ============================

// Định nghĩa các phương thức mà LoyaltyService phải triển khai
export interface ILoyaltyService {
    // Quản lý hạng khách hàng thân thiết
    createUserRank(dto: UserRankDTO, ip: string, userAgent: string): Promise<void>; // Tạo hạng khách hàng thân thiết mới
    updateUserRank(id: string, dto: UserRankUpdateDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật hạng khách hàng thân thiết
    deleteUserRank(id: string, ip: string, userAgent: string): Promise<void>; // Xóa hạng khách hàng thân thiết
    getUserRankById(id: string, ip: string, userAgent: string): Promise<UserRank | null>; // Lấy hạng khách hàng thân thiết theo ID
    getUserRanks(cond: UserRankCondDTO, ip: string, userAgent: string, paging: PagingDTO): Promise<Paginated<UserRank>>; // Lấy danh sách hạng khách hàng thân thiết theo điều kiện

    // Quản lý lịch sử điểm khách hàng thân thiết
    createPointHistory(dto: PointHistoryDTO, ip: string, userAgent: string): Promise<void>; // Tạo lịch sử điểm khách hàng thân thiết mới
    getPointHistories(cond: PointHistoryCondDTO, ip: string, userAgent: string, paging: PagingDTO): Promise<Paginated<PointHistory>>; // Lấy danh sách lịch sử điểm khách hàng thân thiết theo điều kiện   
}

// Định nghĩa các phương thức mà LoyaltyRepository phải triển khai
export interface ILoyaltyRepository {
    // Truy vấn hạng khách hàng thân thiết
    getUserRank(id: string): Promise<UserRank | null>; // Lấy hạng khách hàng thân thiết theo ID
    listUserRank(cond: UserRankCondDTO, paging: PagingDTO): Promise<Paginated<UserRank>>; // Lấy danh sách hạng khách hàng thân thiết theo điều kiện và phân trang
    listUserRanksByIds(ids: string[]): Promise<UserRank[]>; // Lấy danh sách hạng khách hàng thân thiết theo mảng IDs

    // Yêu cầu hạng khách hàng thân thiết
    insertUserRank(userRank: UserRank): Promise<void>; // Thêm hạng khách hàng thân thiết mới
    updateUserRank(id: string, dto: UserRankUpdateDTO): Promise<void>; // Cập nhật hạng khách hàng thân thiết
    deleteUserRank(id: string): Promise<void>; // Xóa hạng khách hàng thân thiết theo ID

    // Truy vấn lịch sử điểm khách hàng thân thiết
    getPointHistory(id: string): Promise<PointHistory | null>; // Lấy lịch sử điểm khách hàng thân thiết theo ID
    listPointHistory(cond: PointHistoryCondDTO, paging: PagingDTO): Promise<Paginated<PointHistory>>; // Lấy danh sách lịch sử điểm khách hàng thân thiết theo điều kiện và phân trang  
    listPointHistoriesByUserIds(userIds: string[]): Promise<PointHistory[]>; // Lấy danh sách lịch sử điểm khách hàng thân thiết theo mảng user IDs
    
    // Yêu cầu lịch sử điểm khách hàng thân thiết
    insertPointHistory(pointHistory: PointHistory): Promise<void>; // Thêm lịch sử điểm khách hàng thân thiết mới
    updatePointHistory(id: string, dto: Partial<PointHistory>): Promise<void>; // Cập nhật lịch sử điểm khách hàng thân thiết
    deletePointHistory(id: string): Promise<void>; // Xóa lịch sử điểm khách hàng thân thiết theo ID
}
