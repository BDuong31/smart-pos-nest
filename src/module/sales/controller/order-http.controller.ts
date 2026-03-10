import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ORDER_SERVICE } from "../sales.di-token";
import type { IOrderService } from "../ports/order.port";
import { RemoteAuthGuard } from "src/share/guard";
import type { ReqWithRequester } from "src/share/interface";
import type { Request as RequestExpress } from "express";
import type { InvoiceCondDTO, InvoiceCreateDTO, InvoiceUpdateDTO, OrderCondDTO, OrderCreateDTO, OrderItemCondDTO, OrderItemCreateDTO, OrderItemOptionCondDTO, OrderItemOptionCreateDTO, OrderItemUpdateDTO, OrderTableCondDTO, OrderTableCreateDTO, OrderTableUpdateDTO, OrderUpdateDTO, OrderVoucherCondDTO, OrderVoucherCreateDTO, OrderVoucherUpdateDTO } from "../dtos/order.dto";
import { getIPv4FromReq } from "src/share/utils";
import { type PagingDTO } from "src/share";

@Controller('v1/orders')
export class OrderHttpController {
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService
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
        const data = await this.orderService.getOrderById(req.requester, id);
        return { data };
    }

    // API để lấy danh sách đơn hàng theo điều kiện với phân trang
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async list(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Query() cond: OrderCondDTO, @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrders(req.requester, paging, cond);
        return { data };
    }

    // API để lấy thông tin mục sản phẩm trong đơn hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrdersByIds(req.requester, ids, paging);
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
        const data = await this.orderService.getOrderById(req.requester, id);
        return { data };
    }
    
    // RPC để lấy danh sách đơn hàng theo điều kiện với phân trang
    @Get()
    async list(@Request() req: ReqWithRequester, @Query() cond: OrderCondDTO, @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrders(req.requester, paging, cond);
        return { data };
    }

    // RPC để lấy thông tin mục sản phẩm trong đơn hàng theo nhiều ID
    @Post('list-by-ids')
    async listByIds(@Request() req: ReqWithRequester, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrdersByIds(req.requester, ids, paging);
        return { data };
    }
}

@Controller('v1/orders/item')
export class OrderItemHttpController {  
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService
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
        const data = await this.orderService.getOrderItemById(req.requester, id);
        return { data };
    }

    // API lấy danh sách mục sản phẩm trong đơn hàng theo điều kiện với phân trang
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrderItems(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Query() cond: OrderItemCondDTO, @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderItems(req.requester, paging, cond);
        return { data };
    }

    // API lấy thông tin mục sản phẩm trong đơn hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrderItemsByIds(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderItemsByIds(req.requester, ids, paging);
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
        const data = await this.orderService.getOrderItemById(req.requester, id);
        return { data };
    }

    // RPC để lấy danh sách mục sản phẩm trong đơn hàng theo điều kiện với phân trang
    @Get()
    async listOrderItems(@Request() req: ReqWithRequester, @Query() cond: OrderItemCondDTO, @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderItems(req.requester, paging, cond);
        return { data };
    }

    // RPC để lấy thông tin mục sản phẩm trong đơn hàng theo nhiều ID
    @Post('list-by-ids')
    async listOrderItemsByIds(@Request() req: ReqWithRequester, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderItemsByIds(req.requester, ids, paging);
        return { data };
    }
}

