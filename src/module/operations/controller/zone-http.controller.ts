import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ZONE_SERVICE } from "../operations.di-token";
import {type IZoneService } from "../ports/zone.port";
import { RolesGuard } from "src/share/guard/roles";
import { RemoteAuthGuard, Roles } from "src/share/guard";
import { getIPv4FromReq,type PagingDTO, type ReqWithRequester, UserRole } from "src/share";
import {type Request as ExpressRequest } from "express";
import type {ZoneUpdateDTO, ZoneCreatedDTO, ZoneCondDTO } from "../dtos/zone.dto";

@Controller('v1/zones')
export class ZoneHttpController {
    constructor(
        @Inject(ZONE_SERVICE) private readonly zoneService: IZoneService
    ) {}

    // API để tạo mới khu vực
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: ZoneCreatedDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.zoneService.create(requester, dto, ip, userAgent);
        return { data }; 
    }
    
    // API để cập nhật thông tin khu vực
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string, @Body() dto: ZoneUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.zoneService.update(requester, id, dto, ip, userAgent);
    }
    
    // API để xóa khu vực theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.zoneService.delete(requester, id, ip, userAgent);
    }
    
    // API để lấy thông tin khu vực theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') id: string) {
        const data = await this.zoneService.get(id);
        return { data };
    }

    // API để lấy danh sách khu vực theo điều kiện với phân trang
    @Get()
    @HttpCode(HttpStatus.OK)
    async list(@Request() req: ReqWithRequester, @Query() cond: ZoneCondDTO, @Query() paging: PagingDTO) {
        const data = await this.zoneService.list(cond, paging);
        return { data };
    }
    
    // API để lấy danh sách khu vực theo nhiều ID với phân trang
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Request() req: ReqWithRequester, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.zoneService.listByIds(ids, paging);
        return { data };
    }
}

@Controller('v1/rpc/zones')
export class ZoneRpcController {
    constructor(
        @Inject(ZONE_SERVICE) private readonly zoneService: IZoneService
    ) {}

    // RPC để lấy thông tin khu vực theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') id: string) {
        const data = await this.zoneService.get(id);
        return { data };
    }

    // RPC để lấy danh sách khu vực theo điều kiện với phân trang
    @Get()
    @HttpCode(HttpStatus.OK)
    async list(@Request() req: ReqWithRequester, @Query() cond: ZoneCondDTO, @Query() paging: PagingDTO) {
        const data = await this.zoneService.list(cond, paging);
        return { data };
    }

    // RPC để lấy danh sách khu vực theo nhiều ID với phân trang
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Request() req: ReqWithRequester, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.zoneService.listByIds(ids, paging);
        return { data };
    }
}