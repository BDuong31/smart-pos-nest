import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class MomoService {
    private config: any;

    constructor(private configService: ConfigService) {
        this.config = {
            endpoint: this.configService.get<string>('MOMO_ENDPOINT'),
            partnerCode: this.configService.get<string>('MOMO_PARTNER_CODE'),
            accessKey: this.configService.get<string>('MOMO_ACCESS_KEY'),
            secretKey: this.configService.get<string>('MOMO_SECRET_KEY'),
            returnUrl: this.configService.get<string>('MOMO_RETURN_URL'),
            ipnUrl: this.configService.get<string>('MOMO_IPN_URL'),
        };
    }

    // ==== Tạo URL thanh toán Momo ====
    async createPaymentUrl(amount: number, paymentId: string, orderInfo: string, userId: string, method: string): Promise<{ paymentUrl: string; externalTransactionId: string; }> {
        const requestId = uuidv7();
        const requestType = method;
        const extraData = "eyJ1c2VybmFtZSI6ICJtb21vIn0=";

        const rawSignature = 
            `accessKey=${this.config.accessKey}` +
            `&amount=${amount}` +
            `&extraData=${extraData}` +
            `&ipnUrl=${this.config.ipnUrl}` +
            `&orderId=${paymentId}` +
            `&orderInfo=${orderInfo}` +
            `&partnerCode=${this.config.partnerCode}` +
            `&redirectUrl=${this.config.returnUrl}/${paymentId}` +
            `&requestId=${requestId}` +
            `&requestType=${requestType}`;

        const signature = crypto
            .createHmac('sha256', this.config.secretKey)
            .update(rawSignature).digest('hex');

        const requestBody = {
            partnerCode: this.config.partnerCode,
            requestId: requestId,
            amount: amount,
            orderId: paymentId,
            orderInfo: orderInfo,
            redirectUrl: `${this.config.returnUrl}/${paymentId}`,
            ipnUrl: this.config.ipnUrl,
            extraData: extraData,
            requestType: requestType,
            signature: signature,
            lang: 'vi',
        };

        try {
            const result = await axios.post(`${this.config.endpoint}/create`, requestBody);
            return {
                paymentUrl: result.data.payUrl,
                externalTransactionId: result.data.transId,
            }
        } catch (error) {
            console.error('MOMO Create Error:', error.response.data);
            throw new Error('Failed to create Momo payment URL');
        }
    }

    // ==== Xác thực webhook từ Momo ====
    verifyWebhook(body: any): {
        isValid: boolean;
        paymentId?: string;
        externalTransactionId?: string;
        amount?: number;
        success?: boolean;
    } {
        const { signature, ...restOfBody } = body;
        
        const rawSignature = 
            `accessKey=${this.config.accessKey}` +
            `&amount=${restOfBody.amount}` +
            `&extraData=${restOfBody.extraData}` +  
            `&message=${restOfBody.message}` +
            `&orderId=${restOfBody.orderId}` +
            `&orderInfo=${restOfBody.orderInfo}` +
            `&orderType=${restOfBody.orderType}` +
            `&partnerCode=${restOfBody.partnerCode}` +
            `&payType=${restOfBody.payType}` +
            `&requestId=${restOfBody.requestId}` +
            `&responseTime=${restOfBody.responseTime}` +
            `&resultCode=${restOfBody.resultCode}` +
            `&transId=${restOfBody.transId}`;

        const expectedSignature = crypto.createHmac('sha256', this.config.secretKey).update(rawSignature).digest('hex');

        const received = Buffer.from(signature, 'hex');

        const expected = Buffer.from(expectedSignature, 'hex');

        const isValid = crypto.timingSafeEqual(received, expected);

        if (!isValid) {
            return { isValid: false };
        }
        
        return {
            isValid: true,
            paymentId: restOfBody.orderId,
            externalTransactionId: restOfBody.transId,
            amount: parseInt(restOfBody.amount, 10),
            success: restOfBody.resultCode === 0,
        };
    }

    // ==== Truy vấn trạng thái thanh toán từ Momo ====
    async queryPayment(orderId: string, requestId: string): Promise<{ isValid: boolean, amount?: number, success?: boolean, raw?: any; }> {
        const rawSignature =
            `accessKey=${this.config.accessKey}` +
            `&orderId=${orderId}` +
            `&partnerCode=${this.config.partnerCode}` +
            `&requestId=${requestId}`;
        const signature = crypto
            .createHmac('sha256', this.config.secretKey)
            .update(rawSignature)
            .digest('hex');

        const body = {
            partnerCode: this.config.partnerCode,
            requestId: requestId,
            orderId: orderId,
            signature,
            lang: 'vi',
        };

        const response = await axios.post(
            `${this.config.endpoint}/query`,
            body
        );

        return {
            isValid: true,
            amount: Number(response.data.amount),
            success: response.data.resultCode === 0,
            raw: response.data,
        };
    }

    // 
    async refundPayment(orderId: string, transId: string, amount: number): Promise<{success: boolean; raw: any;}> {
        const requestId = uuidv7();

        const rawSignature =
            `accessKey=${this.config.accessKey}` +
            `&amount=${amount}` +
            `&description=Refund for ${orderId}` +
            `&orderId=${orderId}` +
            `&partnerCode=${this.config.partnerCode}` +
            `&requestId=${requestId}` +
            `&transId=${transId}`;

        const signature = crypto
            .createHmac('sha256', this.config.secretKey)
            .update(rawSignature)
            .digest('hex');

        const body = {
            partnerCode: this.config.partnerCode,
            accessKey: this.config.accessKey,
            requestId,
            orderId: orderId,
            amount: amount,
            transId: transId,
            description: `Refund for ${orderId}`,
            signature,
            lang: 'vi',
        };

        const response = await axios.post(
            `${this.config.endpoint}/refund`,
            body
        );

        return {
            success: response.data.resultCode === 0,
            raw: response.data,
        }
    }
}