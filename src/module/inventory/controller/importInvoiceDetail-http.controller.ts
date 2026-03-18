import { Inject, Controller, Get, Query, HttpCode, HttpStatus, UseGuards, Post, Body, Patch, Delete, Param } from '@nestjs/common';
import { IMPORTINVOICEDETAIL_SERVICE } from '../inventory.di-token';
import type { IImportInvoiceDetailService } from '../ports/importInvoiceDetail.port';
import { importInvoiceDetailCondDTOSchema, type ImportInvoiceDetailCreateDTO, type ImportInvoiceDetailUpdateDTO } from '../dtos/importInvoiceDetail.dto';
import { Request } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AppError, getIPv4FromReq, INGREDIENT_RPC, pagingDTOSchema, PublicImportInvoiceDetail, PublicIngredient, type IPublicIngredientRpc, type ReqWithRequester } from 'src/share';
import { RemoteAuthGuard, RolesGuard, Roles } from 'src/share/guard';
import type { ImportInvoiceDetailCondDTO } from '../dtos/importInvoiceDetail.dto';
import { paginatedResponse, type PagingDTO, UserRole } from 'src/share';
import { ErrImportInvoiceDetailNotFound } from '../models/importInvoiceDetail.model';

@Controller('v1/import-invoice-details')
export class ImportInvoiceDetailHttpController {
    constructor(
        @Inject(IMPORTINVOICEDETAIL_SERVICE) private readonly importInvoiceDetailService: IImportInvoiceDetailService,
        @Inject(INGREDIENT_RPC) private readonly ingredientRpc: IPublicIngredientRpc,
    ){}

    // API tạo mới chi tiết phiếu nhập hàng
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: ImportInvoiceDetailCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const data = await this.importInvoiceDetailService.create(requester, dto, ip, userAgent);
        return {data};
    }

    // API cập nhật chi tiết phiếu nhập hàng theo ID
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string, @Body() dto: ImportInvoiceDetailUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const data = await this.importInvoiceDetailService.update(requester, id, dto, ip, userAgent);
        return {data};
    }

    // API xóa chi tiết phiếu nhập hàng theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.importInvoiceDetailService.delete(requester, id, ip, userAgent);
    }

    // API lấy chi tiết phiếu nhập hàng theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const result = await this.importInvoiceDetailService.get(id);

        if (!result) {
            throw AppError.from(ErrImportInvoiceDetailNotFound, 404);
        }

        const ingredient = await this.ingredientRpc.findById(result.ingredientId);

        const data = { ...result, ingredient } as any;
        return { data };
    }

    // API lấy danh sách chi tiết phiếu nhập hàng theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async list(@Query() cond: ImportInvoiceDetailCondDTO, @Query() paging: PagingDTO) {
        paging = pagingDTOSchema.parse(paging);
        cond = importInvoiceDetailCondDTOSchema.parse(cond);

        const result = await this.importInvoiceDetailService.list(cond, paging);

        const ingredientIds = result.data.map(item => item.ingredientId);

        const ingredients = await this.ingredientRpc.findByIds([...new Set(ingredientIds)]);

        const ingredientMap: Record<string, PublicIngredient> = {};

        if (ingredients) {
            ingredients.forEach(ingredient => {
                ingredientMap[ingredient.id] = ingredient;
            })
        }

        result.data = result.data.map(item => {
            const ingredient = ingredientMap[item.ingredientId];
            return { ...item, ingredient } as PublicImportInvoiceDetail;
        });
        return paginatedResponse(result, paging);
    }

    // API lấy danh sách chi tiết phiếu nhập hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const result = await this.importInvoiceDetailService.listByIds(ids);

        const ingredientIds = result.map(item => item.ingredientId);

        const ingredients = await this.ingredientRpc.findByIds([...new Set(ingredientIds)]);

        const ingredientMap: Record<string, PublicIngredient> = {};

        if (ingredients) {
            ingredients.forEach(ingredient => {
                ingredientMap[ingredient.id] = ingredient;
            })
        }

        const data = result.map(item => {
            const ingredient = ingredientMap[item.ingredientId];
            return { ...item, ingredient } as PublicImportInvoiceDetail;
        });
        
        return { data };
    }
}

@Controller('v1/rpc/import-invoice-details')
export class ImportInvoiceDetailRpcController {
    constructor(
        @Inject(IMPORTINVOICEDETAIL_SERVICE) private readonly importInvoiceDetailService: IImportInvoiceDetailService,
    ){}

    // RPC để lấy chi tiết phiếu nhập hàng cho AI agent
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id') id: string) {
        const data = await this.importInvoiceDetailService.get(id);
        return { data };
    }

    // RPC để lấy danh sách chi tiết phiếu nhập hàng theo nhiều ID cho AI agent
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const data = await this.importInvoiceDetailService.listByIds(ids);
        return { data };
    }
}