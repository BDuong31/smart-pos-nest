import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { CART_SERVICE } from "../sales.di-token";
import type { ICartService } from "../ports/cart.port";
import { RemoteAuthGuard } from "src/share/guard";
import type { CartCondDTO, CartCreateDTO, CartItemCondDTO, CartItemCreateDTO, CartItemOptionCondDTO, CartItemOptionCreateDTO, CartItemOptionUpdateDTO, CartItemUpdateDTO, CartUpdateDTO } from "../dtos/cart.dto";
import { getIPv4FromReq, type PagingDTO, type ReqWithRequester } from "src/share";
import type { Request as RequestExpress } from "express";

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
        return {
            data,
        }
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
        return {
            data,
        }
    }

    // API lấy danh sách giỏ hàng theo điều kiện  
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listCart(@Query() cond: CartCondDTO, @Query() paging: PagingDTO) {
        const data = await this.cartService.listCart(cond, paging);
        return {
            data,
        }
    }

    // API lấy danh sách giỏ hàng theo nhiều ID
    @Get('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listCartByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const data = await this.cartService.listCartByIds(ids, paging);
        return {
            data,
        }
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
        return {
            data,
        }
    }

    // RPC lấy danh sách giỏ hàng theo nhiều ID
    @Get('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listCartByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const data = await this.cartService.listCartByIds(ids, paging);
        return {
            data,
        }
    }
}

// Các controller liên quan đến mục trong giỏ hàng (Cart Item)
@Controller('v1/carts/item')
export class CartItemHttpController {
    constructor(
        @Inject(CART_SERVICE) private readonly cartService: ICartService, 
    ){}

    // API thêm mục vào giỏ hàng
    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createCartItem(@Request() req: ReqWithRequester,@Request() reqExpress: RequestExpress, @Body() dto: CartItemCreateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.cartService.createCartItem(req.requester, dto, ip, userAgent);
        return {
            data,
        }
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
        const data = await this.cartService.getCartItem(id);
        return {
            data,
        }
     }  

    // API lấy danh sách mục trong giỏ hàng theo điều kiện  
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listCartItem(@Query() cond: CartItemCondDTO, @Query() paging: PagingDTO) {
        const data = await this.cartService.listCartItem(cond, paging);
        return {
            data,
        }
     }

    // API lấy danh sách mục trong giỏ hàng theo nhiều ID
    @Get('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listCartItemByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const data = await this.cartService.listCartItemByIds(ids, paging);
        return {
            data,
        }
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
        return {
            data,
        }
     }

    // RPC lấy danh sách mục trong giỏ hàng theo nhiều ID
    @Get('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listCartItemByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const data = await this.cartService.listCartItemByIds(ids, paging);
        return {
            data,
        }
     }
}

// Các controller liên quan đến tùy chọn mục trong giỏ hàng (Cart Item Option)
@Controller('v1/carts/item/option')
export class CartItemOptionHttpController {
    constructor(
        @Inject(CART_SERVICE) private readonly cartService: ICartService, 
    ){}

    // API thêm tùy chọn vào mục trong giỏ hàng
    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createCartItemOption(@Request() req: ReqWithRequester,@Request() reqExpress: RequestExpress, @Body() dto: CartItemOptionCreateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.cartService.createCartItemOption(req.requester, dto, ip, userAgent);
        return {
            data,
        }
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
        const data = await this.cartService.getCartItemOption(id);
        return {
            data,
        }
     }

    // API lấy danh sách tùy chọn trong mục giỏ hàng theo điều kiện
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listCartItemOption( @Query() cond: CartItemOptionCondDTO, @Query() paging: PagingDTO) {
        const data = await this.cartService.listCartItemOption(cond, paging);
        return {
            data,
        }
     }

    // API lấy danh sách tùy chọn trong mục giỏ hàng theo nhiều ID
    @Get('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listCartItemOptionByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const data = await this.cartService.listCartItemOptionByIds(ids, paging);
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
    async listCartItemOptionByIds(@Body('ids') ids: string[], @Query() paging: PagingDTO) {
        const data = await this.cartService.listCartItemOptionByIds(ids, paging);
        return {
            data,
        }
     }
}