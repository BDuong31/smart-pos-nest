import {Inject, Controller, Get, Post, Patch, Delete, HttpCode, HttpStatus, UseGuards, Body, Param,  Query, Request} from "@nestjs/common";
import { SUPPLIER_SERVICE } from "../inventory.di-token";
import type { ISupplierService } from "../ports/supplier.port";
import { RemoteAuthGuard, RolesGuard, Roles } from "src/share/guard";
import type { SupplierCreateDTO, SupplierCondDTO, SupplierUpdateDTO } from "../dtos/supplier.dto";
import { getIPv4FromReq,paginatedResponse, type PagingDTO, type ReqWithRequester, UserRole } from "src/share";
import type { Request as ExpressRequest } from "express";
@Controller('v1/suppliers')
export class SupplierHttpController {
    constructor(
        @Inject(SUPPLIER_SERVICE) private readonly supplierService: ISupplierService,
    ){} 

    // API để tạo mới nhà cung cấp
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester,@Request() reqExpress: ExpressRequest, @Body() dto: SupplierCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const supplier = await this.supplierService.create(requester, dto, ip, userAgent);
        return supplier;
    }

    // API để cập nhật thông tin nhà cung cấp theo ID
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') supplierId: string, @Body() dto: SupplierUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const updatedSupplier = await this.supplierService.update(requester, supplierId, dto, ip, userAgent);
        return updatedSupplier;
    }

    // API để xóa nhà cung cấp theo ID
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)  
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') supplierId: string) {    
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.supplierService.delete(requester, supplierId, ip, userAgent);
    }   

    // API để lấy danh sách nhà cung cấp theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: SupplierCondDTO,  @Query() paging: PagingDTO) {
        const suppliers = await this.supplierService.list(cond, paging);
        return paginatedResponse(suppliers, paging);
    }

    // API để lấy thông tin nhà cung cấp theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') supplierId: string) {
        const supplier = await this.supplierService.get(supplierId);
        return supplier;
    }   

    // API để lấy danh sách nhà cung cấp theo nhiều ID  
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const suppliers = await this.supplierService.listByIds(ids, paging);
        return paginatedResponse(suppliers, paging);    
    }   
}

@Controller('v1/rpc/suppliers')
export class SupplierRpcController {
    constructor(
        @Inject(SUPPLIER_SERVICE) private readonly supplierService: ISupplierService,
    ){}

    // RPC để lấy thông tin nhà cung cấp theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') supplierId: string) {
        const supplier = await this.supplierService.get(supplierId);
        return supplier;
    }   

    // RPC để lấy danh sách nhà cung cấp theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const suppliers = await this.supplierService.listByIds(ids, paging);
        return paginatedResponse(suppliers, paging);    
    }
}