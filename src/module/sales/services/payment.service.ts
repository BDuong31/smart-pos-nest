import { Inject, Injectable } from '@nestjs/common';
import { type IPaymentRepository,  IPaymentService } from '../ports/payment.port';
import { PAYMENT_REPOSITORY } from '../sales.di-token';
import { ErrPaymentNotFound, ErrPaymentNotPending, PaymentMethod, PaymentStatus, type PaymentTransaction } from '../models/payment.model';
import { Requester } from 'src/share/interface';
import { PaymentCreateDTO, paymentCreateDTOSchema, PaymentUpdateDTO, paymentUpdateDTOSchema, PaymentCondDTO, paymentCondDTOSchema, InitiatePaymentDTO, InitiatePaymentSchema } from '../dtos/payment.dto';
import { MomoService } from './payment/momo.service';
import { ZalopayService } from './payment/zalo.service';
import { VnpayService } from './payment/vnpay.service';
import { v7 } from 'uuid';
import { AppError, ErrBadGateway, ErrInvalidRequest, Paginated, PagingDTO } from 'src/share';

// Lớp PaymentService cung cấp các phương thức để quản lý giao dịch thanh toán
@Injectable()
export class PaymentService implements IPaymentService {
    constructor(
        @Inject(PAYMENT_REPOSITORY) private readonly paymentRepo: IPaymentRepository,
        private readonly momoService: MomoService,
        private readonly zalopayService: ZalopayService,
        private readonly vnpayService: VnpayService,
    ){}

