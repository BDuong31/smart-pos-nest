import { Inject, Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query, Request } from '@nestjs/common';
import { RECIPE_SERVICE } from '../inventory.di-token';
import type { IRecipeService } from '../ports/recipe.port';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import { type RecipeCreateDTO, type RecipeUpdateDTO, type RecipeCondDTO, recipeCondDTOSchema } from '../dtos/recipe.dto';
import { AppError, getIPv4FromReq, INGREDIENT_RPC,type IPublicIngredientRpc, paginatedResponse, type PagingDTO, pagingDTOSchema, PublicIngredient, type ReqWithRequester, UserRole } from 'src/share';
import type { Request as ExpressRequest } from 'express';
import { ErrRecipeNotFound, Recipe } from '../models/recipe.model';

@Controller('v1/recipes')   
export class RecipeHttpController { 
    constructor(
        @Inject(RECIPE_SERVICE) private readonly recipeService: IRecipeService,
        @Inject(INGREDIENT_RPC) private readonly ingredientRpc: IPublicIngredientRpc,
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
        const data = await this.recipeService.create(requester, dto, ip, userAgent);
        return { data };
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
        const data = await this.recipeService.update(requester, recipeId, dto, ip, userAgent);
        return { data };
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
        paging = pagingDTOSchema.parse(paging);
        cond = recipeCondDTOSchema.parse(cond);


        console.log(cond)

        const result = await this.recipeService.list(cond, paging);

        const ingredientIds = result.data.map(item => item.ingredientId);
         
        const ingredients = await this.ingredientRpc.findByIds(ingredientIds);
        
        const ingredientMap: Record<string, PublicIngredient> = {};

        if (ingredients) {
            ingredients.map(ingredient => {
                ingredientMap[ingredient.id] = ingredient;
            });
        }

        result.data = result.data.map(item => {
            const ingredient = ingredientMap[item.ingredientId];
            return { ...item, ingredient } as Recipe;
        });
        return paginatedResponse(result, paging);
    }

    // API để lấy thông tin công thức theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') recipeId: string) {
        const result = await this.recipeService.get(recipeId);

        if (!result) {
            throw AppError.from(ErrRecipeNotFound, 404);
        }

        const ingredient = await this.ingredientRpc.findById(result.ingredientId);

        const data = { ...result, ingredient } as Recipe;
        return { data };
    }

    // API để lấy thông tin công thức theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') recipeIds: string[]) {
        const result = await this.recipeService.listByIds(recipeIds);

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
            return { ...item, ingredient } as Recipe;
        });
        return { data };
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
        const data = await this.recipeService.get(recipeId);
        return {data};
    }

    // RPC lấy thông tin công thức theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') recipeIds: string[]) {
        const data = await this.recipeService.listByIds(recipeIds);
        return { data };
    }
}