import { Paginated } from './data-model';
import { Request } from 'express';
// Hàm tạo phản hồi phân trang
export const paginatedResponse = <E>(paginated: Paginated<E>, filter: any) => ({
        data: paginated.data, // Dữ liệu phân trang
        paging: paginated.paging, // Thông tin phân trang
        total: paginated.total, // Tổng số bản ghi
        filter, // Bộ lọc đã áp dụng
});

// Hàm lấy ip v4 từ địa chỉ IP đầy đủ
export const getIPv4FromReq = (req: Request): string => {
        // lấy ip
        let ip =
                (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
                req.socket?.remoteAddress ||
                req.ip ||
                '';
        
        // IPv6 mapped IPv4 ::ffff:113.161.89.22
        if (ip.startsWith('::ffff:')) {
               ip = ip.replace('::ffff:', '');
        }

        // Localhost
        if (ip === '::1') {
               return '127.0.0.1';
        }

        // Nếu vẫn là IpV6 -> trả về nguyên bản (fallback)
        if(ip.includes(':')) {
                 return ip;
        }

        return ip;
}