    // Tạo giao dịch thanh toán mới
    async createPayment(requester: Requester, paymentCreateDTO: PaymentCreateDTO, ip: string, userAgent: string): Promise<PaymentTransaction> {
        // 1. Kiểm tra dữ liệu đầu vào
        const data = paymentCreateDTOSchema.parse(paymentCreateDTO)

        // 2. Tạo đối tượng PaymentTransaction mới
        const newPayment: PaymentTransaction = {
            id: v7(),
            orderId: data.orderId,
            externalTransactionId: data.externalTransactionId,
            amount: data.amount,
            method: data.method,
            gatewayResponse: data.gatewayResponse,
            status: PaymentStatus.PENDING,
            paidAt: data.paidAt,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.paymentRepo.insertPayment(newPayment)

        return newPayment
    }

    // Cập nhật thông tin giao dịch thanh toán theo ID
    async updatePayment(requester: Requester, paymentId: string, paymentUpdateDTO: PaymentUpdateDTO, ip: string, userAgent: string): Promise<PaymentTransaction> {
        // 1. Kiểm tra dữ liệu đầu vào
        const data = paymentUpdateDTOSchema.parse(paymentUpdateDTO)

        // 2. Lấy thông tin giao dịch thanh toán hiện tại
        const existingPayment = await this.paymentRepo.getPaymentById(paymentId)
        if (!existingPayment) {
            throw AppError.from(ErrPaymentNotFound, 404)
        }

        // 3. Cập nhật thông tin giao dịch thanh toán
        const updatedPayment: PaymentUpdateDTO = {
            ...data,
            updatedAt: new Date(),
        }

        await this.paymentRepo.updatePayment(paymentId, updatedPayment)

        const payment = await this.paymentRepo.getPaymentById(paymentId)
        if (!payment) {
            throw AppError.from(ErrPaymentNotFound, 404)
        }
        return payment
    }

    // Xóa giao dịch thanh toán theo ID
    async deletePayment(requester: Requester, paymentId: string, ip: string, userAgent: string): Promise<void> {
        // 1. Kiểm tra nếu giao dịch thanh toán tồn tại
        const existingPayment = await this.paymentRepo.getPaymentById(paymentId)
        if (!existingPayment) {
            throw AppError.from(ErrPaymentNotFound, 404)
        }

        // 2. Xóa giao dịch thanh toán
        await this.paymentRepo.deletePayment(paymentId)
    }

    // Lấy thông tin giao dịch thanh toán theo ID
    async getPaymentById(paymentId: string): Promise<PaymentTransaction | null> {
        return await this.paymentRepo.getPaymentById(paymentId);
    }

    // Lấy danh sách giao dịch thanh toán theo điều kiện    
    async listPayments(pagingDTO: PagingDTO, paymentCondDTO: PaymentCondDTO): Promise<Paginated<PaymentTransaction>> {
        return await this.paymentRepo.listPayments(paymentCondDTO, pagingDTO);
    }

    // Lấy danh sách giao dịch thanh toán theo nhiều ID
    async listPaymentsByIds(paymentIds: string[]): Promise<PaymentTransaction[]> {
        return await this.paymentRepo.listPaymentsByIds(paymentIds);
    }

    // Khởi tạo giao dịch thanh toán và trả về URL thanh toán nếu có    
    async initiatePayment(dto: InitiatePaymentDTO, user: Requester): Promise<{ paymentUrl?: string; paymentId?: string; success: boolean }> {
        const data = InitiatePaymentSchema.parse(dto)

        const payment = await this.paymentRepo.getPaymentById(data.paymentId!)

        if (!payment) {
            throw AppError.from(ErrPaymentNotFound, 404)
        }

        if (payment.status !== PaymentStatus.PENDING) {
        throw AppError.from(ErrPaymentNotPending, 400)
        }

        let paymentUrl: string | undefined
        let externalTransactionId: string | undefined

        switch (payment.method) {
            case PaymentMethod.MOMO:{
                const momoResult = await this.momoService.createPaymentUrl(
                    payment.amount, 
                    payment.id, 
                    `Payment for order ${payment.orderId}`, 
                    user.sub, 
                    data.methodChild || 'captureWallet'
                )
                paymentUrl = momoResult.paymentUrl
                externalTransactionId = momoResult.externalTransactionId
                break
            }

            case PaymentMethod.ZALO: {
                const zalo = await this.zalopayService.createPaymentUrl(
                    payment.amount,
                    payment.id,
                    `Payment for order ${payment.orderId}`,
                    user.sub,
                    data.methodChild || 'payWithZalo',
                )
                paymentUrl = zalo.paymentUrl
                externalTransactionId = zalo.externalTransactionId
                break
            }

            case PaymentMethod.VNPAY: {
                const vnpayResult= await this.vnpayService.createPaymentUrl(
                    payment.amount,
                    payment.id,
                    user.sub,
                    data.methodChild || 'payWithVnPay',
                )
                paymentUrl = vnpayResult.paymentUrl
                externalTransactionId = vnpayResult.externalTransactionId
                break
            }

            case PaymentMethod.CASH:{
                return { success: true, paymentId: payment.id };
            }
            default:
                throw new Error('Unsupported payment method')
        }

        if (externalTransactionId) {
            await this.paymentRepo.updatePayment(payment.id, {
                externalTransactionId: externalTransactionId,
                updatedAt: new Date(),
             })
        }

        return {
            paymentUrl,
            paymentId: payment.id,
            success: true,
        }
    }

    // Xử lý webhook từ cổng thanh toán để cập nhật trạng thái giao dịch
    async handleWebhook(gateway: string, payload: any, signatureOrQuery: any): Promise<boolean>{
        switch(gateway) {
            case PaymentMethod.MOMO: {
                const verify = this.momoService.verifyWebhook(payload)
                if (!verify.isValid) return false

                return await this._updatePaymentStatus(
                    verify.paymentId!,
                    verify.success!,
                    payload
                )
            }

            case PaymentMethod.ZALO: {
                const isValid = this.zalopayService.verifyWebhook(payload)
                if (!isValid) return false

                const data = JSON.parse(payload.data)
                const payment = await this.paymentRepo.listPayments(
                    { externalTransactionId: data.app_trans_id },
                    { page: 1, limit: 1 }
                )
                if (payment.data.length === 0) return false
                return await this._updatePaymentStatus(
                    payment.data[0].id,
                    data.return_code === 1,
                    data
                )
            }

            case PaymentMethod.VNPAY: {
                const result = await this.vnpayService.verifyIpn(signatureOrQuery)
                if (!result.isSuccess) return false

                return await this._updatePaymentStatus(
                    result.vnp_TxnRef!,
                    result.isSuccess,
                    result
                )
            }

            case PaymentMethod.CASH:
                // Đối với tiền mặt, có thể không cần webhook. Trạng thái sẽ được cập nhật trực tiếp khi nhân viên xác nhận thanh toán.
                return true

            default:
                throw new Error('Unsupported payment gateway')
        }
    };

    // Xác minh trạng thái giao dịch thanh toán với cổng thanh toán 
    async verifyPayment(gateway: string, externalPaymentId: string): Promise<boolean> {
        const result = await this.paymentRepo.listPayments(
            { externalTransactionId: externalPaymentId },
            { page: 1, limit: 1 },
        );
        return result.data.length > 0 &&
            result.data[0].status === PaymentStatus.SUCCESS;
    }

    // Truy vấn trạng thái giao dịch thanh toán từ cổng thanh toán
    async queryPaymentStatus(gateway: string, externalPaymentId: string): Promise<PaymentStatus> {
       switch (gateway) {
            case PaymentMethod.MOMO: {
                const result = await this.momoService.queryPayment(
                    externalPaymentId,
                    crypto.randomUUID()
                )
                return result.success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED
            }

            case PaymentMethod.ZALO: {
                const result = await this.zalopayService.queryPaymentStatus(
                    externalPaymentId
                )
                return result.return_code === 1
                    ? PaymentStatus.SUCCESS
                    : PaymentStatus.FAILED
            }

            case PaymentMethod.VNPAY: {
                const payment = await this.paymentRepo.listPayments(
                    { externalTransactionId: externalPaymentId },
                    { page: 1, limit: 1 }
                )

                if (!payment.data.length) throw ErrPaymentNotFound;

                const p = payment.data[0];

                const result = await this.vnpayService.queryPaymentStatus(
                    p.id,
                    p.paidAt || p.createdAt,
                    `Payment for ${p.orderId}`,
                    p.createdAt
                )

                return result?.vnp_ResponseCode === "00"
                    ? PaymentStatus.SUCCESS
                    : PaymentStatus.FAILED
            }

            default:
                throw ErrInvalidRequest;
        }
    }

    // Yêu cầu hoàn tiền cho một giao dịch thanh toán
    async refundPayment(requester: Requester, paymentId: string, amount?: number): Promise<boolean> {
        const payment = await this.paymentRepo.getPaymentById(paymentId)
        if (!payment) throw AppError.from(ErrPaymentNotFound, 404)

        if (payment.status !== PaymentStatus.SUCCESS) {
            throw ErrInvalidRequest;
        }

        const refundAmount = amount || payment.amount
        switch (payment.method) {
            case PaymentMethod.MOMO: {
                const result = await this.momoService.refundPayment(
                    payment.id,
                    payment.externalTransactionId!,
                    refundAmount,
                )

                if (!result.success) throw ErrBadGateway;

                break
            }

            case PaymentMethod.ZALO: {
                const result = await this.zalopayService.refundPayment(
                    payment.externalTransactionId!,
                    refundAmount,
                    `Refund for payment ${payment.id}`
                )

                if (!result.success) throw ErrBadGateway;
                break
            }

            case PaymentMethod.VNPAY: {
                const result = await this.vnpayService.refundPayment(
                    payment.id,
                    refundAmount,
                    payment.paidAt!,
                    payment.externalTransactionId!,
                    requester.sub,
                )
                if (!result.isSuccess) throw ErrBadGateway;
                break
            }

            default:
                throw ErrInvalidRequest;
        }

        await this.paymentRepo.updatePayment(payment.id, {
            status: PaymentStatus.FAILED,
        })

        return true
    }

    // Hủy một giao dịch thanh toán nếu có thể
    async cancelPayment(requester: Requester, paymentId: string): Promise<boolean> {
                const payment = await this.paymentRepo.getPaymentById(paymentId)
        if (!payment) throw AppError.from(ErrPaymentNotFound, 404)

        if (payment.status !== PaymentStatus.PENDING) {
            throw ErrInvalidRequest
        }

        await this.paymentRepo.updatePayment(paymentId, {
            status: PaymentStatus.FAILED,
        })

        return true
    }

    // Phương thức hỗ trợ để cập nhật thông tin giao dịch thanh toán
    private async _updatePaymentStatus(
        paymentId: string,
        success: boolean,
        raw: any
    ): Promise<boolean> {

        const payment = await this.paymentRepo.getPaymentById(paymentId)
        if (!payment) return false

        if (payment.status === PaymentStatus.SUCCESS) return true

        await this.paymentRepo.updatePayment(paymentId, {
            status: success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
            gatewayResponse: raw,
            paidAt: success ? new Date() : undefined,
        })

        return true
    }
}