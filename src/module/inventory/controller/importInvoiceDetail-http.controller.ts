import { Inject, Controller, Get, Query, HttpCode, HttpStatus, UseGuards, Post, Body, Patch, Delete, Param } from '@nestjs/common';
import { IMPORTINVOICEDETAIL_SERVICE } from '../inventory.di-token';
import type { IImportInvoiceDetailService } from '../ports/importInvoiceDetail.port';
import type { ImportInvoiceDetailCreateDTO, ImportInvoiceDetailUpdateDTO } from '../dtos/importInvoiceDetail.dto';
import { Request } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { getIPv4FromReq, type ReqWithRequester } from 'src/share';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import type { ImportInvoiceDetailCondDTO } from '../dtos/importInvoiceDetail.dto';
import { paginatedResponse, type PagingDTO, UserRole } from 'src/share';

@Controller('v1/import-invoice-details')
export class ImportInvoiceDetailHttpController {
    constructor(
        @Inject(IMPORTINVOICEDETAIL_SERVICE) private readonly importInvoiceDetailService: IImportInvoiceDetailService,
    ){}

    // API tạo mới chi tiết phiếu nhập hàng
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: ImportInvoiceDetailCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const importInvoiceDetail = await this.importInvoiceDetailService.create(requester, dto, ip, userAgent);
        return importInvoiceDetail;
    }

    // API cập nhật chi tiết phiếu nhập hàng theo ID
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string, @Body() dto: ImportInvoiceDetailUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const importInvoiceDetail = await this.importInvoiceDetailService.update(requester, id, dto, ip, userAgent);
        return importInvoiceDetail;
    }

    // API xóa chi tiết phiếu nhập hàng theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.importInvoiceDetailService.delete(requester, id, ip, userAgent);
    }

    // API lấy chi tiết phiếu nhập hàng theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const importInvoiceDetail = await this.importInvoiceDetailService.get(id);
        return importInvoiceDetail;
    }

    // API lấy danh sách chi tiết phiếu nhập hàng theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: ImportInvoiceDetailCondDTO, @Query() paging: PagingDTO) {
        const importInvoiceDetails = await this.importInvoiceDetailService.list(cond, paging);
        return paginatedResponse(importInvoiceDetails, paging);
    }

    // API lấy danh sách chi tiết phiếu nhập hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const importInvoiceDetails = await this.importInvoiceDetailService.listByIds(ids, paging);
        return importInvoiceDetails;
    }
}

@Controller('v1/rpc/import-invoice-details')
export class ImportInvoiceDetailRpcController {
    constructor(
        @Inject(IMPORTINVOICEDETAIL_SERVICE) private readonly importInvoiceDetailService: IImportInvoiceDetailService,
    ){}

    // RPC để lấy chi tiết phiếu nhập hàng cho AI agent
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const importInvoiceDetail = await this.importInvoiceDetailService.get(id);
        return importInvoiceDetail;
    }

    // RPC để lấy danh sách chi tiết phiếu nhập hàng cho AI agent
    @Get()
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: ImportInvoiceDetailCondDTO, @Query() paging: PagingDTO) {
        const importInvoiceDetails = await this.importInvoiceDetailService.list(cond, paging);
        return paginatedResponse(importInvoiceDetails, paging);
    }

    // RPC để lấy danh sách chi tiết phiếu nhập hàng theo nhiều ID cho AI agent
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const importInvoiceDetails = await this.importInvoiceDetailService.listByIds(ids, paging);
        return importInvoiceDetails;
    }
}