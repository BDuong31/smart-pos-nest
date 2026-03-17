import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Request, UseGuards, Query } from "@nestjs/common";
import { PRODUCT_SERVICE } from "../catalog.di-token";
import {type IProductService } from "../ports/product.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import {AppError, CATEGORY_RPC, getIPv4FromReq,IMAGE_RPC,type IPublicCategoryRpc, type IPublicImageRpc,type IPublicVariantRpc, paginatedResponse,type PagingDTO, type ReqWithRequester, UserRole, pagingDTOSchema, PublicCategory, PublicImage, PublicComboItem, PublicVariant, PublicProduct, type IPublicProductRpc, PRODUCT_RPC, VARIANT_RPC } from "src/share";
import { type VariantDTO, type ProductCreatedDTO, type ComboUpdateDTO, type ComboCreateDTO, type ComboCondDTO, type ComboItemCreateDTO, type ComboItemUpdateDTO, type ComboItemCondDTO, type ProductCondDTO, productCondDTOSchema, variantCondDTOSchema,type VariantCondDTO, comboItemCondDTOSchema, comboCondDTOSchema } from "../dtos/product.dto";
import type { Request as ExpressRequest } from "express";
import { ApiCreatedResponse, ApiOperation } from "@nestjs/swagger";
import { Combo, ComboItem, ErrProductNotFound, Product } from "../models/product.model";

@Controller('v1/products')
export class ProductHttpController {
    constructor(
        @Inject(PRODUCT_SERVICE) private readonly productService: IProductService, 
        @Inject(CATEGORY_RPC) private readonly categoryRpc: IPublicCategoryRpc,
        @Inject(IMAGE_RPC) private readonly imageRpc: IPublicImageRpc,
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
        const result = await this.productService.getProductById(id);

        if (!result) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        const category = await this.categoryRpc.findById(result.categoryId);

        const images = await this.imageRpc.getImagesByRefId([result.id], 'product');

        const data = { ...result, category, images} as Product;
        return { data };
    }

    // API lấy danh sách sản phẩm theo điều kiện
    @Get()
    @HttpCode(HttpStatus.OK)
    async listProduct(@Request() req: ReqWithRequester, @Query() dto: ProductCondDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = productCondDTOSchema.parse(dto);

        const result = await this.productService.getListProduct(dto, paging);

        const categoryIds = result.data.map(item => item.categoryId);
        const productIds = result.data.map(item => item.id);

        const categories = await this.categoryRpc.findByIds([...new Set(categoryIds)]);
        const images = await this.imageRpc.getImagesByRefId([...new Set(productIds)], 'product');

        const categoryMap: Record<string, PublicCategory> = {};
        const imageMap: Record<string, PublicImage[]> = {};

        if (categories){
            categories.forEach(category => {
                categoryMap[category.id] = category;
            });
        }

        if (images){
            images.forEach(image => {
                if (!imageMap[image.refId]) {
                    imageMap[image.refId] = [];
                }
                imageMap[image.refId].push(image);
            });
        }

        result.data = result.data.map(item => {
            const category = categoryMap[item.categoryId];
            const images = imageMap[item.id] || [];
            return { ...item, category, images } as Product;
        })

        return paginatedResponse(result, dto);
    }

    // API lấy danh sách sản phẩm theo mảng IDs
    @Get('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listProductByIds(@Body() dto: { ids: string[] }){
        const idArray = dto.ids;
        const data = await this.productService.getProductByIds(idArray);
        return { data };
    }