@Controller('v1/orders/item/option')
export class OrderItemOptionHttpController {  
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService
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
        const data = await this.orderService.getOrderItemOptionById(req.requester, id);
        return { data };
    }

    // API lấy danh sách tùy chọn sản phẩm trong mục đơn hàng theo điều kiện với phân trang
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrderItemOptions(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Query() cond: OrderItemOptionCondDTO, @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderItemOptions(req.requester, paging, cond);
        return { data };
    }

    // API lấy thông tin tùy chọn sản phẩm trong mục đơn hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrderItemOptionsByIds(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderItemOptionsByIds(req.requester, ids, paging);
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
        const data = await this.orderService.getOrderItemOptionById(req.requester, id);
        return { data };
    }

    // RPC để lấy danh sách tùy chọn sản phẩm trong mục đơn hàng theo điều kiện với phân trang
    @Get()
    async listOrderItemOptions(@Request() req: ReqWithRequester, @Query() cond: OrderItemOptionCondDTO, @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderItemOptions(req.requester, paging, cond);
        return { data };
    }

    // RPC để lấy thông tin tùy chọn sản phẩm trong mục đơn hàng theo nhiều ID
    @Post('list-by-ids')
    async listOrderItemOptionsByIds(@Request() req: ReqWithRequester, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderItemOptionsByIds(req.requester, ids, paging);
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
        const data = await this.orderService.getOrderVoucherById(req.requester, id);
        return { data };
    }

    // API lấy danh sách voucher cho đơn hàng theo điều kiện với phân trang
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrderVouchers(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Query() cond: OrderVoucherCondDTO, @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderVouchers(req.requester, paging, cond);
        return { data };
    }   

    // API lấy thông tin voucher cho đơn hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrderVouchersByIds(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderVouchersByIds(req.requester, ids, paging);
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
        const data = await this.orderService.getOrderVoucherById(req.requester, id);
        return { data };
    }

    // RPC để lấy danh sách voucher cho đơn hàng theo điều kiện với phân trang
    @Get()
    async listOrderVouchers(@Request() req: ReqWithRequester, @Query() cond: OrderVoucherCondDTO, @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderVouchers(req.requester, paging, cond);
        return { data };
    }

    // RPC để lấy thông tin voucher cho đơn hàng theo nhiều ID
    @Post('list-by-ids')
    async listOrderVouchersByIds(@Request() req: ReqWithRequester, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderVouchersByIds(req.requester, ids, paging);
        return { data };
    }
}

@Controller('v1/orders/table')
export class OrderTableHttpController {  
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService
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
        const data = await this.orderService.getOrderTableById(req.requester, id);
        return { data };
    }

    // API lấy danh sách đơn hàng cho bàn theo điều kiện với phân trang
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrdersForTable(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Query() cond: OrderTableCondDTO, @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderTables(req.requester, paging, cond);
        return { data };
    }

    // API lấy thông tin đơn hàng cho bàn theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listOrdersForTableByIds(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderTablesByIds(req.requester, ids, paging);
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
        const data = await this.orderService.getOrderTableById(req.requester, id);
        return { data };
    }

    // RPC để lấy danh sách đơn hàng cho bàn theo điều kiện với phân trang
    @Get()
    async listOrdersForTable(@Request() req: ReqWithRequester, @Query() cond: OrderTableCondDTO, @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderTables(req.requester, paging, cond);
        return { data };
    }

    // RPC để lấy thông tin đơn hàng cho bàn theo nhiều ID
    @Post('list-by-ids')
    async listOrdersForTableByIds(@Request() req: ReqWithRequester, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.orderService.listOrderTablesByIds(req.requester, ids, paging);
        return { data };
    }
}

@Controller('v1/orders/invoice')
export class InvoiceHttpController {  
    constructor(
        @Inject(ORDER_SERVICE) private readonly orderService: IOrderService
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
        const data = await this.orderService.getInvoiceById(req.requester, id);
        return { data };
    }

    // API lấy danh sách hóa đơn công ty cho đơn hàng theo điều kiện với phân trang
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listInvoicesForOrder(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Query() cond: InvoiceCondDTO, @Query() paging: PagingDTO) {
        const data = await this.orderService.listInvoices(req.requester, paging, cond);
        return { data };
    }

    // API lấy thông tin hóa đơn công ty cho đơn hàng theo nhiều ID
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listInvoicesForOrderByIds(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.orderService.listInvoicesByIds(req.requester, ids, paging);
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
        const data = await this.orderService.getInvoiceById(req.requester, id);
        return { data };
    }

    // RPC để lấy danh sách hóa đơn công ty cho đơn hàng theo điều kiện với phân trang
    @Get()
    async listInvoicesForOrder(@Request() req: ReqWithRequester, @Query() cond: InvoiceCondDTO, @Query() paging: PagingDTO) {
        const data = await this.orderService.listInvoices(req.requester, paging, cond);
        return { data };
    }

    // RPC để lấy thông tin hóa đơn công ty cho đơn hàng theo nhiều ID
    @Post('list-by-ids')
    async listInvoicesForOrderByIds(@Request() req: ReqWithRequester, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.orderService.listInvoicesByIds(req.requester, ids, paging);
        return { data };
    }
}
