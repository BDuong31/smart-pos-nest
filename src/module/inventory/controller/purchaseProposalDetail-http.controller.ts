import { Inject, Controller, Get, Query, HttpCode, HttpStatus, UseGuards, Post, Body, Patch, Delete, Param } from '@nestjs/common';
import { PURCHASEPROPOSALDETAIL_SERVICE } from '../inventory.di-token';
import type { IPurchaseProposalDetailService } from '../ports/purchaseProposalDetail.port';
import { purchaseProposalDetailCondDTOSchema, type PurchaseProposalDetailCreateDTO, type PurchaseProposalDetailUpdateDTO } from '../dtos/purchaseProposalDetail.dto';
import { Request } from '@nestjs/common';
import { type Request as ExpressRequest } from 'express';
import { AppError, getIPv4FromReq, INGREDIENT_RPC,pagingDTOSchema,PublicIngredient,type IPublicIngredientRpc, type ReqWithRequester } from 'src/share';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import type { PurchaseProposalDetailCondDTO } from '../dtos/purchaseProposalDetail.dto';
import { paginatedResponse, type PagingDTO, UserRole } from 'src/share';
import { ErrPurchaseProposalNotFound } from '../models/purchaseProposal.model';
import { PurchaseProposalDetail } from '../models/purchaseProposalDetail.model';

@Controller('v1/purchase-proposal-details') 
export class PurchaseProposalDetailHttpController {
    constructor(
        @Inject(PURCHASEPROPOSALDETAIL_SERVICE) private readonly purchaseProposalDetailService: IPurchaseProposalDetailService,
        @Inject(INGREDIENT_RPC) private readonly ingredientRpc: IPublicIngredientRpc,
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
        const data = await this.purchaseProposalDetailService.create(requester, dto, ip, userAgent);
        return { data };
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
        const data = await this.purchaseProposalDetailService.update(requester, id, dto, ip, userAgent);
        return { data };
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
        const result = await this.purchaseProposalDetailService.get(id);

        if (!result) {
            throw AppError.from(ErrPurchaseProposalNotFound, 404);
        }

        const ingredient = await this.ingredientRpc.findById(result.ingredientId);

        const data = { ...result, ingredient } as PurchaseProposalDetail;
        return { data };
    }

    // API lấy danh sách chi tiết đề xuất mua hàng theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: PurchaseProposalDetailCondDTO, @Query() paging: PagingDTO) {
        paging = pagingDTOSchema.parse(paging);
        cond = purchaseProposalDetailCondDTOSchema.parse(cond);

        const result = await this.purchaseProposalDetailService.list(cond, paging);
        
        const ingredientIds = result.data.map(item => item.ingredientId);

        const ingredients = await this.ingredientRpc.findByIds(ingredientIds);

        const ingredientMap: Record<string, PublicIngredient> = {};

        if (ingredients) {
            ingredients.map(ingredient => {
                ingredientMap[ingredient.id] = ingredient;
            })
        }

        result.data = result.data.map(item => {
            const ingredient = ingredientMap[item.ingredientId];
            return { ...item, ingredient } as PurchaseProposalDetail
        })

        return paginatedResponse(result, paging);
    }

    // API lấy thông tin chi tiết đề xuất mua hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const result = await this.purchaseProposalDetailService.listByIds(ids);

        const ingredientIds = result.map(item => item.ingredientId);

        const ingredients = await this.ingredientRpc.findByIds(ingredientIds);

        const ingredientMap: Record<string, PublicIngredient> = {};

        if (ingredients) {
            ingredients.map(ingredient => {
                ingredientMap[ingredient.id] = ingredient;
            }) 
        }

        const data = result.map(item => {
            const ingredient = ingredientMap[item.ingredientId];
            return { ...item, ingredient } as PurchaseProposalDetail
        });
        
        return { data };
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
        const data = await this.purchaseProposalDetailService.get(id);
        return { data };
     }

    // RPC lấy thông tin chi tiết đề xuất mua hàng theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const data = await this.purchaseProposalDetailService.listByIds(ids);
        return { data };
    }
}