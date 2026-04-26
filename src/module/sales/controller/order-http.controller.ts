import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ORDER_SERVICE } from "../sales.di-token";
import type { IOrderService } from "../ports/order.port";
import { RemoteAuthGuard } from "src/share/guard";
import type { IPublicOptionItemRpc, IPublicOrderRpc, IPublicProductRpc, IPublicTableRpc, IPublicUserRpc, IPublicVariantRpc, ReqWithRequester } from "src/share/interface";
import type { Request as RequestExpress } from "express";
import { invoiceCondDTOSchema, orderCondDTOSchema, orderItemCondDTOSchema, orderItemOptionCondDTOSchema, orderTableCondDTOSchema, type InvoiceCondDTO, type InvoiceCreateDTO, type InvoiceUpdateDTO, type OrderCondDTO, type OrderCreateDTO, type OrderItemCondDTO, type OrderItemCreateDTO, type OrderItemOptionCondDTO, type OrderItemOptionCreateDTO, type OrderItemUpdateDTO, type OrderTableCondDTO, type OrderTableCreateDTO, type OrderTableUpdateDTO, type OrderUpdateDTO, type OrderVoucherCondDTO, type OrderVoucherCreateDTO, type OrderVoucherUpdateDTO } from "../dtos/order.dto";
import { getIPv4FromReq, paginatedResponse } from "src/share/utils";
import { AppError, OPTION_ITEM_RPC, ORDER_RPC, pagingDTOSchema, PRODUCT_RPC, PublicOptionItem, PublicOrder, PublicProduct, PublicTable, PublicUser, PublicVariant, TABLE_RPC, USER_RPC, VARIANT_RPC, type PagingDTO } from "src/share";
import { ErrInvoiceNotFound, ErrOrderItemNotFound, ErrOrderItemOptionNotFound, ErrOrderNotFound, ErrOrderTableNotFound, Invoice, Order, OrderItem, OrderItemOption, OrderTable } from "../models/order.model";

@Controller('v1/orders')
export class OrderHttpController {
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService,
        @Inject(USER_RPC) private readonly userRpc: IPublicUserRpc,
    ){}

    // API để tạo mới đơn hàng
    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: OrderCreateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.orderService.createOrder(req.requester, dto, ip, userAgent);
        return { data };
    }
    
    // API để cập nhật thông tin đơn hàng
    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string, @Body() dto: OrderUpdateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.orderService.updateOrder(req.requester, id, dto, ip, userAgent);
    }
    // API để xóa đơn hàng theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.orderService.deleteOrder(req.requester, id, ip, userAgent);
    }
    // API để lấy thông tin đơn hàng theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getById(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const result = await this.orderService.getOrderById(id);

        if (!result) {
            throw AppError.from(ErrOrderNotFound, 404);
        }

        const user = await this.userRpc.getUserById(result.userId);

        const data = { ...result, user } as Order;
        return { data };
    }

    // API để lấy danh sách đơn hàng theo điều kiện với phân trang
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async list(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Query() cond: OrderCondDTO, @Query() paging: PagingDTO) {
        paging = pagingDTOSchema.parse(paging);
        cond = orderCondDTOSchema.parse(cond);

        const result = await this.orderService.listOrders(paging, cond);

        console.log(result);

        const userIds = result.data.map(item => item.userId);

        const users = await this.userRpc.getUsersByIds([...new Set(userIds)]);

        const userMap: Record<string, PublicUser> = {};
        
        if (users) {
            users.map(user => {
                userMap[user.id] = user;
            });
        }

        result.data = result.data.map(item => {
            const user = userMap[item.userId];
            return { ...item, user } as Order;
        });

        return paginatedResponse(result, paging)
    }

    // API để lấy thông tin mục sản phẩm trong đơn hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() ids: string[]) {
        const result = await this.orderService.listOrdersByIds(ids);

        const userIds = result.map(item => item.userId);

        const users = await this.userRpc.getUsersByIds([...new Set(userIds)]);

        const userMap: Record<string, PublicUser> = {};

        if (users) {
            users.map(user => {
                userMap[user.id] = user;
            });
        }

        const data = result.map(item => {
            const user = userMap[item.userId];
            return { ...item, user } as Order;
        });

        return { data };
    }   
}

