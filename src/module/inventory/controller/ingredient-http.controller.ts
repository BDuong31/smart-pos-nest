import { Inject, Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query, Request } from '@nestjs/common';
import { INGREDIENT_SERVICE } from '../inventory.di-token';
import type { IIngredientService } from '../ports/ingredient.port';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import {type IngredientCreateDTO,type IngredientUpdateDTO,type IngredientCondDTO, ingredientCondDTOSchema } from '../dtos/ingredient.dto';
import { AppError, getIPv4FromReq, IMAGE_RPC,type IPublicImageRpc, paginatedResponse, type PagingDTO, pagingDTOSchema, PublicImage, type ReqWithRequester, UserRole } from 'src/share';
import type { Request as ExpressRequest } from 'express';
import { ErrIngredientNotFound, Ingredient } from '../models/ingredient.model';

@Controller('v1/ingredients')
export class IngredientHttpController {
    constructor(
        @Inject(INGREDIENT_SERVICE) private readonly ingredientService: IIngredientService,
        @Inject(IMAGE_RPC) private readonly imageRpc: IPublicImageRpc,
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
        const data = await this.ingredientService.create(requester, dto, ip, userAgent);
        return { data };
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
        const data = await this.ingredientService.update(requester, ingredientId, dto, ip, userAgent);
        return { data };
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
        paging = pagingDTOSchema.parse(paging);
        cond = ingredientCondDTOSchema.parse(cond);

        const result = await this.ingredientService.list(cond, paging);

        const ingredientIds = result.data.map(ingredient => ingredient.id);
        const images = await this.imageRpc.getImagesByRefId([... new Set(ingredientIds)], 'ingredient');

        const imageMap = new Map<string, PublicImage[]>();

        if (images && images.length > 0) {
            images.forEach(image => {
                const refId = image.refId;
                if (!imageMap.has(refId)) {
                    imageMap.set(refId, []);
                }
                imageMap.get(refId)?.push(image);
             });
        }

        result.data = result.data.map((ingredient) => {
            const images = imageMap.get(ingredient.id) || [];
            return {...ingredient, images } as Ingredient;
        })

        return paginatedResponse(result, paging);
    }

    // API để lấy thông tin nguyên liệu theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') ingredientId: string) {
        const result = await this.ingredientService.get(ingredientId);

        if (!result) {
            throw AppError.from(ErrIngredientNotFound, 404);
        }

        const image = await this.imageRpc.getImagesByRefId(ingredientId, 'ingredient');

        const data = {
            ...result,
            image: image.length > 0 ? image : undefined,
        } as Ingredient;
        return { data };
    }

    // API để lấy thông tin nguyên liệu theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const data = await this.ingredientService.listByIds(ids);
        return { data };
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
         const data = await this.ingredientService.get(ingredientId);
         return { data };
     }

     // RPC lấy danh sách nguyên liệu theo nhiều ID
     @Post('list-by-ids')
     @HttpCode(HttpStatus.OK)
     async listByIds(@Body('ids') ids: string[]) {
         const data = await this.ingredientService.listByIds(ids);
         return { data };
     }
}