    // API tìm kiếm sản phẩm theo từ khóa
    @Get('search')
    @HttpCode(HttpStatus.OK)
    async searchProduct(@Query('keyword') keyword: string, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        const result = await this.productService.getProductBySearch(keyword, paging);

        const categoryIds = result.data.map(item => item.categoryId);
        const productIds = result.data.map(item => item.id);

        const categories = await this.categoryRpc.findByIds([...new Set(categoryIds)]);
        const images = await this.imageRpc.getImagesByRefId([...new Set(productIds)], 'product');

        const categoryMap: Record<string, PublicCategory> = {};
        const imageMap: Record<string, PublicImage[]> = {};

        if (categories){
            categories.forEach(category => {
                categoryMap[category.id] = category;
            });
        }

        if (images){
            images.forEach(image => {
                if (!imageMap[image.refId]) {
                    imageMap[image.refId] = [];
                }
                imageMap[image.refId].push(image);
            });
        }

        result.data = result.data.map(item => {
            const category = categoryMap[item.categoryId];
            const images = imageMap[item.id] || [];
            return { ...item, category, images } as Product;
        })
        return paginatedResponse(result, { keyword });
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

    // RPC lấy danh sách sản phẩm theo mảng IDs
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listProductByIds(@Body() dto: { ids: string[] }){
        const idArray = dto.ids;
        const data = await this.productService.getProductByIds(idArray);
        return { data };
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
    async listVariant(@Request() req: ReqWithRequester, @Query() dto: VariantCondDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = variantCondDTOSchema.parse(dto);
        const data = await this.productService.getListVariant(dto, paging);
        return paginatedResponse(data, dto);
    }

    // API lấy danh sách biến thể sản phẩm theo mảng IDs
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listVariantByIds(@Request() req: ReqWithRequester, @Body() dto: { ids: string[] }){
        const idArray = dto.ids;
        const data = await this.productService.getVariantByIds(idArray);
        return { data };
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
    
    // RPC lấy danh sách biến thể sản phẩm theo mảng IDs   
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listVariantByIds(@Body() dto: { ids: string[] }){
        const idArray = dto.ids;
        const data = await this.productService.getVariantByIds(idArray);
        return { data };
    } 
}

@Controller('v1/combos')
export class ComboHttpController {
    constructor(
        @Inject(PRODUCT_SERVICE) private readonly productService: IProductService, 
        @Inject(IMAGE_RPC) private readonly imageRpc: IPublicImageRpc,
    ){}

    // API tạo mới combo sản phẩm
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createCombo(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: ComboCreateDTO){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const data = await this.productService.createCombo(req.requester, dto, ip, userAgent);
        return { data };
     }

    // API cập nhật combo sản phẩm
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateCombo(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: ComboUpdateDTO, @Param('id') id: string){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.productService.updateCombo(req.requester, id, dto, ip, userAgent);
     }

    // API xóa combo sản phẩm
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteCombo(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.productService.deleteCombo(req.requester, id, ip, userAgent);
     }

    // API lấy thông tin combo sản phẩm theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getCombo(@Param('id') id: string){
        const result = await this.productService.getComboById(id);
    
        if (!result) {
            throw AppError.from(ErrProductNotFound, 404);
        }
        const images = await this.imageRpc.getImagesByRefId([result?.id], 'combo');

        const data = { ...result, images} as Combo;
        return { data };
     }

    // API lấy danh sách combo sản phẩm theo điều kiện
    @Get()
    @HttpCode(HttpStatus.OK)
    async listCombo(@Request() req: ReqWithRequester, @Query() dto: ComboCondDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = comboCondDTOSchema.parse(dto);

        const result = await this.productService.getListCombo(dto, paging);

        const comboIds = result.data.map(item => item.id);

        const images = await this.imageRpc.getImagesByRefId([...new Set(comboIds)], 'combo');

        const imageMap: Record<string, PublicImage[]> = {}; 

        if (images){
            images.forEach(image => {
                if (!imageMap[image.refId]) {
                    imageMap[image.refId] = [];
                }
                imageMap[image.refId].push(image);
            });
        }   

        result.data = result.data.map(item => {
            const images = imageMap[item.id] || [];
            return { ...item, images } as Combo;
        })

        return paginatedResponse(result, dto);
     }

    // API lấy danh sách combo sản phẩm theo mảng IDs
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listComboByIds(@Request() req: ReqWithRequester, @Body() dto: { ids: string[] }){
        const idArray = dto.ids;
        const data = await this.productService.getComboByIds(idArray);
        return { data };
     }
}

@Controller('v1/rpc/combos')
export class ComboRpcController {
    constructor(
        @Inject(PRODUCT_SERVICE) private readonly productService: IProductService, 
     ) {}

    // RPC lấy thông tin combo sản phẩm theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getCombo(@Param('id') id: string){
        const data = await this.productService.getComboById(id);
        return { data };
     }

    // RPC lấy danh sách combo sản phẩm theo mảng IDs   
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listComboByIds(@Body() dto: { ids: string[] }){
        const idArray = dto.ids;
        const data = await this.productService.getComboByIds(idArray);
        return { data };
     }
}

@Controller('v1/combos/items')
export class ComboItemHttpController {
    constructor(
        @Inject(PRODUCT_SERVICE) private readonly productService: IProductService,
        @Inject(PRODUCT_RPC) private readonly productRpc: IPublicProductRpc,  
        @Inject(VARIANT_RPC) private readonly variantRpc: IPublicVariantRpc,
     ) {}

