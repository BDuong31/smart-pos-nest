import { Inject, Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query, Request } from '@nestjs/common';
import { IMPORTINVOICE_REPOSITORY, IMPORTINVOICE_SERVICE } from '../inventory.di-token';
import type { IImportInvoiceService } from '../ports/importInvoice.port';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import type { ImportInvoiceCreateDTO, ImportInvoiceUpdateDTO, ImportInvoiceCondDTO } from '../dtos/importInvoice.dto';
import { getIPv4FromReq, paginatedResponse, type PagingDTO, type ReqWithRequester, UserRole } from 'src/share';
import type { Request as ExpressRequest } from 'express';

@Controller('v1/import-invoices')
export class ImportInvoiceHttpController {
    constructor(
        @Inject(IMPORTINVOICE_SERVICE) private readonly importInvoiceService: IImportInvoiceService,
    ){}

    // API để tạo mới phiếu nhập hàng
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: ImportInvoiceCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const importInvoice = await this.importInvoiceService.create(requester, dto, ip, userAgent);
        return importInvoice;
    }

    // API để cập nhật thông tin phiếu nhập hàng theo ID
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string, @Body() dto: ImportInvoiceUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const importInvoice = await this.importInvoiceService.update(requester, id, dto, ip, userAgent);
        return importInvoice;
    }

    // API để xóa phiếu nhập hàng theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.importInvoiceService.delete(requester, id, ip, userAgent);
    }

    // API để lấy danh sách phiếu nhập hàng theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: ImportInvoiceCondDTO, @Query() paging: PagingDTO) {
        const importInvoices = await this.importInvoiceService.list(cond, paging);
        return paginatedResponse(importInvoices, paging);
    }

    // API để lấy chi tiết phiếu nhập hàng theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const importInvoice = await this.importInvoiceService.get(id);
        return importInvoice;
    }

    // API để lấy danh sách phiếu nhập hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const importInvoices = await this.importInvoiceService.listByIds(ids, paging);
        return importInvoices;
    }

}

@Controller('v1/rpc/import-invoices')
export class ImportInvoiceRpcController {
    constructor(
        @Inject(IMPORTINVOICE_SERVICE) private readonly importInvoiceService: IImportInvoiceService,
    ){}

    // RPC lấy phiếu nhập hàng theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const importInvoice = await this.importInvoiceService.get(id);
        return importInvoice;
    }

    // RPC lấy danh sách phiếu nhập hàng theo điều kiện
    @Get()
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: ImportInvoiceCondDTO, @Query() paging: PagingDTO) {
        const importInvoices = await this.importInvoiceService.list(cond, paging);
        return paginatedResponse(importInvoices, paging);
    }

    // RPC lấy danh sách phiếu nhập hàng theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const importInvoices = await this.importInvoiceService.listByIds(ids, paging);
        return importInvoices;
    }
}