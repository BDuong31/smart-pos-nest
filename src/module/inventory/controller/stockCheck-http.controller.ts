import { Inject, Controller, Get, Query, HttpCode, HttpStatus, UseGuards, Post, Body, Patch, Delete, Param } from '@nestjs/common';
import { STOCKCHECK_SERVICE } from '../inventory.di-token';
import type { IStockCheckService } from '../ports/stockCheck.port';
import { stockCheckCondDTOSchema, type StockCheckCreateDTO, type StockCheckUpdateDTO } from '../dtos/stockCheck.dto';
import { Request } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { getIPv4FromReq, USER_RPC, type ReqWithRequester, type IPublicUserRpc, AppError, pagingDTOSchema, PublicUser } from 'src/share';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import type { StockCheckCondDTO } from '../dtos/stockCheck.dto';
import { paginatedResponse, type PagingDTO, UserRole } from 'src/share';
import { ErrStockCheckNotFound, StockCheck } from '../models/stockCheck.model';

@Controller('v1/stock-checks')
export class StockCheckHttpController {
    constructor(
        @Inject(STOCKCHECK_SERVICE) private readonly stockCheckService: IStockCheckService,
        @Inject(USER_RPC) private readonly userRpc: IPublicUserRpc,
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
        const data = await this.stockCheckService.create(requester, dto, ip, userAgent);
        return { data };
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
        const data = await this.stockCheckService.update(requester, id, dto, ip, userAgent);
        return { data };
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
        const result = await this.stockCheckService.get(id);

        if (!result) {
            throw AppError.from(ErrStockCheckNotFound, 404);
        }

        const user = await this.userRpc.getUserById(result.userId);

        const data = { ...result, user } as StockCheck;
        return { data };
    }

    // API lấy danh sách kiểm kê tồn kho theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: StockCheckCondDTO, @Query() paging: PagingDTO) {
        paging = pagingDTOSchema.parse(paging);
        cond = stockCheckCondDTOSchema.parse(cond);

        const result = await this.stockCheckService.list(cond, paging);

        const userIds = result.data.map(stockCheck => stockCheck.userId).filter(userId => !!userId);
        const users = await this.userRpc.getUsersByIds(userIds);

        const userMap: Record<string, PublicUser> = {};

        if (users) {
            users.map(user => {
                userMap[user.id] = user;
            })
        }

        result.data.map(stockCheck => {
            const user = userMap[stockCheck.userId];
            return { ...stockCheck, user } as StockCheck;
        })

        return paginatedResponse(result, paging);
     }

    // API lấy danh sách kiểm kê tồn kho theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body() ids: string[]) {
        const data = await this.stockCheckService.listByIds(ids);
        return { data };
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
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body() ids: string[]) {
        const data = await this.stockCheckService.listByIds(ids);
        return { data };    
    }
}