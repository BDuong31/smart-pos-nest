import { Inject, Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query, Request } from '@nestjs/common';
import { INGREDIENT_SERVICE } from '../inventory.di-token';
import type { IIngredientService } from '../ports/ingredient.port';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import type { IngredientCreateDTO, IngredientUpdateDTO, IngredientCondDTO } from '../dtos/ingredient.dto';
import { getIPv4FromReq, paginatedResponse, type PagingDTO, type ReqWithRequester, UserRole } from 'src/share';
import type { Request as ExpressRequest } from 'express';

@Controller('v1/ingredients')
export class IngredientHttpController {
    constructor(
        @Inject(INGREDIENT_SERVICE) private readonly ingredientService: IIngredientService,
    ){}

    // API để tạo mới nguyên liệu
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: IngredientCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const ingredient = await this.ingredientService.create(requester, dto, ip, userAgent);
        return ingredient;
    }

    // API để cập nhật thông tin nguyên liệu theo ID
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') ingredientId: string, @Body() dto: IngredientUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const updatedIngredient = await this.ingredientService.update(requester, ingredientId, dto, ip, userAgent);
        return updatedIngredient;
    }   

    // API để xóa nguyên liệu theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') ingredientId: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.ingredientService.delete(requester, ingredientId, ip, userAgent);
    }

    // API để lấy danh sách nguyên liệu theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: IngredientCondDTO,  @Query() paging: PagingDTO) {
        const ingredients = await this.ingredientService.list(cond, paging);
        return paginatedResponse(ingredients, paging);
    }

    // API để lấy thông tin nguyên liệu theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') ingredientId: string) {
        const ingredient = await this.ingredientService.get(ingredientId);
        return ingredient;
    }

    // API để lấy thông tin nguyên liệu theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const ingredients = await this.ingredientService.listByIds(ids, paging);
        return paginatedResponse(ingredients, paging);
    }
}

@Controller('v1/rpc/ingredients')
export class IngredientRpcController {  
    constructor(
        @Inject(INGREDIENT_SERVICE) private readonly ingredientService: IIngredientService,
     ){}

     // RPC lấy thông tin nguyên liệu theo ID
     @Get(':id')
     @HttpCode(HttpStatus.OK)
     async get(@Param('id') ingredientId: string) {
         const ingredient = await this.ingredientService.get(ingredientId);
         return ingredient;
     }

     // RPC lấy danh sách nguyên liệu theo nhiều ID
     @Post('list-by-ids')
     @HttpCode(HttpStatus.OK)
     async listByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
         const ingredients = await this.ingredientService.listByIds(ids, paging);
         return paginatedResponse(ingredients, paging);
     }
}