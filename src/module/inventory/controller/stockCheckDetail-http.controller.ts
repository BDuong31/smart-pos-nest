import { Inject, Controller, Get, Query, HttpCode, HttpStatus, UseGuards, Post, Body, Patch, Delete, Param } from '@nestjs/common';
import { STOCKCHECKDETAIL_SERVICE } from '../inventory.di-token';
import type { IStockCheckDetailService } from '../ports/stockCheckDetail.port';
import { stockCheckDetailCondDTOSchema, type StockCheckDetailCreateDTO, type StockCheckDetailUpdateDTO } from '../dtos/stockCheckDetail.dto';
import { Request } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AppError, getIPv4FromReq, INGREDIENT_RPC,pagingDTOSchema,PublicIngredient,type IPublicIngredientRpc, type ReqWithRequester } from 'src/share';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import type { StockCheckDetailCondDTO } from '../dtos/stockCheckDetail.dto';
import { paginatedResponse, type PagingDTO, UserRole } from 'src/share';
import { ErrStockCheckDetailNotFound, StockCheckDetail } from '../models/stockCheckDetail.model';

@Controller('v1/stock-check-details')
export class StockCheckDetailHttpController {
    constructor(
        @Inject(STOCKCHECKDETAIL_SERVICE) private readonly stockCheckDetailService: IStockCheckDetailService,
        @Inject(INGREDIENT_RPC) private readonly ingredientRpc: IPublicIngredientRpc,
    ){}

    // API tạo mới chi tiết kiểm kê tồn kho
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: StockCheckDetailCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const data = await this.stockCheckDetailService.create(requester, dto, ip, userAgent);
        return { data };
    }

    // API cập nhật chi tiết kiểm kê tồn kho theo ID
    @Patch(':id')   
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string, @Body() dto: StockCheckDetailUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const data = await this.stockCheckDetailService.update(requester, id, dto, ip, userAgent);
        return { data };
    }
    
    // API xóa chi tiết kiểm kê tồn kho theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.stockCheckDetailService.delete(requester, id, ip, userAgent);
    }

    // API lấy chi tiết kiểm kê tồn kho theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const result = await this.stockCheckDetailService.get(id);

        if (!result) {
            throw AppError.from(ErrStockCheckDetailNotFound, 404);
        }

        const ingredient = await this.ingredientRpc.findById(result.ingredientId);

        const data = { ...result, ingredient } as StockCheckDetail;
        return { data };
     }

    // API lấy danh sách chi tiết kiểm kê tồn kho theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: StockCheckDetailCondDTO, @Query() paging: PagingDTO) {
        paging = pagingDTOSchema.parse(paging);
        cond = stockCheckDetailCondDTOSchema.parse(cond);
        const result = await this.stockCheckDetailService.list(cond, paging);
      
        const ingredientIds = result.data.map(detail => detail.ingredientId).filter(id => !!id);
        const ingredients = await this.ingredientRpc.findByIds(ingredientIds);
        const ingredientMap: Record<string, PublicIngredient> = {};

        if (ingredients) {
            ingredients.map(ingredient => {
                ingredientMap[ingredient.id] = ingredient;
            });
        }

        result.data = result.data.map(detail => {
            const ingredient = ingredientMap[detail.ingredientId];
            return { ...detail, ingredient } as StockCheckDetail;
        })
        return paginatedResponse(result, paging);
    }

    // RPC lấy thông tin chi tiết kiểm kê tồn kho theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const result = await this.stockCheckDetailService.listByIds(ids);

        const ingredientIds = result.map(detail => detail.ingredientId).filter(id => !!id);
        const ingredients = await this.ingredientRpc.findByIds(ingredientIds);
        const ingredientMap: Record<string, PublicIngredient> = {};

        if (ingredients) {
            ingredients.map(ingredient => {
                ingredientMap[ingredient.id] = ingredient;
            });
        }
        
        const data = result.map(detail => {
            const ingredient = ingredientMap[detail.ingredientId];
            return { ...detail, ingredient } as StockCheckDetail;
        });
        return { data };
     }
}

@Controller('v1/rpc/stock-check-details')
export class StockCheckDetailRpcController {
    constructor(
        @Inject(STOCKCHECKDETAIL_SERVICE) private readonly stockCheckDetailService: IStockCheckDetailService,
    ){}

    // RPC lấy thông tin chi tiết kiểm kê tồn kho theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const data = await this.stockCheckDetailService.get(id);
        return { data };
     }

    // RPC lấy thông tin chi tiết kiểm kê tồn kho theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const data = await this.stockCheckDetailService.listByIds(ids);
        return { data };
    }
}