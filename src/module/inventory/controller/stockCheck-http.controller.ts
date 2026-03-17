import { Inject, Controller, Get, Query, HttpCode, HttpStatus, UseGuards, Post, Body, Patch, Delete, Param } from '@nestjs/common';
import { STOCKCHECK_SERVICE } from '../inventory.di-token';
import type { IStockCheckService } from '../ports/stockCheck.port';
import type { StockCheckCreateDTO, StockCheckUpdateDTO } from '../dtos/stockCheck.dto';
import { Request } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { getIPv4FromReq, type ReqWithRequester } from 'src/share';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import type { StockCheckCondDTO } from '../dtos/stockCheck.dto';
import { paginatedResponse, type PagingDTO, UserRole } from 'src/share';

@Controller('v1/stock-checks')
export class StockCheckHttpController {
    constructor(
        @Inject(STOCKCHECK_SERVICE) private readonly stockCheckService: IStockCheckService,
    ){}

    // API tạo mới kiểm kê tồn kho
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: StockCheckCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const stockCheck = await this.stockCheckService.create(requester, dto, ip, userAgent);
        return stockCheck;
    }

    // API cập nhật kiểm kê tồn kho theo ID
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string, @Body() dto: StockCheckUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const stockCheck = await this.stockCheckService.update(requester, id, dto, ip, userAgent);
        return stockCheck;
    }

    // API xóa kiểm kê tồn kho theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.stockCheckService.delete(requester, id, ip, userAgent);
    }

    // API lấy kiểm kê tồn kho theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const stockCheck = await this.stockCheckService.get(id);
        return stockCheck;
    }

    // API lấy danh sách kiểm kê tồn kho theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: StockCheckCondDTO, @Query() paging: PagingDTO) {
        const stockChecks = await this.stockCheckService.list(cond, paging);
        return paginatedResponse(stockChecks, paging);
     }

    // API lấy danh sách kiểm kê tồn kho theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body() ids: string[], @Query() paging: PagingDTO) {
        const stockChecks = await this.stockCheckService.listByIds(ids, paging);
        return paginatedResponse(stockChecks, paging);
    }

}

@Controller('v1/rpc/stock-checks')
export class StockCheckRpcController {
    constructor(
        @Inject(STOCKCHECK_SERVICE) private readonly stockCheckService: IStockCheckService,
    ){}

    // RPC lấy thông tin kiểm kê tồn kho theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const stockCheck = await this.stockCheckService.get(id);
        return stockCheck;
     }

    // RPC lấy danh sách kiểm kê tồn kho theo điều kiện
    @Get()
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: StockCheckCondDTO, @Query() paging: PagingDTO) {
        const stockChecks = await this.stockCheckService.list(cond, paging);
        return paginatedResponse(stockChecks, paging);
     }
}