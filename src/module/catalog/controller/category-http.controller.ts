import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { CATEGORY_SERVICE } from "../catalog.di-token";
import type { ICategoryService } from "../ports/category.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { getIPv4FromReq, paginatedResponse, type PagingDTO, pagingDTOSchema, type ReqWithRequester, UserRole } from "src/share";
import { categoryCondDTOSchema, type CategoryCondDTO, type CategoryCreatedDTO } from "../dtos/category.dto";
import type { Request as ExpressRequest } from "express";
import { ApiCreatedResponse, ApiOperation } from "@nestjs/swagger";
// Lớp CategoryHttpController xử lý các yêu cầu HTTP liên quan đến danh mục sản phẩm
@Controller('v1/categories')
export class CategoryHttpController {
    constructor(
        @Inject(CATEGORY_SERVICE) private readonly categoryService: ICategoryService, 
    ){}

    // API tạo mới danh mục sản phẩm
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Tạo mới danh mục sản phẩm' })
    @ApiCreatedResponse({ description: 'Danh mục sản phẩm được tạo thành công' })
    async create(@Request() req: ReqWithRequester,@Request() reqExpress: ExpressRequest, @Body() dto: CategoryCreatedDTO){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const data = await this.categoryService.create(req.requester, dto, ip, userAgent);
        return { data };
    }

    // API cập nhật thông tin danh mục sản phẩm
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Cập nhật thông tin danh mục sản phẩm' })
    @ApiCreatedResponse({ description: 'Thông tin danh mục sản phẩm được cập nhật thành công' })
    async update(@Request() req: ReqWithRequester,@Request() reqExpress: ExpressRequest, @Param('id') id: string, @Body() dto: CategoryCreatedDTO){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.categoryService.update(req.requester, id, dto, ip, userAgent);
    }

    // API xóa danh mục sản phẩm
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Xóa danh mục sản phẩm' })
    @ApiCreatedResponse({ description: 'Danh mục sản phẩm được xóa thành công' })
    async delete(@Request() req: ReqWithRequester,@Request() reqExpress: ExpressRequest, @Param('id') id: string){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.categoryService.delete(req.requester, id, ip, userAgent);
    }

    // API lấy thông tin danh mục sản phẩm theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy thông tin danh mục sản phẩm theo ID' })
    @ApiCreatedResponse({ description: 'Thông tin danh mục sản phẩm được lấy thành công' })
    async get(@Param('id') id: string){
        const data = await this.categoryService.get(id);
        return { data };
    }
    
    // API lấy danh sách danh mục sản phẩm theo điều kiện
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy danh sách danh mục sản phẩm theo điều kiện' })
    @ApiCreatedResponse({ description: 'Danh sách danh mục sản phẩm được lấy thành công' })
    async listCategory(@Request() req: ReqWithRequester, @Query() dto: CategoryCondDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = categoryCondDTOSchema.parse(dto);
        const data = await this.categoryService.list(dto, paging);
        return paginatedResponse(data, dto);
    }

    // API lấy danh sách danh mục sản phẩm theo nhiều ID
    @Get('list-by-ids')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy danh sách danh mục sản phẩm theo nhiều ID' })
    @ApiCreatedResponse({ description: 'Danh sách danh mục sản phẩm được lấy thành công' })
    async listCategoryByIds(@Request() req: ReqWithRequester, @Body() dto: { ids: string[] }, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        const data = await this.categoryService.listByIds(dto.ids, paging);
        return paginatedResponse(data, dto);
    }
}

// Controller RPC
@Controller('v1/rpc/categories')
export class CategoryRpcController {
    constructor(
        @Inject(CATEGORY_SERVICE) private readonly categoryService: ICategoryService, 
    ){}
    
    // RPC lấy thông tin danh mục sản phẩm theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'RPC: Lấy thông tin danh mục sản phẩm theo ID' })
    @ApiCreatedResponse({ description: 'Thông tin danh mục sản phẩm được lấy thành công' })
    async get(@Param('id') id: string){
        const data = await this.categoryService.get(id);
        return { data };
    }

    // RPC lấy danh mục theo nhiều ID
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'RPC: Lấy danh sách danh mục sản phẩm theo nhiều ID' })
    @ApiCreatedResponse({ description: 'Danh sách danh mục sản phẩm được lấy thành công' })
    async listByIds(@Body() dto: { ids: string[] }, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        const data = await this.categoryService.listByIds(dto.ids, paging);
        return paginatedResponse(data, dto);
    }

     // RPC lấy danh mục theo điều kiện
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'RPC: Lấy danh sách danh mục sản phẩm theo điều kiện' })  
    @ApiCreatedResponse({ description: 'Danh sách danh mục sản phẩm được lấy thành công' })
    async list(@Query() dto: CategoryCondDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = categoryCondDTOSchema.parse(dto);
        const data = await this.categoryService.list(dto, paging);
        return paginatedResponse(data, dto);
    }
}