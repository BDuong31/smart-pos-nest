import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { TABLE_SERVICE } from "../operations.di-token";
import { type ITableService } from "../ports/table.port";
import { RolesGuard } from "src/share/guard/roles";
import { RemoteAuthGuard, Roles } from "src/share/guard";
import { AppError, getIPv4FromReq,type IPublicZoneRpc,type PagingDTO, PublicZone, type ReqWithRequester, UserRole, ZONE_RPC } from "src/share";
import {type Request as ExpressRequest } from "express";
import type { TableUpdateDTO, TableCreatedDTO, TableCondDTO } from "../dtos/table.dto";
import { ErrTableNotFound, Table } from "../models/table.model";

@Controller('v1/tables')
export class TableHttpController {
    constructor(
        @Inject(TABLE_SERVICE) private readonly tableService: ITableService,
        @Inject(ZONE_RPC) private readonly zoneRpc: IPublicZoneRpc,
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
        const result = await this.tableService.get(id);

        if (!result) {
            throw AppError.from(ErrTableNotFound, 404);
        }

        const zone = await this.zoneRpc.findById(result.zoneId);
        
        const data = { ...result, zone } as Table;
        return { data };
    }

    // API để lấy danh sách bàn theo điều kiện với phân trang
    @Get()
    @HttpCode(HttpStatus.OK)
    async list(@Request() req: ReqWithRequester, @Query() cond: TableCondDTO, @Query() paging: PagingDTO) {
        const result = await this.tableService.list(cond, paging);

        const zoneIds = result.data.map(item => item.zoneId).filter(id => id !== null);

        const zones = await this.zoneRpc.findByIds(zoneIds);

        const zoneMap: Record<string, PublicZone> = {};

        if (zones) {
            zones.forEach(zone => {
                zoneMap[zone.id] = zone;
            });
        }

        const data = result.data.map(item => {
            const zone = zoneMap[item.zoneId];
            return { ...item, zone } as Table;
        });

        return { data };
    }
     
    // API để lấy danh sách bàn theo nhiều ID với phân trang
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Request() req: ReqWithRequester, @Body('ids') ids: string[]) {
        const result = await this.tableService.listByIds(ids);

        const zoneIds = result.map(item => item.zoneId).filter(id => id !== null);

        const zones = await this.zoneRpc.findByIds(zoneIds);

        const zoneMap: Record<string, PublicZone> = {};

        if (zones) {
            zones.forEach(zone => {
                zoneMap[zone.id] = zone;
            });
        }

        const data = result.map(item => {
            const zone = zoneMap[item.zoneId];
            return { ...item, zone } as Table;
        });

        return { data };
    }

    // API để lấy danh sách bàn trống theo thời gian và điều kiện với phân trang
    @Get('available')
    @HttpCode(HttpStatus.OK)
    async listByAvailable(@Request() req: ReqWithRequester, @Query('time') time: string, @Query() cond: TableCondDTO) {
        const timeDate = new Date(time);
        const data = await this.tableService.listByAvailable(timeDate, cond);

        const zoneIds = data.map(item => item.zoneId).filter(id => id !== null);    

        const zones = await this.zoneRpc.findByIds(zoneIds);

        const zoneMap: Record<string, PublicZone> = {};

        if (zones) {
            zones.forEach(zone => {
                zoneMap[zone.id] = zone;
            });
        }

        const dataWithZone = data.map(item => {
            const zone = zoneMap[item.zoneId];
            return { ...item, zone } as Table;
        });
        
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
     
    // RPC để lấy danh sách bàn theo nhiều ID với phân trang
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Request() req: ReqWithRequester, @Body('ids') ids: string[]) {
        const data = await this.tableService.listByIds(ids);
        return { data };
    }

    // RPC để lấy danh sách bàn trống theo thời gian và điều kiện với phân trang
    @Get('available')
    @HttpCode(HttpStatus.OK)
    async listByAvailable(@Request() req: ReqWithRequester, @Query('time') time: string, @Query() cond: TableCondDTO) {
        const timeDate = new Date(time);
        const data = await this.tableService.listByAvailable(timeDate, cond);
        return { data };
    }
}
