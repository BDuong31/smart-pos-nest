import { Controller, HttpCode, HttpStatus, Inject, Post, UseGuards, Request, Body, Param, Patch, Delete, Get, Query } from "@nestjs/common";
import { OPTION_SERVICE } from "../catalog.di-token";
import {type IOptionService } from "../ports/option.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { getIPv4FromReq,type PagingDTO, type ReqWithRequester, UserRole } from "src/share";
import { type Request as RequestExpress } from 'express';
import type { CreateOptionGroupDTO, CreateOptionItemDTO, CreateProductOptionConfigDTO, OptionGroupCondDTO, OptionItemCondDTO, UpdateOptionItemDTO } from "../dtos/option.dto";
import { ProductOptionConfig } from "../models/option.model";
@Controller('v1/options')
export class OptionHttpController {
    constructor(
        @Inject(OPTION_SERVICE) private readonly optionService: IOptionService,
    ){}
    // ============================
    // HTTP Controller cho Option Group
    // ============================

    // API tạo Option Group mới
    @Post('group')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createOptionGroup(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: CreateOptionGroupDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        return await this.optionService.createOptionGroup(requester, dto, ip, userAgent);
    }

    // API cập nhật Option Group
    @Patch('group/:id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async updateOptionGroup(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: CreateOptionGroupDTO, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        return await this.optionService.updateOptionGroup(requester, id, dto, ip, userAgent);
    }

    // API xóa Option Group
    @Delete('group/:id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteOptionGroup(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        return await this.optionService.deleteOptionGroup(requester, id, ip, userAgent);
    }

    // API lấy thông tin Option Group theo ID
    @Get('group/:id')
    @HttpCode(HttpStatus.OK)
    async getOptionGroupById(@Param('id') id: string) {
        return await this.optionService.getOptionGroupById(id);
     }

    // API lấy danh sách Option Group theo điều kiện lọc
    @Get('group')
    @HttpCode(HttpStatus.OK)
    async getListOptionGroup(@Body() cond: OptionGroupCondDTO, @Query() paging: PagingDTO) {
        return await this.optionService.getListOptionGroup(cond, paging);
    }

    // API lấy danh sách Option Group theo mảng IDs
    @Get('group/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async getListOptionGroupByIds(@Body() ids: string[], @Query() paging: PagingDTO) {
        return await this.optionService.getOptionGroupByIds(ids, paging);
    }

    // ============================
    // HTTP Controller cho Option Item
    // ============================

    // API tạo Option Item mới
    @Post('group/:groupId/item')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createOptionItem(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: CreateOptionItemDTO, @Param('groupId') groupId: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        return await this.optionService.createOptionItem(requester, groupId, dto, ip, userAgent);
     }

    // API cập nhật Option Item
    @Patch('group/:groupId/item/:itemId')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async updateOptionItem(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: UpdateOptionItemDTO, @Param('groupId') groupId: string, @Param('itemId') itemId: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        return await this.optionService.updateOptionItem(requester, groupId, itemId, dto, ip, userAgent);
     }

    // API xóa Option Item
    @Delete('group/:groupId/item/:itemId')  
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteOptionItem(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('groupId') groupId: string, @Param('itemId') itemId: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        return await this.optionService.deleteOptionItem(requester, groupId, itemId, ip, userAgent);
     }  

    // API lấy thông tin Option Item theo ID
    @Get('group/:groupId/item/:itemId')
    @HttpCode(HttpStatus.OK)
    async getOptionItemById(@Param('groupId') groupId: string, @Param('itemId') itemId: string) {
        return await this.optionService.getOptionItemById(groupId, itemId);
     }

    // API lấy danh sách Option Item theo điều kiện lọc
    @Get('group/:groupId/item') 
    @HttpCode(HttpStatus.OK)
    async getListOptionItem(@Body() cond: OptionItemCondDTO, @Query() paging: PagingDTO) {
        return await this.optionService.getListOptionItem(cond, paging);
     }

    // API lấy danh sách Option Item theo mảng IDs
    @Get('group/:groupId/item/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async getListOptionItemByIds(@Param('groupId') groupId: string, @Body() ids: string[], @Query() paging: PagingDTO) {
        return await this.optionService.getOptionItemsByIds(groupId, ids, paging);  
    }
   
    // ============================
    // HTTP Controller cho Product Option Config
    // ============================

    // API thiết lập cấu hình Option cho sản phẩm
    @Post('product/:productId/config')  
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async setProductOptionConfig(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: CreateProductOptionConfigDTO, @Param('productId') productId: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        return await this.optionService.setProductOptionConfig(requester, productId, dto, ip, userAgent);
     }

    // API lấy cấu hình Option của sản phẩm
    @Get('product/:productId/config')
    @HttpCode(HttpStatus.OK)
    async getProductOptionConfig(@Param('productId') productId: string) {
        return await this.optionService.getProductOptionConfig(productId);
     }
}

@Controller('v1/rpc/options')
export class OptionRpcController {
    constructor(
        @Inject(OPTION_SERVICE) private readonly optionService: IOptionService,
     ) {}
    // ============================
    // RPC Controller cho Option Group
    // ============================

    // RPC lấy thông tin Option Group theo ID
    @Get('group/:id')
    @HttpCode(HttpStatus.OK)
    async getOptionGroupById(@Param('id') id: string) {
        return await this.optionService.getOptionGroupById(id);
     }

    // RPC lấy danh sách Option Group theo điều kiện lọc
    @Get('group')
    @HttpCode(HttpStatus.OK)
    async getListOptionGroup(@Body() cond: OptionGroupCondDTO, @Query() paging: PagingDTO) {
        return await this.optionService.getListOptionGroup(cond, paging);
     }

    // RPC lấy danh sách Option Group theo mảng IDs
    @Get('group/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async getListOptionGroupByIds(@Body() ids: string[], @Query() paging: PagingDTO) {
        return await this.optionService.getOptionGroupByIds(ids, paging);
     }

    // ============================
    // RPC Controller cho Option Item
    // ============================

    // RPC lấy thông tin Option Item theo ID
    @Get('group/:groupId/item/:itemId')
    @HttpCode(HttpStatus.OK)
    async getOptionItemById(@Param('groupId') groupId: string, @Param('itemId') itemId: string) {
        return await this.optionService.getOptionItemById(groupId, itemId);
     }

    // RPC lấy danh sách Option Item theo điều kiện lọc
    @Get('group/:groupId/item')
    @HttpCode(HttpStatus.OK)
    async getListOptionItem(@Body() cond: OptionItemCondDTO, @Query() paging: PagingDTO) {
        return await this.optionService.getListOptionItem(cond, paging);
     }

    // RPC lấy danh sách Option Item theo mảng IDs
    @Get('group/:groupId/item/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async getListOptionItemByIds(@Param('groupId') groupId: string, @Body() ids: string[], @Query() paging: PagingDTO) {
        return await this.optionService.getOptionItemsByIds(groupId, ids, paging);
     }
   
    // ============================
    // RPC Controller cho Product Option Config
    // ============================

    // RPC lấy cấu hình Option của sản phẩm
    @Get('product/:productId/config')
    @HttpCode(HttpStatus.OK)
    async getProductOptionConfig(@Param('productId') productId: string) {
        return await this.optionService.getProductOptionConfig(productId);
     }
}