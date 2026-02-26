import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { TABLE_SERVICE } from "../operations.di-token";
import { type ITableService } from "../ports/table.port";
import { RolesGuard } from "src/share/guard/roles";
import { RemoteAuthGuard, Roles } from "src/share/guard";
import { getIPv4FromReq,type PagingDTO, type ReqWithRequester, UserRole } from "src/share";
import {type Request as ExpressRequest } from "express";
import type { TableUpdateDTO, TableCreatedDTO, TableCondDTO } from "../dtos/table.dto";

@Controller('v1/tables')
export class TableHttpController {
    constructor(
        @Inject(TABLE_SERVICE) private readonly tableService: ITableService
    ){}

    // API để tạo mới bàn
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: TableCreatedDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.tableService.create(requester, dto, ip, userAgent);
        return { data }; 
    }

    // API để cập nhật thông tin bàn
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string,  @Body() dto: TableUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.tableService.update(requester, id, dto, ip, userAgent);
    }

    // API để xóa bàn theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.tableService.delete(requester, id, ip, userAgent);
    }

    // API để lấy thông tin bàn theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') id: string) {
        const data = await this.tableService.get(id);
        return { data };
    }

    // API để lấy danh sách bàn theo điều kiện với phân trang
    @Get()
    @HttpCode(HttpStatus.OK)
    async list(@Request() req: ReqWithRequester, @Query() cond: TableCondDTO, @Query() paging: PagingDTO) {
        const data = await this.tableService.list(cond, paging);
        return { data };
    }
     
    // API để lấy danh sách bàn theo nhiều ID với phân trang
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Request() req: ReqWithRequester, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.tableService.listByIds(ids, paging);
        return { data };
    }

    // API để lấy danh sách bàn trống theo thời gian và điều kiện với phân trang
    @Get('available')
    @HttpCode(HttpStatus.OK)
    async listByAvailable(@Request() req: ReqWithRequester, @Query('time') time: string, @Query() cond: TableCondDTO, @Query() paging: PagingDTO) {
        const timeDate = new Date(time);
        const data = await this.tableService.listByAvailable(timeDate, cond, paging);
        return { data };
    }
}

@Controller('v1/rpc/tables')
export class TableRpcController {
    constructor(
        @Inject(TABLE_SERVICE) private readonly tableService: ITableService
    ){}

    // RPC để lấy thông tin bàn theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') id: string) {
        const data = await this.tableService.get(id);
        return { data };
    }

    // RPC để lấy danh sách bàn theo điều kiện với phân trang
    @Get()
    @HttpCode(HttpStatus.OK)
    async list(@Request() req: ReqWithRequester, @Query() cond: TableCondDTO, @Query() paging: PagingDTO) {
        const data = await this.tableService.list(cond, paging);
        return { data };
    }
     
    // RPC để lấy danh sách bàn theo nhiều ID với phân trang
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Request() req: ReqWithRequester, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.tableService.listByIds(ids, paging);
        return { data };
    }

    // RPC để lấy danh sách bàn trống theo thời gian và điều kiện với phân trang
    @Get('available')
    @HttpCode(HttpStatus.OK)
    async listByAvailable(@Request() req: ReqWithRequester, @Query('time') time: string, @Query() cond: TableCondDTO, @Query() paging: PagingDTO) {
        const timeDate = new Date(time);
        const data = await this.tableService.listByAvailable(timeDate, cond, paging);
        return { data };
    }
}
