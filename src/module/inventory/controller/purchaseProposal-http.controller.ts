import { Inject, Controller, Get, Query, HttpCode, HttpStatus, UseGuards, Post, Body, Patch, Delete, Param } from '@nestjs/common';
import { PURCHASEPROPOSAL_SERVICE } from '../inventory.di-token';
import type { IPurchaseProposalService } from '../ports/purchaseProposal.port';
import type { PurchaseProposalCreateDTO, PurchaseProposalUpdateDTO } from '../dtos/purchaseProposal.dto';
import { Request } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { getIPv4FromReq, type ReqWithRequester } from 'src/share';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import type { PurchaseProposalCondDTO } from '../dtos/purchaseProposal.dto';
import { paginatedResponse, type PagingDTO, UserRole } from 'src/share';

@Controller('v1/purchase-proposals')
export class PurchaseProposalHttpController {
    constructor(
        @Inject(PURCHASEPROPOSAL_SERVICE) private readonly purchaseProposalService: IPurchaseProposalService,
    ){}

    // API tạo mới đề xuất mua hàng
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: PurchaseProposalCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const purchaseProposal = await this.purchaseProposalService.create(requester, dto, ip, userAgent);
        return purchaseProposal;
    }

    // API cập nhật đề xuất mua hàng theo ID
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string, @Body() dto: PurchaseProposalUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const purchaseProposal = await this.purchaseProposalService.update(requester, id, dto, ip, userAgent);
        return purchaseProposal;
     }

    // API xóa đề xuất mua hàng theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.purchaseProposalService.delete(requester, id, ip, userAgent);
     }

    // API lấy đề xuất mua hàng theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const purchaseProposal = await this.purchaseProposalService.get(id);
        return purchaseProposal;
     }

    // API lấy danh sách đề xuất mua hàng theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: PurchaseProposalCondDTO, @Query() paging: PagingDTO) {
        const purchaseProposals = await this.purchaseProposalService.list(cond, paging);
        return paginatedResponse(purchaseProposals, paging);
     }

    // API lấy danh sách đề xuất mua hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const purchaseProposals = await this.purchaseProposalService.listByIds(ids, paging);
        return paginatedResponse(purchaseProposals, paging);
    }
}

@Controller('v1/rpc/purchase-proposals')
export class PurchaseProposalRpcController {
    constructor(
        @Inject(PURCHASEPROPOSAL_SERVICE) private readonly purchaseProposalService: IPurchaseProposalService,
    ){}

    // RPC tạo mới đề xuất mua hàng cho AI agent
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: PurchaseProposalCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const purchaseProposal = await this.purchaseProposalService.create(requester, dto, ip, userAgent);
        return purchaseProposal;
    }
    
    // RPC cập nhật đề xuất mua hàng cho AI agent
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string, @Body() dto: PurchaseProposalUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const purchaseProposal = await this.purchaseProposalService.update(requester, id, dto, ip, userAgent);
        return purchaseProposal;
     }

    // RPC xóa đề xuất mua hàng cho AI agent
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.purchaseProposalService.delete(requester, id, ip, userAgent);
     }

    // RPC lấy đề xuất mua hàng theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const purchaseProposal = await this.purchaseProposalService.get(id);
        return purchaseProposal;
     }

    // RPC lấy danh sách đề xuất mua hàng theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const purchaseProposals = await this.purchaseProposalService.listByIds(ids, paging);
        return paginatedResponse(purchaseProposals, paging);
    }
}