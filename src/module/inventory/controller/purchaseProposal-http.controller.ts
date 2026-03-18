import { Inject, Controller, Get, Query, HttpCode, HttpStatus, UseGuards, Post, Body, Patch, Delete, Param } from '@nestjs/common';
import { PURCHASEPROPOSAL_SERVICE } from '../inventory.di-token';
import type { IPurchaseProposalService } from '../ports/purchaseProposal.port';
import { purchaseProposalCondDTOSchema, type PurchaseProposalCreateDTO, type PurchaseProposalUpdateDTO } from '../dtos/purchaseProposal.dto';
import { Request } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { getIPv4FromReq, type IPublicUserRpc, USER_RPC, type ReqWithRequester, AppError, pagingDTOSchema, PublicUser } from 'src/share';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import type { PurchaseProposalCondDTO } from '../dtos/purchaseProposal.dto';
import { paginatedResponse, type PagingDTO, UserRole } from 'src/share';
import { ErrPurchaseProposalNotFound, PurchaseProposal } from '../models/purchaseProposal.model';

@Controller('v1/purchase-proposals')
export class PurchaseProposalHttpController {
    constructor(
        @Inject(PURCHASEPROPOSAL_SERVICE) private readonly purchaseProposalService: IPurchaseProposalService,
        @Inject(USER_RPC) private readonly userRpc: IPublicUserRpc,
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
        const data = await this.purchaseProposalService.create(requester, dto, ip, userAgent);
        return { data };
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
        const data = await this.purchaseProposalService.update(requester, id, dto, ip, userAgent);
        return { data };
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
        const result = await this.purchaseProposalService.get(id);

        if (!result) {
            throw AppError.from(ErrPurchaseProposalNotFound, 404);
        }

        let data;

        if (result.creatorId) {
            const creator = await this.userRpc.getUserById(result.creatorId);
            data = { ...result, creator };
        } else {
            data = result;
        }

        return { data };
     }

    // API lấy danh sách đề xuất mua hàng theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: PurchaseProposalCondDTO, @Query() paging: PagingDTO) {
        paging = pagingDTOSchema.parse(paging);
        cond = purchaseProposalCondDTOSchema.parse(cond);

        const result = await this.purchaseProposalService.list(cond, paging);

        const creatorIds = result.data.map(item => item.creatorId).filter(id => id) as string[];

        const creators = await this.userRpc.getUsersByIds(creatorIds);

        const creatorMap: Record<string, PublicUser> = {};

        if (creators) {
            creators.forEach(creator => {
                creatorMap[creator.id] = creator;
            })
        }

        result.data = result.data.map(item => {
            const creator = item.creatorId ? creatorMap[item.creatorId] : null;
            return { ...item, creator } as PurchaseProposal;
        });
        
        return paginatedResponse(result, paging);
     }

    // API lấy danh sách đề xuất mua hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const result = await this.purchaseProposalService.listByIds(ids);

        const creatorIds = result.map(item => item.creatorId).filter(id => id) as string[];

        const creators = await this.userRpc.getUsersByIds(creatorIds);

        const creatorMap: Record<string, PublicUser> = {};

        if (creators) {
            creators.forEach(creator => {
                creatorMap[creator.id] = creator;
            })
        }

        const data = result.map(item => {
            const creator = item.creatorId ? creatorMap[item.creatorId] : null;
            return { ...item, creator } as PurchaseProposal;
        });
        return { data };
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
        const data = await this.purchaseProposalService.create(requester, dto, ip, userAgent);
        return { data };
    }
    
    // RPC cập nhật đề xuất mua hàng cho AI agent
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string, @Body() dto: PurchaseProposalUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const data = await this.purchaseProposalService.update(requester, id, dto, ip, userAgent);
        return { data };
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
        const data = await this.purchaseProposalService.get(id);
        return { data };
     }

    // RPC lấy danh sách đề xuất mua hàng theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const data = await this.purchaseProposalService.listByIds(ids);
        return { data };
    }
}