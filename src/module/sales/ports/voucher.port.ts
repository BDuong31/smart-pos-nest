import { Paginated, PagingDTO, Requester } from "src/share";
import { Voucher } from "../models/voucher.model";
import type { VoucherCreateDTO, VoucherUpdateDTO, VoucherCondDTO } from "../dtos/voucher.dto";

// ============================
// Định nghĩa các interface cho Voucher
// ============================

// Định nghĩa các phương thức mà VoucherService phải triển khai
export interface IVoucherService {
    createVoucher(requester: Requester, voucherCreateDTO: VoucherCreateDTO, ip: string, userAgent: string): Promise<Voucher> // Tạo voucher mới
    updateVoucher(requester: Requester, voucherId: string, voucherUpdateDTO: VoucherUpdateDTO, ip: string, userAgent: string): Promise<Voucher> // Cập nhật thông tin voucher theo ID
    deleteVoucher(requester: Requester, voucherId: string, ip: string, userAgent: string): Promise<void> // Xóa voucher theo ID
    getVoucherById(voucherId: string): Promise<Voucher | null> // Lấy thông tin voucher theo ID
    listVouchers(pagingDTO: PagingDTO, voucherCondDTO: VoucherCondDTO): Promise<Paginated<Voucher>> // Lấy danh sách voucher theo điều kiện
    listVouchersByIds(voucherIds: string[]): Promise<Voucher[]> // Lấy danh sách voucher theo nhiều ID
}

// Định nghĩa các phương thức mà VoucherRepository phải triển khai
export interface IVoucherRepository {
    getVoucherById(voucherId: string): Promise<Voucher | null> // Lấy thông tin voucher theo ID
    listVouchers(cond: VoucherCondDTO, paging: PagingDTO): Promise<Paginated<Voucher>> // Lấy danh sách voucher theo điều kiện
    listVouchersByIds(voucherIds: string[]): Promise<Voucher[]> // Lấy danh sách voucher theo nhiều ID
    insertVoucher(voucher: Voucher): Promise<void> // Tạo mới voucher
    updateVoucher(voucherId: string, voucherUpdateDTO: VoucherUpdateDTO): Promise<void> // Cập nhật thông tin voucher theo ID
    deleteVoucher(voucherId: string): Promise<void> // Xóa voucher theo ID
}