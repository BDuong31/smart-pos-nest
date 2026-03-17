import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Request, UseGuards, Query } from "@nestjs/common";
import { VOUCHER_SERVICE } from "../sales.di-token";
import type { IVoucherService } from "../ports/voucher.port";
import  type { Request as RequestExpress } from "express";
import { getIPv4FromReq, type PagingDTO, type ReqWithRequester } from "src/share";
import type { VoucherCondDTO, VoucherCreateDTO, VoucherUpdateDTO } from "../dtos/voucher.dto";
import { RemoteAuthGuard } from "src/share/guard";

@Controller('v1/vouchers')
export class VoucherHttpController {
    constructor(
        @Inject(VOUCHER_SERVICE) private readonly voucherService: IVoucherService,
    ) {}
    
    // API để tạo mới voucher
    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: VoucherCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.voucherService.createVoucher(requester, dto, ip, userAgent);
        return { data };
    }

    // API cập nhật thông tin voucher theo ID
    @Post(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress,@Param('id') id: string, @Body() dto: VoucherUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.voucherService.updateVoucher(requester,id, dto, ip, userAgent);
    }

    // API xóa voucher theo ID
    @Post(':id/delete')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress,@Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.voucherService.deleteVoucher(requester, id, ip, userAgent);
    }

    // API lấy thông tin voucher theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getById(@Request() req: ReqWithRequester, @Param('id') id: string) {
        const data = await this.voucherService.getVoucherById(req.requester, id,);
        return { data };
    }

    // API lấy danh sách voucher theo điều kiện với phân trang
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async list(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Query() cond: VoucherCondDTO, @Query() paging: PagingDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.voucherService.listVouchers(req.requester, paging, cond);
        return { data };
     }

     // API lấy danh sách voucher theo nhiều ID với phân trang
     @Post('list-by-ids')
     @UseGuards(RemoteAuthGuard)
     @HttpCode(HttpStatus.OK)
     async listByIds(@Request() req: ReqWithRequester, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.voucherService.listVouchersByIds(req.requester, ids, paging);
        return { data };
     }
}

@Controller('v1/rpc/vouchers')
export class VoucherRpcController {
    constructor(
        @Inject(VOUCHER_SERVICE) private readonly voucherService: IVoucherService,
    ) {}

    // RPC để lấy thông tin voucher theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Request() req: ReqWithRequester, @Param('id') id: string) {
        const data = await this.voucherService.getVoucherById(req.requester, id,);
        return { data };
    }

     // RPC để lấy danh sách voucher theo nhiều ID với phân trang
     @Post('list-by-ids')
     @HttpCode(HttpStatus.OK)
     async listByIds(@Request() req: ReqWithRequester, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.voucherService.listVouchersByIds(req.requester, ids, paging);
        return { data };
     }
}