@Controller('v1/rpc/orders')
export class OrderRpcController {
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService
    ){} 

    // RPC để lấy thông tin đơn hàng theo ID
    @Get(':id')
    async getById(@Request() req: ReqWithRequester, @Param('id') id: string) {
        const data = await this.orderService.getOrderById(id);
        return { data };
    }
    
    // RPC để lấy thông tin mục sản phẩm trong đơn hàng theo nhiều ID
    @Post('list-by-ids')
    async listByIds(@Request() req: ReqWithRequester, @Body() ids: string[]) {
        const data = await this.orderService.listOrdersByIds( ids);
        return { data };
    }
}

@Controller('v1/orders/item')
export class OrderItemHttpController {  
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService,
        @Inject(PRODUCT_RPC) private readonly userRpc: IPublicProductRpc,
        @Inject(VARIANT_RPC) private readonly variantRpc: IPublicVariantRpc,
    ){}

    // API tạo mới mục sản phẩm trong đơn hàng
    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createOrderItem(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: OrderItemCreateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.orderService.createOrderItem(req.requester, dto, ip, userAgent);
        return { data };
    }

    // API cập nhật thông tin mục sản phẩm trong đơn hàng
    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateOrderItem(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string, @Body() dto: OrderItemUpdateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.orderService.updateOrderItem(req.requester, id, dto, ip, userAgent);
    }

    // API xóa mục sản phẩm trong đơn hàng theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteOrderItem(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.orderService.deleteOrderItem(req.requester, id, ip, userAgent);
    }

    // API lấy thông tin mục sản phẩm trong đơn hàng theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getOrderItemById(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const result = await this.orderService.getOrderItemById(id);
        
        if (!result) {
            throw AppError.from(ErrOrderItemNotFound, 404);
        }

        const product = await this.userRpc.findById(result.productId);
        const variant = await this.variantRpc.findById(result.variantId);

        const data = { ...result, product, variant} as OrderItem;
        return { data };
    }

    // API lấy danh sách mục sản phẩm trong đơn hàng theo điều kiện với phân trang
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrderItems(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Query() cond: OrderItemCondDTO, @Query() paging: PagingDTO) {
        paging = pagingDTOSchema.parse(paging);
        cond = orderItemCondDTOSchema.parse(cond);

        const data = await this.orderService.listOrderItems(paging, cond);

        const productIds = data.data.map(item => item.productId);
        const variantIds = data.data.map(item => item.variantId);

        const products = await this.userRpc.findByIds([...new Set(productIds)]);    
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

        data.data = data.data.map(item => { 
            const product = productMap[item.productId];
            const variant = variantMap[item.variantId];
            return { ...item, product, variant } as OrderItem;
        });

        return paginatedResponse(data, paging);
    }

    // API lấy thông tin mục sản phẩm trong đơn hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrderItemsByIds(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() ids: string[]) {
        const result = await this.orderService.listOrderItemsByIds(ids);

        const productIds = result.map(item => item.productId);
        const variantIds = result.map(item => item.variantId);

        const products = await this.userRpc.findByIds([...new Set(productIds)]);
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

        const data = result.map(item => {
            const product = productMap[item.productId];
            const variant = variantMap[item.variantId];
            return { ...item, product, variant } as OrderItem;
        });

        return { data };
    }
}

@Controller('v1/rpc/orders/item')
export class OrderItemRpcController {  
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService
    ){}

    // RPC để lấy thông tin mục sản phẩm trong đơn hàng theo ID
    @Get(':id')
    async getOrderItemById(@Request() req: ReqWithRequester, @Param('id') id: string) {
        const data = await this.orderService.getOrderItemById(id);
        return { data };
    }

    // RPC để lấy thông tin mục sản phẩm trong đơn hàng theo nhiều ID
    @Post('list-by-ids')
    async listOrderItemsByIds(@Request() req: ReqWithRequester, @Body() ids: string[]) {
        const data = await this.orderService.listOrderItemsByIds(ids);
        return { data };
    }
}

