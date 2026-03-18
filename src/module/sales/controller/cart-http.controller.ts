import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { CART_SERVICE } from "../sales.di-token";
import type { ICartService } from "../ports/cart.port";
import { RemoteAuthGuard } from "src/share/guard";
import { cartItemCondDTOSchema, cartItemOptionCondDTOSchema, type CartCondDTO, type CartCreateDTO, type CartItemCondDTO, type CartItemCreateDTO, type CartItemOptionCondDTO, type CartItemOptionCreateDTO, type CartItemOptionUpdateDTO, type CartItemUpdateDTO, type CartUpdateDTO } from "../dtos/cart.dto";
import { getIPv4FromReq,type IPublicProductRpc,type IPublicVariantRpc, paginatedResponse, PRODUCT_RPC, VARIANT_RPC, type PagingDTO, type ReqWithRequester, AppError, pagingDTOSchema, PublicProduct, PublicVariant, OPTION_ITEM_RPC,type IPublicOptionItemRpc, PublicOptionItem } from "src/share";
import type { Request as RequestExpress } from "express";
import { Cart, CartItem, CartItemOption, ErrCartItemNotFound, ErrCartItemOptionNotFound } from "../models/cart.model";

// Các controller liên quan đến giỏ hàng (Cart)
@Controller('v1/carts')
export class CartHttpController {
    constructor(
        @Inject(CART_SERVICE) private readonly cartService: ICartService, 
    ){}

    // API tạo mới giỏ hàng
    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createCart(@Request() req: ReqWithRequester,@Request() reqExpress: RequestExpress, @Body() dto: CartCreateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.cartService.createCart(req.requester, dto, ip, userAgent);
        return { data }
    }

    // API cập nhật giỏ hàng
    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateCart(@Request() req: ReqWithRequester,@Request() reqExpress: RequestExpress, @Param('id') id: string, @Body() dto: CartUpdateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.cartService.updateCart(req.requester, id, dto, ip, userAgent);
    }

    // API xóa giỏ hàng
    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteCart(@Request() req: ReqWithRequester,@Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.cartService.deleteCart(req.requester, id, ip, userAgent);
    }

    // API lấy thông tin giỏ hàng theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getCartById(@Param('id') id: string) {
        const data = await this.cartService.getCart(id);
        return { data }
    }

    // API lấy danh sách giỏ hàng theo điều kiện  
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listCart(@Query() cond: CartCondDTO, @Query() paging: PagingDTO) {
        const data = await this.cartService.listCart(cond, paging);
        return paginatedResponse(data, paging);
    }

    // API lấy danh sách giỏ hàng theo nhiều ID
    @Get('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listCartByIds(@Body('ids') ids: string[]) {
        const data = await this.cartService.listCartByIds(ids);
        return { data }
    }

}

@Controller('v1/rpc/carts')
export class CartRpcController {
    constructor(
        @Inject(CART_SERVICE) private readonly cartService: ICartService, 
    ){}

    // RPC lấy thông tin giỏ hàng theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getCartById(@Param('id') id: string) {
        const data = await this.cartService.getCart(id);
        return { data }
    }

    // RPC lấy danh sách giỏ hàng theo nhiều ID
    @Get('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listCartByIds(@Body('ids') ids: string[]) {
        const data = await this.cartService.listCartByIds(ids);
        return { data }
    }
}

// Các controller liên quan đến mục trong giỏ hàng (Cart Item)
@Controller('v1/carts/item')
export class CartItemHttpController {
    constructor(
        @Inject(CART_SERVICE) private readonly cartService: ICartService,
        @Inject(PRODUCT_RPC) private readonly productRpc: IPublicProductRpc,
        @Inject(VARIANT_RPC) private readonly variantRpc: IPublicVariantRpc, 
    ){}

    // API thêm mục vào giỏ hàng
    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createCartItem(@Request() req: ReqWithRequester,@Request() reqExpress: RequestExpress, @Body() dto: CartItemCreateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.cartService.createCartItem(req.requester, dto, ip, userAgent);
        return { data }
     }

    // API cập nhật mục trong giỏ hàng
    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateCartItem(@Request() req: ReqWithRequester,@Request() reqExpress: RequestExpress, @Param('id') id: string, @Body() dto: CartItemUpdateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.cartService.updateCartItem(req.requester, id, dto, ip, userAgent);
    }

    // API xóa mục khỏi giỏ hàng
    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteCartItem(@Request() req: ReqWithRequester,@Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.cartService.deleteCartItem(req.requester, id, ip, userAgent);
     }

    // API lấy thông tin mục trong giỏ hàng theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getCartItemById(@Param('id') id: string) {
        const result = await this.cartService.getCartItem(id);

        if (!result) {
            throw AppError.from(ErrCartItemNotFound, 404);
        }

        const product = await this.productRpc.findById(result.productId);
        const variant = await this.variantRpc.findById(result.variantId);

