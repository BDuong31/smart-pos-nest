import { Inject, Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query, Request } from '@nestjs/common';    
import { INVENTORYBATCH_SERVICE } from '../inventory.di-token';
import type { IInventoryBatchService } from '../ports/inventoryBatch.port';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import type { InventoryBatchCreateDTO, InventoryBatchUpdateDTO, InventoryBatchCondDTO } from '../dtos/inventoryBatch.dto';
import { getIPv4FromReq, paginatedResponse, type PagingDTO, type ReqWithRequester, UserRole } from 'src/share';
import type { Request as ExpressRequest } from 'express';

@Controller('v1/inventory-batches')
export class InventoryBatchHttpController {
    constructor(
        @Inject(INVENTORYBATCH_SERVICE) private readonly inventoryBatchService: IInventoryBatchService,
    ){}
    
    // API để tạo mới lô hàng tồn kho
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: InventoryBatchCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const inventoryBatch = await this.inventoryBatchService.create(requester, dto, ip, userAgent);
        return inventoryBatch;
    }

    // API để cập nhật thông tin lô hàng tồn kho theo ID
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') inventoryBatchId: string, @Body() dto: InventoryBatchUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const updatedInventoryBatch = await this.inventoryBatchService.update(requester, inventoryBatchId, dto, ip, userAgent);
        return updatedInventoryBatch;
    }

     // API để xóa lô hàng tồn kho theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') inventoryBatchId: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.inventoryBatchService.delete(requester, inventoryBatchId, ip, userAgent);
    }

    // API để lấy danh sách lô hàng tồn kho theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: InventoryBatchCondDTO,  @Query() paging: PagingDTO) {
        const inventoryBatches = await this.inventoryBatchService.list(cond, paging);
        return paginatedResponse(inventoryBatches, paging);
    }

    // API để lấy thông tin lô hàng tồn kho theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') inventoryBatchId: string) {
        const inventoryBatch = await this.inventoryBatchService.get(inventoryBatchId);
        return inventoryBatch;
    }

    // API để lấy thông tin lô hàng tồn kho theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[],  @Query() paging: PagingDTO) {
        const inventoryBatches = await this.inventoryBatchService.listByIds(ids, paging);
        return paginatedResponse(inventoryBatches, paging); 
    }
}

@Controller('v1/rpc/inventory-batches')
export class InventoryBatchRpcController {
    constructor(
        @Inject(INVENTORYBATCH_SERVICE) private readonly inventoryBatchService: IInventoryBatchService,
    ){}

    // RPC để lấy thông tin lô hàng tồn kho theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') inventoryBatchId: string) {
        const inventoryBatch = await this.inventoryBatchService.get(inventoryBatchId);
        return inventoryBatch;
    }

    // RPC để lấy thông tin lô hàng tồn kho theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[],  @Query() paging: PagingDTO) {
        const inventoryBatches = await this.inventoryBatchService.listByIds(ids, paging);
        return paginatedResponse(inventoryBatches, paging); 
    }
}