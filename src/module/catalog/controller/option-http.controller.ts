import { Controller, HttpCode, HttpStatus, Inject, Post, UseGuards, Request, Body, Param, Patch, Delete, Get, Query } from "@nestjs/common";
import { OPTION_SERVICE } from "../catalog.di-token";
import {type IOptionService } from "../ports/option.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { AppError, getIPv4FromReq,IMAGE_RPC,type IPublicImageRpc,paginatedResponse,type PagingDTO, pagingDTOSchema, PublicImage, type ReqWithRequester, UserRole } from "src/share";
import { type Request as RequestExpress } from 'express';
import { optionItemCondDTOSchema, type CreateOptionGroupDTO, type CreateOptionItemDTO, type CreateProductOptionConfigDTO, type OptionGroupCondDTO, type OptionItemCondDTO, type ProductOptionConfigCondDTO, type UpdateOptionItemDTO } from "../dtos/option.dto";
import { ErrOptionItemNotFound, OptionItem, ProductOptionConfig } from "../models/option.model";

@Controller('v1/options')
export class OptionHttpController {
    constructor(
        @Inject(OPTION_SERVICE) private readonly optionService: IOptionService,
        @Inject(IMAGE_RPC) private readonly imageRpc: IPublicImageRpc,
    ){}
    // ============================
    // HTTP Controller cho Option Group
    // ============================

    // API tạo Option Group mới
    @Post('group')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createOptionGroup(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: CreateOptionGroupDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        return await this.optionService.createOptionGroup(requester, dto, ip, userAgent);
    }

    // API cập nhật Option Group
    @Patch('group/:id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async updateOptionGroup(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: CreateOptionGroupDTO, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        return await this.optionService.updateOptionGroup(requester, id, dto, ip, userAgent);
    }

    // API xóa Option Group
    @Delete('group/:id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteOptionGroup(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        return await this.optionService.deleteOptionGroup(requester, id, ip, userAgent);
    }

    // API lấy thông tin Option Group theo ID
    @Get('group/:id')
    @HttpCode(HttpStatus.OK)
    async getOptionGroupById(@Param('id') id: string) {
        return await this.optionService.getOptionGroupById(id);
     }

    // API lấy danh sách Option Group theo điều kiện lọc
    @Get('group')
    @HttpCode(HttpStatus.OK)
    async getListOptionGroup(@Body() cond: OptionGroupCondDTO, @Query() paging: PagingDTO) {
        return await this.optionService.getListOptionGroup(cond, paging);
    }

    // API lấy danh sách Option Group theo mảng IDs
    @Post('group/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async getListOptionGroupByIds(@Body('ids') ids: string[]) {
        return await this.optionService.getOptionGroupByIds(ids);
    }
}

@Controller('v1/rpc/options')
export class OptionRpcController {
    constructor(
        @Inject(OPTION_SERVICE) private readonly optionService: IOptionService,
     ) {}
    // ============================
    // RPC Controller cho Option Group
    // ============================

    // RPC lấy thông tin Option Group theo ID
    @Get('group/:id')
    @HttpCode(HttpStatus.OK)
    async getOptionGroupById(@Param('id') id: string) {
        return await this.optionService.getOptionGroupById(id);
     }

    // RPC lấy danh sách Option Group theo mảng IDs
    @Get('group/list-by-ids')
    @HttpCode(HttpStatus.OK)
    async getListOptionGroupByIds(@Body('ids') ids: string[]) {
        return await this.optionService.getOptionGroupByIds(ids);
     }
}

@Controller('v1/options/group/item')
export class OptionItemHttpController {
    constructor(
        @Inject(OPTION_SERVICE) private readonly optionService: IOptionService,
        @Inject(IMAGE_RPC) private readonly imageRpc: IPublicImageRpc,
     ) {}

     // ============================
    // HTTP Controller cho Option Item
    // ============================

    // API tạo Option Item mới
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createOptionItem(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: CreateOptionItemDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        return await this.optionService.createOptionItem(requester, dto, ip, userAgent);
    }

    // API cập nhật Option Item
    @Patch(':itemId')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async updateOptionItem(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: UpdateOptionItemDTO, @Param('itemId') itemId: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        return await this.optionService.updateOptionItem(requester, itemId, dto, ip, userAgent);
    }

