import { Inject, Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query, Request } from '@nestjs/common';
import { RECIPE_SERVICE } from '../inventory.di-token';
import type { IRecipeService } from '../ports/recipe.port';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import type { RecipeCreateDTO, RecipeUpdateDTO, RecipeCondDTO } from '../dtos/recipe.dto';
import { getIPv4FromReq, paginatedResponse, type PagingDTO, type ReqWithRequester, UserRole } from 'src/share';
import type { Request as ExpressRequest } from 'express';

@Controller('v1/recipes')   
export class RecipeHttpController { 
    constructor(
        @Inject(RECIPE_SERVICE) private readonly recipeService: IRecipeService,
    ){}

    // API để tạo mới công thức
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: RecipeCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const recipe = await this.recipeService.create(requester, dto, ip, userAgent);
        return recipe;
    }   

    // API để cập nhật thông tin công thức theo ID  
    @Patch(':id')   
    @UseGuards(RemoteAuthGuard, RolesGuard) 
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') recipeId: string, @Body() dto: RecipeUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);  
        const userAgent = reqExpress.headers['user-agent'] || '';
        const updatedRecipe = await this.recipeService.update(requester, recipeId, dto, ip, userAgent);
        return updatedRecipe;
    }

     // API để xóa công thức theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)            
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') recipeId: string) {  
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.recipeService.delete(requester, recipeId, ip, userAgent);
    }

    // API để lấy danh sách công thức theo điều kiện        
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: RecipeCondDTO,  @Query() paging: PagingDTO) {
        const recipes = await this.recipeService.list(cond, paging);
        return paginatedResponse(recipes, paging);
    }

    // API để lấy thông tin công thức theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') recipeId: string) {
        const recipe = await this.recipeService.get(recipeId);
        return recipe;
    }

    // API để lấy thông tin công thức theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') recipeIds: string[],  @Query() paging: PagingDTO) {
        const recipes = await this.recipeService.listByIds(recipeIds, paging);
        return paginatedResponse(recipes, paging);
    }
}   

@Controller('v1/rpc/recipes')
export class RecipeRpcController {
    constructor(
        @Inject(RECIPE_SERVICE) private readonly recipeService: IRecipeService
    ){}

    // RPC lấy thông tin công thức theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') recipeId: string) {
        const recipe = await this.recipeService.get(recipeId);
        return recipe;
    }

    // RPC lấy thông tin công thức theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') recipeIds: string[],  @Query() paging: PagingDTO) {
        const recipes = await this.recipeService.listByIds(recipeIds, paging);
        return paginatedResponse(recipes, paging);
    }
}