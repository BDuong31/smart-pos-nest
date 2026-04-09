import { Inject, Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query, Request } from '@nestjs/common';
import { IMPORTINVOICE_REPOSITORY, IMPORTINVOICE_SERVICE } from '../inventory.di-token';
import type { IImportInvoiceService } from '../ports/importInvoice.port';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import { type ImportInvoiceCreateDTO, type ImportInvoiceUpdateDTO, type ImportInvoiceCondDTO, importInvoiceCondDTOSchema } from '../dtos/importInvoice.dto';
import { AppError, getIPv4FromReq,type IPublicSupplierRpc, paginatedResponse, type PagingDTO, pagingDTOSchema, PublicSupplier, type ReqWithRequester, SUPPLIER_RPC, UserRole } from 'src/share';
import type { Request as ExpressRequest } from 'express';
import { ImportInvoice } from '../models/importInvoice.model';
import { ErrImportInvoiceDetailNotFound } from '../models/importInvoiceDetail.model';

@Controller('v1/import-invoices')
export class ImportInvoiceHttpController {
    constructor(
        @Inject(IMPORTINVOICE_SERVICE) private readonly importInvoiceService: IImportInvoiceService,
        @Inject(SUPPLIER_RPC) private readonly supplierRpc: IPublicSupplierRpc,
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
        const data = await this.importInvoiceService.create(requester, dto, ip, userAgent);
        return { data };
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
        const data = await this.importInvoiceService.update(requester, id, dto, ip, userAgent);
        return { data };
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
        paging = pagingDTOSchema.parse(paging);
        cond = importInvoiceCondDTOSchema.parse(cond);
        const result = await this.importInvoiceService.list(cond, paging);

        const supplierIds = result.data.map(invoice => invoice.supplierId);

        const suppliers = await this.supplierRpc.findByIds([...new Set(supplierIds)]);

        console.log('Suppliers:', suppliers); // Log danh sách nhà cung cấp để kiểm tra
        const supplierMap: Record<string, PublicSupplier> = {};

        if (suppliers && suppliers.length > 0) {
            console.log('Mapping suppliers to supplierMap...'); // Log trước khi map nhà cung cấp
            suppliers.map(supplier => {
                supplierMap[supplier.id] = supplier;
            });
        }

        console.log('Supplier Map:', supplierMap); // Log bản đồ nhà cung cấp để kiểm tra

        result.data = result.data.map((invoice) => {
            const supplier = supplierMap[invoice.supplierId];
            console.log(`Mapping supplier for invoice ${invoice.supplierId}:`, supplier); // Log thông tin nhà cung cấp được map cho mỗi phiếu nhập hàng
            return { ...invoice, supplier } as ImportInvoice;
        })

        return paginatedResponse(result, paging);
    }

    // API để lấy chi tiết phiếu nhập hàng theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const result = await this.importInvoiceService.get(id);
        
        if (!result) {
            throw AppError.from(ErrImportInvoiceDetailNotFound, 404);
        }

        const supplier = await this.supplierRpc.findById(result.supplierId);

        const data = { ...result, supplier } as ImportInvoice;
        return { data };
    }

    // API để lấy danh sách phiếu nhập hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const data = await this.importInvoiceService.listByIds(ids);
        return { data };
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
        const data = await this.importInvoiceService.get(id);
        return { data };
    }

    // RPC lấy danh sách phiếu nhập hàng theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const data = await this.importInvoiceService.listByIds(ids);
        return { data };
    }
}