    // API xóa Option Item
    @Delete(':itemId')  
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteOptionItem(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('itemId') itemId: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        return await this.optionService.deleteOptionItem(requester, itemId, ip, userAgent);
     }  

    // API lấy thông tin Option Item theo điều kiện lọc
    @Get('list')
    @HttpCode(HttpStatus.OK)
    async getListOptionItems(@Query() cond: OptionItemCondDTO, @Query() paging: PagingDTO) {
        paging = pagingDTOSchema.parse(paging);
        cond = optionItemCondDTOSchema.parse(cond);

        const result = await this.optionService.getListOptionItem(cond, paging);

        const optionItemIds = result.data.map(item => item.id);

        const images = await this.imageRpc.getImagesByRefId([...new Set(optionItemIds)], 'option');
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

        result.data = result.data.map(item => {
            const images = imageMap.get(item.id) || [];
            return { ...item, images } as OptionItem;
        })

        return paginatedResponse(result, cond);
    }

    // API lấy thông tin Option Item theo ID
    @Get(':itemId')
    @HttpCode(HttpStatus.OK)
    async getOptionItemById(@Param('itemId') itemId: string) {
        const result = await this.optionService.getOptionItemById(itemId);

        if (!result) {
            throw AppError.from(ErrOptionItemNotFound, 404);
        }

        const images = await this.imageRpc.getImagesByRefId([result.id], 'option');
        return { ...result, images } as OptionItem;
    }

    // API lấy danh sách Option Item theo điều kiện lọc

    // API lấy danh sách Option Item theo mảng IDs
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async getListOptionItemByIds(@Body('ids') ids: string[]) {
        return await this.optionService.getOptionItemsByIds(ids);  
    }
}

@Controller('v1/rpc/options/group/item')
export class OptionItemRpcController {
    constructor(
        @Inject(OPTION_SERVICE) private readonly optionService: IOptionService,
     ) {}

     // RPC lấy thông tin Option Item theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getOptionItemById(@Param('id') id: string) {
        return await this.optionService.getOptionItemById(id);
     }

    // RPC lấy danh sách Option Item theo mảng IDs
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async getListOptionItemByIds(@Body('ids') ids: string[]) {
        return await this.optionService.getOptionItemsByIds(ids);  
    }
}

@Controller('v1/options/product/config')
export class ProductOptionConfigHttpController {
    constructor(
        @Inject(OPTION_SERVICE) private readonly optionService: IOptionService,
     ) {}
    
     // ============================
    // HTTP Controller cho Product Option Config
    // ============================

    // API thiết lập cấu hình Option cho sản phẩm
    @Post()  
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async setProductOptionConfig(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: CreateProductOptionConfigDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        return await this.optionService.setProductOptionConfig(requester, dto, ip, userAgent);
     }

     // API xóa cấu hình Option của sản phẩm
    @Delete(':productOptionConfigId') 
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeProductOptionConfig(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('productOptionConfigId') productOptionConfigId: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        return await this.optionService.removeProductOptionConfig(requester, productOptionConfigId, ip, userAgent);
     }
    
    // API lấy danh sách cấu hình Option của sản phẩm theo điều kiện lọc
    @Get()
    @HttpCode(HttpStatus.OK)
    async listProductOptionConfig(@Query() cond: ProductOptionConfigCondDTO, @Query() paging: PagingDTO) {
        return await this.optionService.listProductOptionConfig(cond, paging);
    }

    // API lấy cấu hình Option của sản phẩm
    @Get(':productOptionConfigId')
    @HttpCode(HttpStatus.OK)
    async getProductOptionConfig(@Param('productOptionConfigId') productOptionConfigId: string) {
        return await this.optionService.getProductOptionConfigById(productOptionConfigId);
     }
}

@Controller('v1/rpc/options/product/config')
export class ProductOptionConfigRpcController {
    constructor(
        @Inject(OPTION_SERVICE) private readonly optionService: IOptionService,
     ) {}

     // ============================
    // RPC Controller cho Product Option Config
    // ============================

    // RPC lấy cấu hình Option của sản phẩm
    @Get('product/config/:id')
    @HttpCode(HttpStatus.OK)
    async getProductOptionConfig(@Param('id') id: string) {
        return await this.optionService.getProductOptionConfigById(id);
     }
}