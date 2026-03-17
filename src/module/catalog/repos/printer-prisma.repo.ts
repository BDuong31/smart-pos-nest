import prisma from 'src/share/components/prisma'
import { Injectable } from '@nestjs/common';
import { Printer } from '../models/printer.model';
import type { CreatePrinterDTO, UpdatePrinterDTO, PrinterCondDTO  } from '../dtos/printer.dto';
import type { IPrinterRepository } from '../ports/printer.port';
import type { Printer as PrinterPrisma } from '@prisma/client';
import { Paginated, PagingDTO } from 'src/share/data-model';

// Lớp PrinterPrismaRepo cung cấp phương thức truy vấn dữ liệu máy in từ Prisma
@Injectable()
export class PrinterPrismaRepo implements IPrinterRepository {
    // Lấy máy in theo ID
    async get(id: string): Promise<Printer | null> {
        const data = await prisma.printer.findFirst({ where: { id } });

        if (!data) return null;
        
        return this._toModel(data);
    }

    // Lấy danh sách máy in theo điều kiện lọc
    async list(cond: PrinterCondDTO, paging: PagingDTO): Promise<Paginated<Printer>> {
        const { name, ipAddress, type } = cond;

        let where = {}

        if (name) {
            where = {
                ...where,
                name: name,
            }
        }

        if (ipAddress) {
            where = {
                ...where,
                ipAddress: ipAddress,
            }
        }

        if (type) {
            where = {
                ...where,
                type: type,
            }
        }

        const page = Number(paging.page);
        const limit = Number(paging.limit);

        const total = await prisma.printer.count({ where });

        const skip = (page - 1) * limit;

        const result = await prisma.printer.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: 'asc' },
        });

        return {
            data: result.map(this._toModel),
            paging,
            total
        }
    }

    // Lấy danh sách máy in theo mảng IDs
    async listByIds(ids: string[]): Promise<Printer[]> {
        const data = await prisma.printer.findMany({
            where: { id: { in: ids } },
        });
        return data.map(this._toModel);
    }

    // Thêm máy in mới
    async insert(printer: Printer): Promise<void> {
        await prisma.printer.create({ data: printer });
    }

    // Cập nhật thông tin máy in
    async update(id: string, dto: UpdatePrinterDTO): Promise<void> {
        await prisma.printer.update({ where: { id }, data: dto });
    }

    // Xóa máy in theo ID
    async delete(id: string): Promise<void> {
        await prisma.printer.delete({ where: { id } });
    }

    // Hàm chuyển đổi dữ liệu từ Prisma sang model Printer
    private _toModel(data: PrinterPrisma): Printer {
        return { ...data } as Printer;
    }
}