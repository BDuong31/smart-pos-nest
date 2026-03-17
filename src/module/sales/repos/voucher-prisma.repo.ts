import prisma from 'src/share/components/prisma'
import { Injectable } from '@nestjs/common';
import { Voucher } from '../models/voucher.model';
import type { VoucherCreateDTO, VoucherUpdateDTO, VoucherCondDTO} from '../dtos/voucher.dto';
import type { IVoucherRepository } from '../ports/voucher.port';
import type { Voucher as VoucherPrisma } from '@prisma/client';
import { Paginated, PagingDTO } from 'src/share/data-model';

// Lớp VoucherPrismaRepo cung cấp phương thức truy vấn dữ liệu voucher từ Prisma
@Injectable()
export class VoucherPrismaRepo implements IVoucherRepository {
    // Lấy voucher theo ID
    async getVoucherById(voucherId: string): Promise<Voucher | null> {
        const data = await prisma.voucher.findFirst({ where: { id: voucherId } });

        if (!data) return null;
        
        return this._toModel(data);
    }

    // Lấy danh sách voucher theo điều kiện
    async listVouchers(cond: VoucherCondDTO, paging: PagingDTO): Promise<Paginated<Voucher>> {
        const { code, type, value, minOrderVal, usageLimit, isActive,  startDate, endDate, ...rest} = cond; 

        let where = {
            ...rest,
        }

        if (code) {
            where = {
                ...where,
                code: code,
            }
        }

        if (type) {
            where = {
                ...where,
                type: type,
            }
        }

        if (value) {
            where = {
                ...where,
                value: value,
            }
        }   

        if (minOrderVal) {
            where = {
                ...where,
                minOrderVal: minOrderVal,
            }
        }

        if (usageLimit) {
            where = {
                ...where,
                usageLimit: usageLimit,
            }
        }

        if (isActive !== undefined) {
            where = {
                ...where,
                isActive: isActive,
            }
        }

        if (startDate) {
            where = {
                ...where,
                startDate: startDate,
            }
        }

        if (endDate) {
            where = {
                ...where,
                endDate: endDate,
            }
        }

        const total = await prisma.voucher.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.voucher.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { createdAt: 'desc' },
        });

        return {
            data: result.map(this._toModel),
            paging,
            total
        }
    }

    // Lấy danh sách voucher theo nhiều ID  
    async listVouchersByIds(ids: string[]): Promise<Voucher[]> {
        const data = await prisma.voucher.findMany({ where: { id: { in: ids } } });

        return data.map(this._toModel);
    }

    // Tạo mới voucher
    async insertVoucher(voucher: Voucher): Promise<void> {
        await prisma.voucher.create({ data: voucher });
    }

    // Cập nhật thông tin voucher theo ID
    async updateVoucher(voucherId: string, voucherUpdateDTO: VoucherUpdateDTO): Promise<void> {
        await prisma.voucher.update({ where: { id: voucherId }, data: voucherUpdateDTO });
    }

    // Xóa voucher theo ID
    async deleteVoucher(voucherId: string): Promise<void> {
        await prisma.voucher.delete({ where: { id: voucherId } });
    }

    // Chuyển đổi dữ liệu từ Prisma sang model Voucher
    private _toModel(data: VoucherPrisma): Voucher {
        return { ...data } as Voucher; 
    }
}