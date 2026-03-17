import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { PAYMENT_SERVICE } from "../sales.di-token";
import type { IPaymentService } from "../ports/payment.port";
import { RemoteAuthGuard  } from "src/share/guard";
import { getIPv4FromReq,type PagingDTO, type ReqWithRequester } from "src/share";
import type { InitiatePaymentDTO, PaymentCondDTO, PaymentCreateDTO, PaymentUpdateDTO } from "../dtos/payment.dto";
import type { Request as RequestExpress } from "express";
import { ConfigService } from '@nestjs/config';
import { PaymentMethod } from "@prisma/client";

@Controller('v1/payments')
export class PaymentHttpController {
    constructor(
        @Inject(PAYMENT_SERVICE) private readonly paymentService: IPaymentService,
        private readonly configService: ConfigService, 
    ) {}

    // API tạo mới giao dịch thanh toán
    @Post()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() dto: PaymentCreateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.paymentService.createPayment(requester, dto, ip, userAgent);
        return { data };
    }
    // API cập nhật thông tin giao dịch thanh toán theo ID
    @Patch(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string, @Body() dto: PaymentUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.paymentService.updatePayment(requester, id, dto, ip, userAgent);
    }

    // API xóa giao dịch thanh toán theo ID
    @Delete(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.paymentService.deletePayment(requester, id, ip, userAgent);
    }

    // API lấy thông tin giao dịch thanh toán theo ID
    @Get(':id')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getById(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.paymentService.getPaymentById(requester, id);
        return { data };
    }

    // API lấy danh sách giao dịch thanh toán theo điều kiện với phân trang
    @Get()
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async list(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Query() cond: PaymentCondDTO, @Query() paging: PagingDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.paymentService.listPayments(requester, paging, cond);
        return { data };
    }
    
    // API lấy danh sách giao dịch thanh toán theo nhiều ID với phân trang
    @Post('list-by-ids')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async listByIds(@Request() req: ReqWithRequester, @Request() reqExpress: RequestExpress, @Body() ids: string[], @Query() paging: PagingDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.paymentService.listPaymentsByIds(requester, ids, paging);
        return { data };
     }

    // API khởi tạo giao dịch thanh toán cho đơn hàng
    @Post('initiate')
    @UseGuards(RemoteAuthGuard) 
    @HttpCode(HttpStatus.OK)
    async initiatePayment(@Request() req: ReqWithRequester, @Body() dto: InitiatePaymentDTO) {
        const response = await this.paymentService.initiatePayment(dto, req.requester);
        return response;
    }

    // API webhook momo để cập nhật trạng thái thanh toán từ momo
    @Post('webhook/momo') 
    @HttpCode(HttpStatus.OK)
    async handleMomoWebhook(@Body() payload: any, @Request() reqExpress: RequestExpress) {
        const signature = reqExpress.headers['x-momo-signature'] || '';
        const isValid = await this.paymentService.handleWebhook(PaymentMethod.momo, payload, signature);
        if (!isValid) return { status: 'error', message: 'Invalid Signature' };
        return { status: 'success', message: 'Webhook processed successfully' };
    }

    // API webhook vnpay để cập nhật trạng thái thanh toán từ vnpay
    @Post('webhook/vnpay')
    @HttpCode(HttpStatus.OK)
    async handleVnpayWebhookPost(@Body() query: any) {
        const isValid = await this.paymentService.handleWebhook(PaymentMethod.vnpay, {}, query);
        const returnUrl = this.configService.get<string>('VNPAY_RETURN_URL');
        if (!isValid) return { RspCode: '97', Message: 'Invalid Signature' };
        return { RspCode: '00', Message: 'Success' };
    }

    // API webhook zalo pay để cập nhật trạng thái thanh toán từ zalo pay
    @Post('webhook/zalopay')
    @HttpCode(HttpStatus.OK)
    async handleZaloPayWebhook(@Body() payload: any, @Request() reqExpress: RequestExpress) {
        const signature = reqExpress.headers['x-zalopay-signature'] || '';
        const isValid = await this.paymentService.handleWebhook(PaymentMethod.zalo, payload, signature);
        if (!isValid) return { return_code: 1, return_message: 'Invalid Signature' };
        return { return_code: 0, return_message: 'Success' };
    }

    // API xác minh trạng thái giao dịch thanh toán với cổng thanh toán
    @Post('verify')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async verifyPayment(@Request() req: ReqWithRequester, @Body() body: { gateway: string, externalPaymentId: string }) {
        const isValid = await this.paymentService.verifyPayment(body.gateway, body.externalPaymentId);
        return { isValid };
    }

    // API truy vấn trạng thái giao dịch thanh toán từ cổng thanh toán  
    @Post('query-status')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async queryPaymentStatus(@Request() req: ReqWithRequester, @Body() body: { gateway: string, externalPaymentId: string }) {
        const status = await this.paymentService.queryPaymentStatus(body.gateway, body.externalPaymentId);
        return { status };
     }
    
    // API yêu cầu hoàn tiền cho một giao dịch thanh toán
    @Post('refund')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async refundPayment(@Request() req: ReqWithRequester, @Body() body: { paymentId: string, amount?: number }) {
        const success = await this.paymentService.refundPayment(req.requester, body.paymentId, body.amount);
        return { success };
     }
    
    // API hủy một giao dịch thanh toán nếu có thể
    @Post('cancel')
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.OK)
    async cancelPayment(@Request() req: ReqWithRequester, @Body() body: { paymentId: string }) {
        const success = await this.paymentService.cancelPayment(req.requester, body.paymentId);
        return { success };
     }
}

@Controller('v1/rpc/payments')
export class PaymentRpcController {
    constructor(
        @Inject(PAYMENT_SERVICE) private readonly paymentService: IPaymentService,
    ) {}

    // RPC lấy thông tin giao dịch thanh toán theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Request() req: ReqWithRequester, @Param('id') id: string) {
        const data = await this.paymentService.getPaymentById(req.requester, id);
        return { data };
    }

    // RPC lấy danh sách giao dịch thanh toán theo nhiều ID với phân trang
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Request() req: ReqWithRequester, @Body() ids: string[], @Query() paging: PagingDTO) {
        const data = await this.paymentService.listPaymentsByIds(req.requester, ids, paging);
        return { data };
     }
}