    // API tạo mới mục combo sản phẩm
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createComboItem(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: ComboItemCreateDTO, @Query('comboId') comboId: string){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const data = await this.productService.createComboItem(req.requester, dto, ip, userAgent);
        return { data };
     }

    // API cập nhật mục combo sản phẩm
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateComboItem(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: ComboItemUpdateDTO, @Query('comboId') comboId: string, @Param('id') id: string){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.productService.updateComboItem(req.requester, id, dto, ip, userAgent);
     }

    // API xóa mục combo sản phẩm
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteComboItem(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Query('comboId') comboId: string, @Param('id') id: string){
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.productService.deleteComboItem(req.requester, id, ip, userAgent);
     }

    // API lấy thông tin mục combo sản phẩm theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getComboItem(@Request() req: ReqWithRequester, @Param('id') id: string){
        const result = await this.productService.getComboItemById(id);

        if (!result) {
            throw AppError.from(ErrProductNotFound, 404);
        }

        const product = await this.productRpc.findById(result?.productId);

        const variant = await this.variantRpc.findById(result?.variantId);

        const data = { ...result, product, variant} as ComboItem;
        return { data };
     }

    // API lấy danh sách mục combo sản phẩm theo điều kiện
    @Get()
    @HttpCode(HttpStatus.OK)
    async listComboItem(@Request() req: ReqWithRequester, @Query() dto: ComboItemCondDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = comboItemCondDTOSchema.parse(dto);

        const result = await this.productService.getListComboItem( dto, paging);

        const productIds = result.data.map(item => item.productId);
        const variantIds = result.data.map(item => item.variantId);

        const products = await this.productRpc.findByIds([...new Set(productIds)]);
        const variants = await this.variantRpc.findByIds([...new Set(variantIds)]);

        const productMap: Record<string, PublicProduct> = {};
        const variantMap: Record<string, PublicVariant> = {};

        if (products){
            products.forEach(product => {
                productMap[product.id] = product;
            });
        }

        if (variants){
            variants.forEach(variant => {
                variantMap[variant.id] = variant;
            });
        }

        result.data = result.data.map(item => {
            const product = productMap[item.productId];
            const variant = variantMap[item.variantId];
            return { ...item, product, variant } as ComboItem;
        })
        return paginatedResponse(result, dto);
     }

    // API lấy danh sách mục combo sản phẩm theo mảng IDs
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listComboItemByIds(@Request() req: ReqWithRequester,@Body() dto: { ids: string[] }){
        const idArray = dto.ids;
        const data = await this.productService.getComboItemsByIds( idArray);
        return { data };
     }
}

@Controller('v1/rpc/combos/items')
export class ComboItemRpcController {
    constructor(
        @Inject(PRODUCT_SERVICE) private readonly productService: IProductService, 
     ) {}   

    // RPC lấy thông tin mục combo sản phẩm theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getComboItem(@Param('id') id: string){
        const data = await this.productService.getComboItemById(id);
        return { data };
     }

    // RPC lấy danh sách mục combo sản phẩm theo mảng IDs
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listComboItemByIds(@Body() dto: { ids: string[] }){
        const idArray = dto.ids;
        const data = await this.productService.getComboItemsByIds( idArray);
        return { data };
     }
}