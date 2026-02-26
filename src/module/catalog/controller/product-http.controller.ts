import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Request, UseGuards, Query } from "@nestjs/common";
import { PRODUCT_SERVICE } from "../catalog.di-token";
import {type IProductService } from "../ports/product.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import {getIPv4FromReq, paginatedResponse,type PagingDTO, type ReqWithRequester, UserRole } from "src/share";
import {type VariantDTO, type ProductCreatedDTO } from "../dtos/product.dto";
import type { Request as ExpressRequest } from "express";
import { ApiCreatedResponse, ApiOperation } from "@nestjs/swagger";

@Controller('v1/products')
export class ProductHttpController {
    constructor(
        @Inject(PRODUCT_SERVICE) private readonly productService: IProductService, 
    ){}

    // API tạo mới sản phẩm
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Tạo mới sản phẩm', description: 'API này cho phép tạo mới một sản phẩm trong hệ thống. Chỉ người dùng có vai trò ADMIN mới có quyền truy cập.' })
    @ApiCreatedResponse({ description: 'Sản phẩm được tạo thành công', schema: { example: { data: 'uuid-of-new-product' } } })
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: ProductCreatedDTO){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const data = await this.productService.createProduct(req.requester, dto, ip, userAgent);
        return { data };
    }
    // API cập nhật sản phẩm
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: ProductCreatedDTO, @Param('id') id: string){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.productService.updateProduct(req.requester, id, dto, ip, userAgent);
    }
    // API xóa sản phẩm
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.productService.deleteProduct(req.requester, id, ip, userAgent);
    }
    
    // API lấy thông tin sản phẩm theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') id: string){
        const data = await this.productService.getProductById(id);
        return { data };
    }

    // API lấy danh sách sản phẩm theo điều kiện
    @Get()
    @HttpCode(HttpStatus.OK)
    async listProduct(@Request() req: ReqWithRequester, @Query() dto: ProductCreatedDTO, @Query() paging: PagingDTO){
        const data = await this.productService.getListProduct(dto, paging);
        return paginatedResponse(data, dto);
    }

    // API lấy danh sách sản phẩm theo mảng IDs
    @Get('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listProductByIds(@Body() dto: { ids: string[] }, @Query() paging: PagingDTO){
        const idArray = dto.ids;
        const data = await this.productService.getProductByIds(idArray, paging);
        return paginatedResponse(data, dto);
    }

    // API tìm kiếm sản phẩm theo từ khóa
    @Get('search')
    @HttpCode(HttpStatus.OK)
    async searchProduct(@Query('keyword') keyword: string, @Query() paging: PagingDTO){
        const data = await this.productService.getProductBySearch(keyword, paging);
        return paginatedResponse(data, { keyword });
    }
}

@Controller('v1/rpc/products')
export class ProductRpcController {
    constructor(
        @Inject(PRODUCT_SERVICE) private readonly productService: IProductService, 
    ){}

    // RPC lấy thông tin sản phẩm theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') id: string){
        const data = await this.productService.getProductById(id);
        return { data };
    }
    // RPC lấy danh sách sản phẩm theo điều kiện
    @Get()
    @HttpCode(HttpStatus.OK)
    async listProduct(@Query() dto: ProductCreatedDTO, @Query() paging: PagingDTO){
        const data = await this.productService.getListProduct(dto, paging);
        return paginatedResponse(data, dto);
    }

    // RPC lấy danh sách sản phẩm theo mảng IDs
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listProductByIds(@Body() dto: { ids: string[] }, @Query() paging: PagingDTO){
        const idArray = dto.ids;
        const data = await this.productService.getProductByIds(idArray, paging);
        return paginatedResponse(data, dto);
    }

    // RPC tìm kiếm sản phẩm theo từ khóa
    @Get('search')
    @HttpCode(HttpStatus.OK)
    async searchProduct(@Query('keyword') keyword: string, @Query() paging: PagingDTO){
        const data = await this.productService.getProductBySearch(keyword, paging);
        return paginatedResponse(data, { keyword });
    }
}

@Controller('v1/variants')
export class VariantHttpController {
    constructor(
        @Inject(PRODUCT_SERVICE) private readonly productService: IProductService, 
    ){}

    // API tạo mới biến thể sản phẩm
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createVariant(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: VariantDTO, @Query('productId') productId: string){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const data = await this.productService.createVariant(req.requester, productId, dto, ip, userAgent);
        return { data };
    }

    // API tạo nhiều biến thể sản phẩm cùng lúc
    @Post('batch')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createVariants(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dtos: VariantDTO[], @Query('productId') productId: string){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const data = await this.productService.createVariants(req.requester, productId, dtos, ip, userAgent);
        return { data };
    }

    // API cập nhật biến thể sản phẩm
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateVariant(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: VariantDTO, @Query('productId') productId: string, @Param('id') id: string){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.productService.updateVariant(req.requester, productId, id, dto, ip, userAgent);
    }

    // API xóa biến thể sản phẩm
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteVariant(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Query('productId') productId: string, @Param('id') id: string){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.productService.deleteVariant(req.requester, productId, id, ip, userAgent);
    }
    
    // API lấy thông tin biến thể sản phẩm theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getVariant(@Request() req: ReqWithRequester, @Param('id') id: string){
        const data = await this.productService.getVariantById(id);
        return { data };
    }

    // API lấy danh sách biến thể sản phẩm theo điều kiện
    @Get()
    @HttpCode(HttpStatus.OK)
    async listVariant(@Request() req: ReqWithRequester, @Query() dto: VariantDTO, @Query() paging: PagingDTO){
        const data = await this.productService.getListVariant(dto, paging);
        return paginatedResponse(data, dto);
    }

    // API lấy danh sách biến thể sản phẩm theo mảng IDs
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listVariantByIds(@Request() req: ReqWithRequester, @Body() dto: { ids: string[] }, @Query() paging: PagingDTO){
        const idArray = dto.ids;
        const data = await this.productService.getVariantByIds(idArray, paging);
        return paginatedResponse(data, dto);
    }
}

@Controller('v1/rpc/variants')
export class VariantRpcController {
    constructor(
        @Inject(PRODUCT_SERVICE) private readonly productService: IProductService, 
    ){}

    // RPC lấy thông tin biến thể sản phẩm theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getVariant(@Param('id') id: string){
        const data = await this.productService.getVariantById(id);
        return { data };
    }
    
    // RPC lấy danh sách biến thể sản phẩm theo điều kiện
    @Get()
    @HttpCode(HttpStatus.OK)
    async listVariant(@Query() dto: VariantDTO, @Query() paging: PagingDTO){
        const data = await this.productService.getListVariant(dto, paging);
        return paginatedResponse(data, dto);
    }
    // RPC lấy danh sách biến thể sản phẩm theo mảng IDs   
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listVariantByIds(@Body() dto: { ids: string[] }, @Query() paging: PagingDTO){
        const idArray = dto.ids;
        const data = await this.productService.getVariantByIds(idArray, paging);
        return paginatedResponse(data, dto);
    } 
}