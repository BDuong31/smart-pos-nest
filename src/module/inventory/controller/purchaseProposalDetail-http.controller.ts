import { Inject, Controller, Get, Query, HttpCode, HttpStatus, UseGuards, Post, Body, Patch, Delete, Param } from '@nestjs/common';
import { PURCHASEPROPOSALDETAIL_SERVICE } from '../inventory.di-token';
import type { IPurchaseProposalDetailService } from '../ports/purchaseProposalDetail.port';
import type { PurchaseProposalDetailCreateDTO, PurchaseProposalDetailUpdateDTO } from '../dtos/purchaseProposalDetail.dto';
import { Request } from '@nestjs/common';
import { type Request as ExpressRequest } from 'express';
import { getIPv4FromReq, type ReqWithRequester } from 'src/share';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import type { PurchaseProposalDetailCondDTO } from '../dtos/purchaseProposalDetail.dto';
import { paginatedResponse, type PagingDTO, UserRole } from 'src/share';

@Controller('v1/purchase-proposal-details') 
export class PurchaseProposalDetailHttpController {
    constructor(
        @Inject(PURCHASEPROPOSALDETAIL_SERVICE) private readonly purchaseProposalDetailService: IPurchaseProposalDetailService,
    ){} 

    // API tạo mới chi tiết đề xuất mua hàng
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: PurchaseProposalDetailCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const purchaseProposalDetail = await this.purchaseProposalDetailService.create(requester, dto, ip, userAgent);
        return purchaseProposalDetail;
    }

    // API cập nhật chi tiết đề xuất mua hàng theo ID
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string, @Body() dto: PurchaseProposalDetailUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const purchaseProposalDetail = await this.purchaseProposalDetailService.update(requester, id, dto, ip, userAgent);
        return purchaseProposalDetail;
    }

    // API xóa chi tiết đề xuất mua hàng theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.purchaseProposalDetailService.delete(requester, id, ip, userAgent);
    }

    // API lấy chi tiết đề xuất mua hàng theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const purchaseProposalDetail = await this.purchaseProposalDetailService.get(id);
        return purchaseProposalDetail;
    }

    // API lấy danh sách chi tiết đề xuất mua hàng theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: PurchaseProposalDetailCondDTO, @Query() paging: PagingDTO) {
        const purchaseProposalDetails = await this.purchaseProposalDetailService.list(cond, paging);
        return paginatedResponse(purchaseProposalDetails, paging);
    }

    // API lấy thông tin chi tiết đề xuất mua hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const purchaseProposalDetails = await this.purchaseProposalDetailService.listByIds(ids, paging);
        return paginatedResponse(purchaseProposalDetails, paging);
    }
}

@Controller('v1/rpc/purchase-proposal-details')
export class PurchaseProposalDetailRpcController {
    constructor(
        @Inject(PURCHASEPROPOSALDETAIL_SERVICE) private readonly purchaseProposalDetailService: IPurchaseProposalDetailService,
    ){}

    // RPC lấy chi tiết đề xuất mua hàng theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const purchaseProposalDetail = await this.purchaseProposalDetailService.get(id);
        return purchaseProposalDetail;
     }

    // RPC lấy thông tin chi tiết đề xuất mua hàng theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const purchaseProposalDetails = await this.purchaseProposalDetailService.listByIds(ids, paging);
        return paginatedResponse(purchaseProposalDetails, paging);
    }
}