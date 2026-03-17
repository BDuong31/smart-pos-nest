import { Inject, Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query, Request } from '@nestjs/common';    
import { INVENTORYBATCH_SERVICE } from '../inventory.di-token';
import type { IInventoryBatchService } from '../ports/inventoryBatch.port';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import { type InventoryBatchCreateDTO, type InventoryBatchUpdateDTO, type InventoryBatchCondDTO, inventoryBatchCondDTOSchema } from '../dtos/inventoryBatch.dto';
import { AppError, getIPv4FromReq, INGREDIENT_RPC,type IPublicIngredientRpc, paginatedResponse, type PagingDTO, pagingDTOSchema, PublicIngredient, type ReqWithRequester, UserRole } from 'src/share';
import type { Request as ExpressRequest } from 'express';
import { ErrInventoryBatchNotFound, InventoryBatch } from '../models/inventoryBatch.model';

@Controller('v1/inventory-batches')
export class InventoryBatchHttpController {
    constructor(
        @Inject(INVENTORYBATCH_SERVICE) private readonly inventoryBatchService: IInventoryBatchService,
        @Inject(INGREDIENT_RPC) private readonly ingredientRpc: IPublicIngredientRpc,
    ){}
    
    // API để tạo mới lô hàng tồn kho
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: InventoryBatchCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const data = await this.inventoryBatchService.create(requester, dto, ip, userAgent);
        return { data };
    }

    // API để cập nhật thông tin lô hàng tồn kho theo ID
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') inventoryBatchId: string, @Body() dto: InventoryBatchUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const data = await this.inventoryBatchService.update(requester, inventoryBatchId, dto, ip, userAgent);
        return { data };
    }

     // API để xóa lô hàng tồn kho theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') inventoryBatchId: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.inventoryBatchService.delete(requester, inventoryBatchId, ip, userAgent);
    }

    // API để lấy danh sách lô hàng tồn kho theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: InventoryBatchCondDTO,  @Query() paging: PagingDTO) {
        paging = pagingDTOSchema.parse(paging);
        cond = inventoryBatchCondDTOSchema.parse(cond);

        const result = await this.inventoryBatchService.list(cond, paging);

        const ingredientIds = result.data.map(batch => batch.ingredientId);

        const ingredients = await this.ingredientRpc.findByIds(ingredientIds);

        const ingredientMap: Record<string, PublicIngredient> = {};

        if (ingredients) {
            ingredients.forEach(ingredient => {
                ingredientMap[ingredient.id] = ingredient;
            });
        }

        result.data = result.data.map(batch => {
            const ingredient = ingredientMap[batch.ingredientId];
            return {
                ...batch,
                ingredient,
            } as InventoryBatch
        })

        return paginatedResponse(result, paging);
    }

    // API để lấy thông tin lô hàng tồn kho theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') inventoryBatchId: string) {
        const result = await this.inventoryBatchService.get(inventoryBatchId);
        
        if (!result) {
            throw AppError.from(ErrInventoryBatchNotFound, 404);
        }

        const ingredient = await this.ingredientRpc.findById(result.ingredientId);

        const data = { ...result, ingredient } as InventoryBatch;

        return { data };
    }

    // API để lấy thông tin lô hàng tồn kho theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const data = await this.inventoryBatchService.listByIds(ids);
        return { data };
    }
}

@Controller('v1/rpc/inventory-batches')
export class InventoryBatchRpcController {
    constructor(
        @Inject(INVENTORYBATCH_SERVICE) private readonly inventoryBatchService: IInventoryBatchService,
    ){}

    // RPC để lấy thông tin lô hàng tồn kho theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') inventoryBatchId: string) {
        const data = await this.inventoryBatchService.get(inventoryBatchId);
        return { data };
    }

    // RPC để lấy thông tin lô hàng tồn kho theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const data = await this.inventoryBatchService.listByIds(ids);
        return { data };
    }
}