import { Inject, Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query, Request } from '@nestjs/common';
import { UNITCONVERSION_SERVICE } from '../inventory.di-token';
import type { IUnitConversionService } from '../ports/unitConversion.port'; 
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import { type UnitConversionCreateDTO, type UnitConversionUpdateDTO, type UnitConversionCondDTO, unitConversionCondDTOSchema } from '../dtos/unitConversion.dto';
import { AppError, getIPv4FromReq, INGREDIENT_RPC,type IPublicIngredientRpc, paginatedResponse, type PagingDTO, pagingDTOSchema, PublicIngredient, type ReqWithRequester, UserRole } from 'src/share';
import type { Request as ExpressRequest } from 'express';
import { ErrUnitConversionNotFound, UnitConversion } from '../models/unitConversion.model';

@Controller('v1/unit-conversions')
export class UnitConversionHttpController {
    constructor(
        @Inject(UNITCONVERSION_SERVICE) private readonly unitConversionService: IUnitConversionService,
        @Inject(INGREDIENT_RPC) private readonly ingredientRpc: IPublicIngredientRpc,
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
        const data = await this.unitConversionService.create(requester, dto, ip, userAgent);
        return { data };
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
        const data = await this.unitConversionService.update(requester, unitConversionId, dto, ip, userAgent);
        return { data };
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
        paging = pagingDTOSchema.parse(paging);
        cond = unitConversionCondDTOSchema.parse(cond);

        const result = await this.unitConversionService.list(cond, paging);

        const ingredientIds = result.data.map(uc => uc.ingredientId);
        const ingredients = await this.ingredientRpc.findByIds(ingredientIds);
        const ingredientMap: Record<string, PublicIngredient> = {};

        if (ingredients) {
            ingredients.map(ingredient => {
                ingredientMap[ingredient.id] = ingredient;
            })
        }

        result.data = result.data.map(uc => {
            const ingredient = ingredientMap[uc.ingredientId];
            return { ...uc, ingredient } as UnitConversion;
        })

        return paginatedResponse(result, paging);
    }   

    // API để lấy thông tin quy đổi đơn vị theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') unitConversionId: string) {
        const result = await this.unitConversionService.get(unitConversionId);

        if (!result) {
            throw AppError.from(ErrUnitConversionNotFound, 404);
        }
    
        const ingredient = await this.ingredientRpc.findById(result.ingredientId);

        const data = { ...result, ingredient } as UnitConversion;
        
        return {data};
    }

    // API để lấy danh sách quy đổi đơn vị theo nhiều ID    
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const result = await this.unitConversionService.listByIds(ids);
        const ingredientIds = result.map(uc => uc.ingredientId);
        const ingredients = await this.ingredientRpc.findByIds(ingredientIds);
        const ingredientMap: Record<string, PublicIngredient> = {};

        if (ingredients) {
            ingredients.map(ingredient => {
                ingredientMap[ingredient.id] = ingredient;
            })
        }

        const data = result.map(uc => {
            const ingredient = ingredientMap[uc.ingredientId];
            return { ...uc, ingredient } as UnitConversion;
        });

        return { data };
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
        const data = await this.unitConversionService.get(unitConversionId);
        return { data };
    }


    // RPC để lấy danh sách quy đổi đơn vị theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const data = await this.unitConversionService.listByIds(ids);
        return { data };
    }  
}