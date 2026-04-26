import { Inject, Injectable } from '@nestjs/common';
import { type IPrinterRepository, IPrinterService } from '../ports/printer.port';
import { PRINTER_REPOSITORY } from '../catalog.di-token';
import { ErrPrinterAlreadyExists, ErrPrinterNotFound, type Printer } from '../models/printer.model';
import {type IEventPublisher, Requester } from 'src/share/interface';
import { CreatePrinterDTO, PrinterCondDTO, UpdatePrinterDTO, createPrinterDTOSchema, updatePrinterDTOSchema } from '../dtos/printer.dto';
import { v7 } from 'uuid';
import { AppError, EVENT_PUBLISHER, Paginated, PagingDTO } from 'src/share';
import { PrinterCreatedEvent, PrinterDeletedEvent, PrinterUpdatedEvent } from 'src/share/event/printer.evt';

// Lớp PrinterService cung cấp các phương thức để quản lý máy in
@Injectable()
export class PrinterService implements IPrinterService {
    constructor(
        @Inject(PRINTER_REPOSITORY) private readonly printerRepo: IPrinterRepository,
        @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
    ){}

    // Tạo mới máy in
    async createPrinter(requester: Requester, dto: CreatePrinterDTO, ip: string, userAgent: string): Promise<Printer> {
        // Kiểm tra dữ liệu đầu vào
        const data = createPrinterDTOSchema.parse(dto);

        // Kiểm tra xem máy in đã tồn tại chưa
        const existing = await this.printerRepo.list({ name: data.name }, { page: 1, limit: 1 });

        if (existing.data.length > 0) {
            throw AppError.from(ErrPrinterAlreadyExists, 409);
        }

        // Tạo máy in mới
        const newId = v7();
        const printer: Printer = {
            ...data,
            id: newId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.printerRepo.insert(printer);

        await this.eventPublisher.publish(PrinterCreatedEvent.create({
            printerId: newId,
            name: data.name,
            type: data.type,
            ipAddress: data.ipAddress,
            changeType: 'CREATED'
        }, requester.sub))

        return printer;
    }

    // Cập nhật thông tin máy in
    async updatePrinter(requester: Requester, printerId: string, dto: UpdatePrinterDTO, ip: string, userAgent: string): Promise<Printer> {
        // Kiểm tra dữ liệu đầu vào
        const data = updatePrinterDTOSchema.parse(dto);

        // Kiểm tra xem máy in có tồn tại không
        const existing = await this.printerRepo.get(printerId);

        if (!existing) {
            throw AppError.from(ErrPrinterNotFound, 404);
        }

        // Cập nhật thông tin máy in
        await this.printerRepo.update(printerId, data);

        // Trả về thông tin máy in đã được cập nhật
        const updatedPrinter = await this.printerRepo.get(printerId);

        if (!updatedPrinter) {
            throw AppError.from(ErrPrinterNotFound, 404);
        }

        await this.eventPublisher.publish(PrinterUpdatedEvent.create({
            printerId: updatedPrinter.id,
            name: updatedPrinter.name,
            type: updatedPrinter.type,
            ipAddress: updatedPrinter.ipAddress,
            changeType: 'UPDATED'
        }, requester.sub))

        return updatedPrinter;
    }

    // Xóa máy in
    async deletePrinter(requester: Requester, printerId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem máy in có tồn tại không
        const existing = await this.printerRepo.get(printerId);

        if (!existing) {
            throw AppError.from(ErrPrinterNotFound, 404);   
        }

        await this.printerRepo.delete(printerId);

        await this.eventPublisher.publish(PrinterDeletedEvent.create({
            printerId: existing.id,
            name: existing.name,
            type: existing.type,
            ipAddress: existing.ipAddress,
            changeType: 'DELETED'
        }, requester.sub))
    }

    // Lấy thông tin máy in theo ID
    async getPrinterById(printerId: string): Promise<Printer | null> {
        return await this.printerRepo.get(printerId);
    }

    // Lấy danh sách máy in theo điều kiện lọc
    async getListPrinter(cond: PrinterCondDTO, paging: PagingDTO): Promise<Paginated<Printer>> {
        return await this.printerRepo.list(cond, paging);
    }

    // Lấy danh sách máy in theo điều kiện lọc
    async getPrinterByIds(ids: string[]): Promise<Printer[]> {
        return await this.printerRepo.listByIds(ids);
    }
}