        const data = { ...result, product, variant } as CartItem;
        return { data }
     }  

    // API lấy danh sách mục trong giỏ hàng theo điều kiện  
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listCartItem(@Query() cond: CartItemCondDTO, @Query() paging: PagingDTO) {
        paging = pagingDTOSchema.parse(paging);
        cond = cartItemCondDTOSchema.parse(cond);
        const result = await this.cartService.listCartItem(cond, paging);

        const productIds = result.data.map(item => item.productId);
        const variantIds = result.data.map(item => item.variantId);

        const products = await this.productRpc.findByIds([...new Set(productIds)]);
        const variants = await this.variantRpc.findByIds([...new Set(variantIds)]);

        const productMap: Record<string, PublicProduct> = {};
        const variantMap: Record<string, PublicVariant> = {};

        if (products) {
            products.map(product => {
                productMap[product.id] = product;
            });
        }

        if (variants) {
            variants.map(variant => {
                variantMap[variant.id] = variant;
            });
        }

        result.data = result.data.map(item => {
            const product = productMap[item.productId];
            const variant = variantMap[item.variantId];
            return { ...item, product, variant } as CartItem;
        })
        return paginatedResponse(result, paging);
     }

    // API lấy danh sách mục trong giỏ hàng theo nhiều ID
    @Get('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listCartItemByIds(@Body('ids') ids: string[]) {
        const data = await this.cartService.listCartItemByIds(ids);
        return { data }
     }
}

@Controller('v1/rpc/carts/item')
export class CartItemRpcController {
    constructor(
        @Inject(CART_SERVICE) private readonly cartService: ICartService, 
    ){}

    // RPC lấy thông tin mục trong giỏ hàng theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getCartItemById(@Param('id') id: string) {
        const data = await this.cartService.getCartItem(id);
        return { data }
     }

    // RPC lấy danh sách mục trong giỏ hàng theo nhiều ID
    @Get('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listCartItemByIds(@Body('ids') ids: string[]) {
        const data = await this.cartService.listCartItemByIds(ids);
        return { data }
     }
}

// Các controller liên quan đến tùy chọn mục trong giỏ hàng (Cart Item Option)
@Controller('v1/carts/item/option')
export class CartItemOptionHttpController {
    constructor(
        @Inject(CART_SERVICE) private readonly cartService: ICartService, 
        @Inject(OPTION_ITEM_RPC) private readonly optionItemRpc: IPublicOptionItemRpc,
    ){}

    // API thêm tùy chọn vào mục trong giỏ hàng
    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createCartItemOption(@Request() req: ReqWithRequester,@Request() reqExpress: RequestExpress, @Body() dto: CartItemOptionCreateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.cartService.createCartItemOption(req.requester, dto, ip, userAgent);
        return { data }
     }

    // API cập nhật tùy chọn trong mục giỏ hàng 
    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateCartItemOption(@Request() req: ReqWithRequester,@Request() reqExpress: RequestExpress, @Param('id') id: string, @Body() dto: CartItemOptionUpdateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.cartService.updateCartItemOption(req.requester, id, dto, ip, userAgent);
     }

    // API xóa tùy chọn khỏi mục trong giỏ hàng
    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteCartItemOption(@Request() req: ReqWithRequester,@Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.cartService.deleteCartItemOption(req.requester, id, ip, userAgent);
     }
    
    // API lấy thông tin tùy chọn trong mục giỏ hàng theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getCartItemOptionById(@Param('id') id: string) {
        const result = await this.cartService.getCartItemOption(id);

        if (!result) {
            throw AppError.from(ErrCartItemOptionNotFound, 404);
        }

        const optionItem = await this.optionItemRpc.findById(result.optionItemId);

        const data = { ...result, optionItem } as CartItemOption;

        return { data }
     }

    // API lấy danh sách tùy chọn trong mục giỏ hàng theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listCartItemOption( @Query() cond: CartItemOptionCondDTO, @Query() paging: PagingDTO) {
        paging = pagingDTOSchema.parse(paging);
        cond = cartItemOptionCondDTOSchema.parse(cond);
        const result = await this.cartService.listCartItemOption(cond, paging);

        const optionItemIds = result.data.map(item => item.optionItemId);

        const optionItems = await this.optionItemRpc.findByIds([...new Set(optionItemIds)]);

        const optionItemMap: Record<string, PublicOptionItem> = {};

        if (optionItems) {
            optionItems.map(optionItem => {
                optionItemMap[optionItem.id] = optionItem;
            });
        }

        result.data = result.data.map(item => {
            const optionItem = optionItemMap[item.optionItemId];
            return { ...item, optionItem } as CartItemOption;
        })
        
        return paginatedResponse(result, paging);
     }

    // API lấy danh sách tùy chọn trong mục giỏ hàng theo nhiều ID
    @Get('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listCartItemOptionByIds(@Body('ids') ids: string[]) {
        const data = await this.cartService.listCartItemOptionByIds(ids);
        return {
            data,
        }
     }
}

@Controller('v1/rpc/carts/item/option')
export class CartItemOptionRpcController {
    constructor(
        @Inject(CART_SERVICE) private readonly cartService: ICartService, 
    ){}

    // RPC lấy thông tin tùy chọn trong mục giỏ hàng theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getCartItemOptionById(@Param('id') id: string) {
        const data = await this.cartService.getCartItemOption(id);
        return {
            data,
        }
     }

    // RPC lấy danh sách tùy chọn trong mục giỏ hàng theo nhiều ID
    @Get('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listCartItemOptionByIds(@Body('ids') ids: string[]) {
        const data = await this.cartService.listCartItemOptionByIds(ids);
        return {
            data,
        }
     }
}