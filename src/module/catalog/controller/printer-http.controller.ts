import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { PRINTER_SERVICE } from "../catalog.di-token";
import type { IPrinterService } from "../ports/printer.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { getIPv4FromReq, paginatedResponse, type PagingDTO, pagingDTOSchema, type ReqWithRequester, UserRole } from "src/share";
import { type PrinterCondDTO, createPrinterDTOSchema, type CreatePrinterDTO, type UpdatePrinterDTO, updatePrinterDTOSchema, printerCondDTOSchema } from "../dtos/printer.dto";
import type { Request as ExpressRequest } from "express";
import { ApiCreatedResponse, ApiOperation } from "@nestjs/swagger";

// Lớp PrinterHttpController xử lý các yêu cầu HTTP liên quan đến máy in
@Controller('v1/printers')
export class PrinterHttpController {
    constructor(
        @Inject(PRINTER_SERVICE) private readonly printerService: IPrinterService, 
    ){}

    // API tạo mới máy in
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Tạo mới máy in' })
    @ApiCreatedResponse({ description: 'Máy in được tạo thành công' })
    async create(@Request() req: ReqWithRequester,@Request() reqExpress: ExpressRequest, @Body() dto: CreatePrinterDTO){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const data = await this.printerService.createPrinter(req.requester, dto, ip, userAgent);
        return { data };
    }

    // API cập nhật thông tin máy in
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cập nhật thông tin máy in' })
    @ApiCreatedResponse({ description: 'Thông tin máy in được cập nhật thành công' })
    async update(@Request() req: ReqWithRequester,@Request() reqExpress: ExpressRequest, @Param('id') id: string, @Body() dto: UpdatePrinterDTO){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const data = await this.printerService.updatePrinter(req.requester, id, dto, ip, userAgent);
        return { data };
    }

    // API xóa máy in
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Xóa máy in' })
    @ApiCreatedResponse({ description: 'Máy in được xóa thành công' })
    async delete(@Request() req: ReqWithRequester,@Request() reqExpress: ExpressRequest, @Param('id') id: string){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.printerService.deletePrinter(req.requester, id, ip, userAgent);
    }

    // API lấy thông tin máy in theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy thông tin máy in theo ID' })
    @ApiCreatedResponse({ description: 'Thông tin máy in được lấy thành công' })
    async get(@Param('id') id: string){
        const data = await this.printerService.getPrinterById(id);
        return { data };
    }

    // API lấy danh sách máy in theo điều kiện
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy danh sách máy in theo điều kiện' })
    @ApiCreatedResponse({ description: 'Danh sách máy in được lấy thành công' })
    async list(@Query() query: PrinterCondDTO, @Query() pagingQuery: PagingDTO){
        const cond = printerCondDTOSchema.parse(query);
        const paging = pagingDTOSchema.parse(pagingQuery);
        const data = await this.printerService.getListPrinter(cond, paging);
        return paginatedResponse(data, query);
    }

    // API lấy danh sách máy in theo mảng IDs
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy danh sách máy in theo mảng IDs' })
    @ApiCreatedResponse({ description: 'Danh sách máy in được lấy thành công' })
    async listByIds(@Body('ids') ids: string[]){
        const data = await this.printerService.getPrinterByIds(ids);
        return { data };
    }
}

@Controller('v1/rpc/printers')
export class PrinterRpcController {
    constructor(
        @Inject(PRINTER_SERVICE) private readonly printerService: IPrinterService, 
    ){}

    // RPC lấy thông tin máy in theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'RPC: Lấy thông tin máy in theo ID' })
    async get(@Param('id') id: string){
        const data = await this.printerService.getPrinterById(id);
        return { data };
    }

    // RPC lấy danh sách máy in theo điều kiện
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'RPC: Lấy danh sách máy in theo điều kiện' })
    async list(@Query() query: PrinterCondDTO, @Query() pagingQuery: PagingDTO){
        const cond = printerCondDTOSchema.parse(query);
        const paging = pagingDTOSchema.parse(pagingQuery);
        const data = await this.printerService.getListPrinter(cond, paging);
        return paginatedResponse(data, query);
    }

    // RPC lấy danh sách máy in theo mảng IDs
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'RPC: Lấy danh sách máy in theo mảng IDs' })
    async listByIds(@Body('ids') ids: string[], @Query() pagingQuery: PagingDTO){
        const data = await this.printerService.getPrinterByIds(ids);
        return { data };
    }
}