@Controller('v1/orders/item/option')
export class OrderItemOptionHttpController {  
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService,
        @Inject(OPTION_ITEM_RPC) private readonly optionItemRpc: IPublicOptionItemRpc,
    ){}

    // API tạo mới tùy chọn sản phẩm trong mục đơn hàng
    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createOrderItemOption(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: OrderItemOptionCreateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.orderService.createOrderItemOption(req.requester, dto, ip, userAgent);
        return { data };
    }

    // API cập nhật thông tin tùy chọn sản phẩm trong mục đơn hàng
    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateOrderItemOption(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string, @Body() dto: OrderItemOptionCreateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.orderService.updateOrderItemOption(req.requester, id, dto, ip, userAgent);
    }

    // API xóa tùy chọn sản phẩm trong mục đơn hàng theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteOrderItemOption(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.orderService.deleteOrderItemOption(req.requester, id, ip, userAgent);
    }

    // API lấy thông tin tùy chọn sản phẩm trong mục đơn hàng theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getOrderItemOptionById(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const result = await this.orderService.getOrderItemOptionById(id);

        if (!result) {
            throw AppError.from(ErrOrderItemOptionNotFound, 404);
        }

        const optionItem = await this.optionItemRpc.findById(result.optionItemId);

        const data = { ...result, optionItem } as OrderItemOption;
        return { data };
    }

    // API lấy danh sách tùy chọn sản phẩm trong mục đơn hàng theo điều kiện với phân trang
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrderItemOptions(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Query() cond: OrderItemOptionCondDTO, @Query() paging: PagingDTO) {
        paging = pagingDTOSchema.parse(paging);
        cond = orderItemOptionCondDTOSchema.parse(cond);

        const result = await this.orderService.listOrderItemOptions(paging, cond);

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
            return { ...item, optionItem } as OrderItemOption;
        });    
        return paginatedResponse(result, paging);
    }

    // API lấy thông tin tùy chọn sản phẩm trong mục đơn hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrderItemOptionsByIds(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() ids: string[]) {
        const result = await this.orderService.listOrderItemOptionsByIds(ids);

        const optionItemIds = result.map(item => item.optionItemId);

        const optionItems = await this.optionItemRpc.findByIds([...new Set(optionItemIds)]);

        const optionItemMap: Record<string, PublicOptionItem> = {};

        if (optionItems) {
            optionItems.map(optionItem => {
                optionItemMap[optionItem.id] = optionItem;
            });
        }

        const data = result.map(item => {
            const optionItem = optionItemMap[item.optionItemId];
            return { ...item, optionItem } as OrderItemOption;
        });
        return { data };
    }
}

@Controller('v1/rpc/orders/item/option')
export class OrderItemOptionRpcController {  
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService
    ){}

    // RPC để lấy thông tin tùy chọn sản phẩm trong mục đơn hàng theo ID
    @Get(':id')
    async getOrderItemOptionById(@Request() req: ReqWithRequester, @Param('id') id: string) {
        const data = await this.orderService.getOrderItemOptionById(id);
        return { data };
    }

    // RPC để lấy thông tin tùy chọn sản phẩm trong mục đơn hàng theo nhiều ID
    @Post('list-by-ids')
    async listOrderItemOptionsByIds(@Request() req: ReqWithRequester, @Body() ids: string[]) {
        const data = await this.orderService.listOrderItemOptionsByIds(ids);
        return { data };
    }
}

