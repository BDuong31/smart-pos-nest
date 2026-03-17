import { Inject, Controller, Get, Query, HttpCode, HttpStatus, UseGuards, Post, Body, Patch, Delete, Param } from '@nestjs/common';
import { STOCKCHECKDETAIL_SERVICE } from '../inventory.di-token';
import type { IStockCheckDetailService } from '../ports/stockCheckDetail.port';
import type { StockCheckDetailCreateDTO, StockCheckDetailUpdateDTO } from '../dtos/stockCheckDetail.dto';
import { Request } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { getIPv4FromReq, type ReqWithRequester } from 'src/share';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import type { StockCheckDetailCondDTO } from '../dtos/stockCheckDetail.dto';
import { paginatedResponse, type PagingDTO, UserRole } from 'src/share';

@Controller('v1/stock-check-details')
export class StockCheckDetailHttpController {
    constructor(
        @Inject(STOCKCHECKDETAIL_SERVICE) private readonly stockCheckDetailService: IStockCheckDetailService,
    ){}

    // API tạo mới chi tiết kiểm kê tồn kho
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: StockCheckDetailCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const stockCheckDetail = await this.stockCheckDetailService.create(requester, dto, ip, userAgent);
        return stockCheckDetail;
    }

    // API cập nhật chi tiết kiểm kê tồn kho theo ID
    @Patch(':id')   
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string, @Body() dto: StockCheckDetailUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const stockCheckDetail = await this.stockCheckDetailService.update(requester, id, dto, ip, userAgent);
        return stockCheckDetail;
    }
    
    // API xóa chi tiết kiểm kê tồn kho theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.stockCheckDetailService.delete(requester, id, ip, userAgent);
    }

    // API lấy chi tiết kiểm kê tồn kho theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const stockCheckDetail = await this.stockCheckDetailService.get(id);
        return stockCheckDetail;
     }

    // API lấy danh sách chi tiết kiểm kê tồn kho theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: StockCheckDetailCondDTO, @Query() paging: PagingDTO) {
        const stockCheckDetails = await this.stockCheckDetailService.list(cond, paging);
        return stockCheckDetails;
    }

    // RPC lấy thông tin chi tiết kiểm kê tồn kho theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const stockCheckDetails = await this.stockCheckDetailService.listByIds(ids, paging);
        return stockCheckDetails;
     }
}

@Controller('v1/rpc/stock-check-details')
export class StockCheckDetailRpcController {
    constructor(
        @Inject(STOCKCHECKDETAIL_SERVICE) private readonly stockCheckDetailService: IStockCheckDetailService,
    ){}

    // RPC lấy thông tin chi tiết kiểm kê tồn kho theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const stockCheckDetail = await this.stockCheckDetailService.get(id);
        return stockCheckDetail;
     }

    // RPC lấy thông tin chi tiết kiểm kê tồn kho theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const stockCheckDetails = await this.stockCheckDetailService.listByIds(ids, paging);
        return stockCheckDetails;
    }
}