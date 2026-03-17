import { Inject, Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query, Request } from '@nestjs/common';
import { UNITCONVERSION_SERVICE } from '../inventory.di-token';
import type { IUnitConversionService } from '../ports/unitConversion.port'; 
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import type { UnitConversionCreateDTO, UnitConversionUpdateDTO, UnitConversionCondDTO } from '../dtos/unitConversion.dto';
import { getIPv4FromReq, paginatedResponse, type PagingDTO, type ReqWithRequester, UserRole } from 'src/share';
import type { Request as ExpressRequest } from 'express';

@Controller('v1/unit-conversions')
export class UnitConversionHttpController {
    constructor(
        @Inject(UNITCONVERSION_SERVICE) private readonly unitConversionService: IUnitConversionService,
    ){}

    // API để tạo mới quy đổi đơn vị
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: UnitConversionCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const unitConversion = await this.unitConversionService.create(requester, dto, ip, userAgent);
        return unitConversion;
    }

    // API để cập nhật thông tin quy đổi đơn vị theo ID
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') unitConversionId: string, @Body() dto: UnitConversionUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const updatedUnitConversion = await this.unitConversionService.update(requester, unitConversionId, dto, ip, userAgent);
        return updatedUnitConversion;
    }

     // API để xóa quy đổi đơn vị theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') unitConversionId: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.unitConversionService.delete(requester, unitConversionId, ip, userAgent);
    }   

    // API để lấy danh sách quy đổi đơn vị theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Request() req: ReqWithRequester, @Query() cond: UnitConversionCondDTO,  @Query() paging: PagingDTO) {
        const requester = req.requester;
        const unitConversions = await this.unitConversionService.list(cond, paging);
        return paginatedResponse(unitConversions, paging);
    }   

    // API để lấy thông tin quy đổi đơn vị theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') unitConversionId: string) {
        const unitConversion = await this.unitConversionService.get(unitConversionId);
        return unitConversion;
    }

    // API để lấy danh sách quy đổi đơn vị theo nhiều ID    
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const unitConversions = await this.unitConversionService.listByIds(ids, paging);
        return paginatedResponse(unitConversions, paging);
    }
}

@Controller("v1/rpc/unit-conversions")
export class UnitConversionRpcController {
    constructor(
        @Inject(UNITCONVERSION_SERVICE) private readonly unitConversionService: IUnitConversionService,
    ){}

    // RPC để lấy thông tin quy đổi đơn vị theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') unitConversionId: string) {
        const unitConversion = await this.unitConversionService.get(unitConversionId);
        return unitConversion;
    }


    // RPC để lấy danh sách quy đổi đơn vị theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const unitConversions = await this.unitConversionService.listByIds(ids, paging);
        return paginatedResponse(unitConversions, paging);
    }  
}