@Controller('v1/orders/voucher')
export class OrderVoucherHttpController {  
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService
    ){}

    // API tạo mới voucher cho đơn hàng
    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createOrderVoucher(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: OrderVoucherCreateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.orderService.createOrderVoucher(req.requester, dto, ip, userAgent);
        return { data };
    }

    // API cập nhật thông tin voucher cho đơn hàng
    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateOrderVoucher(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string, @Body() dto: OrderVoucherUpdateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.orderService.updateOrderVoucher(req.requester, id, dto, ip, userAgent);
    }

    // API xóa voucher cho đơn hàng theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteOrderVoucher(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.orderService.deleteOrderVoucher(req.requester, id, ip, userAgent);
    }   

    // API lấy thông tin voucher cho đơn hàng theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getOrderVoucherById(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const data = await this.orderService.getOrderVoucherById(id);
        return { data };
    }

    // API lấy danh sách voucher cho đơn hàng theo điều kiện với phân trang
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrderVouchers(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Query() cond: OrderVoucherCondDTO, @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderVouchers(paging, cond);
        return { data };
    }   

    // API lấy thông tin voucher cho đơn hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrderVouchersByIds(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() ids: string[]) {
        const data = await this.orderService.listOrderVouchersByIds(ids);
        return { data };
    }
}

@Controller('v1/rpc/orders/voucher')
export class OrderVoucherRpcController {  
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService
    ){} 

    // RPC để lấy thông tin voucher cho đơn hàng theo ID
    @Get(':id')
    async getOrderVoucherById(@Request() req: ReqWithRequester, @Param('id') id: string) {
        const data = await this.orderService.getOrderVoucherById(id);
        return { data };
    }

    // RPC để lấy thông tin voucher cho đơn hàng theo nhiều ID
    @Post('list-by-ids')
    async listOrderVouchersByIds(@Request() req: ReqWithRequester, @Body() ids: string[]) {
        const data = await this.orderService.listOrderVouchersByIds(ids);
        return { data };
    }
}

@Controller('v1/orders/table')
export class OrderTableHttpController {  
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService,
        @Inject(TABLE_RPC) private readonly tableRpc: IPublicTableRpc,
    ){}

    // API tạo mới đơn hàng cho bàn
    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createOrderForTable(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: OrderTableCreateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.orderService.createOrderTable(req.requester, dto, ip, userAgent);
        return { data };
    }

    // API cập nhật thông tin đơn hàng cho bàn
    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateOrderForTable(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string, @Body() dto: OrderTableUpdateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.orderService.updateOrderTable(req.requester, id, dto, ip, userAgent);
    }

    // API xóa đơn hàng cho bàn theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteOrderForTable(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.orderService.deleteOrderTable(req.requester, id, ip, userAgent);
    }

    // API lấy thông tin đơn hàng cho bàn theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getOrderForTableById(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const result = await this.orderService.getOrderTableById( id);

        if (!result) {
            throw AppError.from(ErrOrderTableNotFound, 404);
        }

        const table = await this.tableRpc.findById(result.tableId);

        const data = { ...result, table } as OrderTable;
        return { data };
    }

    // API lấy danh sách đơn hàng cho bàn theo điều kiện với phân trang
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrdersForTable(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Query() cond: OrderTableCondDTO, @Query() paging: PagingDTO) {
        paging = pagingDTOSchema.parse(paging);
        cond = orderTableCondDTOSchema.parse(cond);
        const result = await this.orderService.listOrderTables(paging, cond);

        const tableIds = result.data.map(item => item.tableId);

        const tables = await this.tableRpc.findByIds([...new Set(tableIds)]);

        const tableMap: Record<string, PublicTable> = {};

        if (tables) {
            tables.map(table => {
                tableMap[table.id] = table;
            });
        }

        result.data = result.data.map(item => {
            const table = tableMap[item.tableId];
            return { ...item, table } as OrderTable;
        });

        return paginatedResponse(result, paging);
    }

    // API lấy thông tin đơn hàng cho bàn theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrdersForTableByIds(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() ids: string[]) {
        const result = await this.orderService.listOrderTablesByIds(ids);

        const tableIds = result.map(item => item.tableId);

        const tables = await this.tableRpc.findByIds([...new Set(tableIds)]);

        const tableMap: Record<string, PublicTable> = {};

        if (tables) {
            tables.map(table => {
                tableMap[table.id] = table;
            });
        }

        const data = result.map(item => {
            const table = tableMap[item.tableId];
            return { ...item, table } as OrderTable;
        });

        return { data };
    }
}

