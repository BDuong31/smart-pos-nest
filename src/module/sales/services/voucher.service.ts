import { Inject, Injectable } from '@nestjs/common';
import { type IVoucherRepository, IVoucherService } from '../ports/voucher.port';
import { VOUCHER_REPOSITORY } from '../sales.di-token';
import { ErrVoucherAlreadyExists, ErrVoucherNotFound, type Voucher } from '../models/voucher.model';
import { Requester } from 'src/share/interface';
import { VoucherCondDTO, VoucherCreateDTO, voucherCreateDTOSchema, VoucherUpdateDTO, voucherUpdateDTOSchema } from '../dtos/voucher.dto';
import { v7 } from 'uuid';
import { AppError, Paginated, PagingDTO } from 'src/share';

// Lớp VoucherService cung cấp các phương thức để quản lý voucher
@Injectable()
export class VoucherService implements IVoucherService {
    constructor(
        @Inject(VOUCHER_REPOSITORY) private readonly voucherRepo: IVoucherRepository,
    ){}

    // Tạo mới voucher
    async createVoucher(requester: Requester, dto: VoucherCreateDTO, ip: string, userAgent: string): Promise<Voucher> {
        // Kiểm tra dữ liệu đầu vào
        const data = voucherCreateDTOSchema.parse(dto);

        // Kiểm tra xem voucher đã tồn tại chưa
        const existing = await this.voucherRepo.listVouchers({ 
            code: data.code,
        }, { page: 1, limit: 1 });
        
        if (existing.data.length > 0) {
            throw AppError.from(ErrVoucherAlreadyExists, 409);
        }

        // Tạo voucher mới
        const newId = v7();
        const voucher = {
            id: newId,
            code: data.code,
            type: data.type,
            value: data.value,
            minOrderVal: data.minOrderVal,
            usageLimit: data.usageLimit,
            isActive: data.isActive,
            startDate: data.startDate,
            endDate: data.endDate,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await this.voucherRepo.insertVoucher(voucher);
        return voucher;
    }

    // Cập nhật thông tin voucher theo ID
    async updateVoucher(requester: Requester, id: string, dto: VoucherUpdateDTO, ip: string, userAgent: string): Promise<Voucher> {
        // Kiểm tra dữ liệu đầu vào
        const data = voucherUpdateDTOSchema.parse(dto);

        // Kiểm tra xem voucher có tồn tại không
        const existing = await this.voucherRepo.getVoucherById(id);

        if (!existing) {
            throw AppError.from(ErrVoucherNotFound, 404);
        }

        // Cập nhật thông tin voucher
        const updatedVoucher = {
            ...existing,
            ...data,
            updatedAt: new Date(),
        };

        await this.voucherRepo.updateVoucher(id, data);

        return updatedVoucher;
    }

    // Xóa voucher theo ID
    async deleteVoucher(requester: Requester, id: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem voucher có tồn tại không
        const existing = await this.voucherRepo.getVoucherById(id);

        if (!existing) {
            throw AppError.from(ErrVoucherNotFound, 404);
        }

        // Xóa voucher
        await this.voucherRepo.deleteVoucher(id);
    }

    // Lấy thông tin voucher theo ID
    async getVoucherById(requester: Requester, id: string): Promise<Voucher | null> {
        return await this.voucherRepo.getVoucherById(id);
    }

    // Lấy danh sách voucher theo điều kiện
    async listVouchers(requester: Requester, pagingDTO: PagingDTO, cond: VoucherCondDTO): Promise<Paginated<Voucher>> {
        return await this.voucherRepo.listVouchers(cond, pagingDTO);
    }

    // Lấy danh sách voucher theo nhiều ID
    async listVouchersByIds(requester: Requester, ids: string[], pagingDTO: PagingDTO): Promise<Paginated<Voucher>> {
        return await this.voucherRepo.listVouchersByIds(ids, pagingDTO);
    }
}