@Controller('v1/rpc/orders/table')
export class OrderTableRpcController {  
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService
    ){} 

    // RPC để lấy thông tin đơn hàng cho bàn theo ID
    @Get(':id')
    async getOrderForTableById(@Request() req: ReqWithRequester, @Param('id') id: string) {
        const data = await this.orderService.getOrderTableById(id);
        return { data };
    }

    // RPC để lấy thông tin đơn hàng cho bàn theo nhiều ID
    @Post('list-by-ids')
    async listOrdersForTableByIds(@Request() req: ReqWithRequester, @Body() ids: string[]) {
        const data = await this.orderService.listOrderTablesByIds(ids);
        return { data };
    }
}

@Controller('v1/orders/invoice')
export class InvoiceHttpController {  
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService,
        @Inject(ORDER_RPC) private readonly orderRpc: IPublicOrderRpc,
    ){}

    // API tạo mới hóa đơn công ty cho đơn hàng
    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createInvoiceForOrder(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: InvoiceCreateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.orderService.createInvoice(req.requester, dto, ip, userAgent);
        return { data };
    }

    // API cập nhật thông tin hóa đơn công ty cho đơn hàng
    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateInvoiceForOrder(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string, @Body() dto: InvoiceUpdateDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.orderService.updateInvoice(req.requester, id, dto, ip, userAgent);
    }

    // API xóa hóa đơn công ty cho đơn hàng theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteInvoiceForOrder(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.orderService.deleteInvoice(req.requester, id, ip, userAgent);
    }   

    // API lấy thông tin hóa đơn công ty cho đơn hàng theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getInvoiceForOrderById(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const result = await this.orderService.getInvoiceById(id);

        if (!result) {
            throw AppError.from(ErrInvoiceNotFound, 404);
        }

        const order = await this.orderRpc.findById(result.orderId);

        const data = { ...result, order } as InvoiceCreateDTO;
        return { data };
    }

    // API lấy danh sách hóa đơn công ty cho đơn hàng theo điều kiện với phân trang
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listInvoicesForOrder(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Query() cond: InvoiceCondDTO, @Query() paging: PagingDTO) {
        paging = pagingDTOSchema.parse(paging);
        cond = invoiceCondDTOSchema.parse(cond);
        const result = await this.orderService.listInvoices(paging, cond);

        const orderIds = result.data.map(item => item.orderId);

        const orders = await this.orderRpc.findByIds([...new Set(orderIds)]);

        const orderMap: Record<string, PublicOrder> = {};

        if (orders) {
            for (const order of orders) {
                orderMap[order.id] = order;
            }
        }

        result.data = result.data.map(item => {
            const order = orderMap[item.orderId];
            return { ...item, order } as Invoice;
        })

        return paginatedResponse(result, paging);
    }

    // API lấy thông tin hóa đơn công ty cho đơn hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listInvoicesForOrderByIds(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() ids: string[]) {
        const result = await this.orderService.listInvoicesByIds(ids);

        const orderIds = result.map(item => item.orderId);

        const orders = await this.orderRpc.findByIds([...new Set(orderIds)]);

        const orderMap: Record<string, PublicOrder> = {};

        if (orders) {
            for (const order of orders) {
                orderMap[order.id] = order;
            }
        }

        const data = result.map(item => {
            const order = orderMap[item.orderId];
            return { ...item, order } as Invoice;
        });

        return { data };
    }
}

@Controller('v1/rpc/orders/invoice')    
export class InvoiceRpcController {  
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService
    ){} 

    // RPC để lấy thông tin hóa đơn công ty cho đơn hàng theo ID
    @Get(':id')
    async getInvoiceForOrderById(@Request() req: ReqWithRequester, @Param('id') id: string) {
        const data = await this.orderService.getInvoiceById(id);
        return { data };
    }

    // RPC để lấy thông tin hóa đơn công ty cho đơn hàng theo nhiều ID
    @Post('list-by-ids')
    async listInvoicesForOrderByIds(@Request() req: ReqWithRequester, @Body() ids: string[]) {
        const data = await this.orderService.listInvoicesByIds(ids);
        return { data };
    }
}
