import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as CryptoJS from 'crypto-js';
import * as qs from 'qs';
import dayjs from 'dayjs';

@Injectable()
export class ZalopayService {
    private config: any;

    constructor(private configService: ConfigService) {
        this.config = {
            app_id: this.configService.get<string>('ZALOPAY_APP_ID'),
            key1: this.configService.get<string>('ZALOPAY_KEY_1'),
            key2: this.configService.get<string>('ZALOPAY_KEY_2'),
            endpoint: this.configService.get<string>('ZALOPAY_ENDPOINT'),
            ipn_url: this.configService.get<string>('ZALOPAY_IPN_URL'),
            return_url: this.configService.get<string>('ZALOPAY_RETURN_URL'),
        };
    }

    // ==== Tạo URL thanh toán ZaloPay ====
    async createPaymentUrl(amount: number, paymentId: string, orderInfo: string, userId: string, bankCode: string): Promise<{ paymentUrl: string; externalTransactionId: string; }> {
        const app_trans_id = `${dayjs().format('YYMMDD')}_${Math.floor(Math.random() * 100000)}`;

        const embed_data = {
            redirecturl: `${this.config.return_url}/${paymentId}`,
        };

        const items = [{}];

        const order: any = {
            app_id: this.config.app_id,
            app_trans_id,
            app_user: userId,
            app_time: Date.now(),
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount,
            description: orderInfo,
            bank_code: bankCode,
            callback_url: this.config.ipn_url,
        };

        const data = [
            order.app_id,
            order.app_trans_id,
            order.app_user,
            order.amount,
            order.app_time,
            order.embed_data,
            order.item
        ].join('|');

        order.mac = CryptoJS.HmacSHA256(data, this.config.key1).toString();

        try {
            const result = await axios.post(
                `${this.config.endpoint}/create`,
                qs.stringify(order),       // <--- phải stringify theo form-urlencoded
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }
            );

            if (result.data.return_code !== 1) {
                console.error("ZaloPay Error:", result.data);
                throw new BadRequestException(result.data.return_message);
            }

            return {
                paymentUrl: result.data.order_url,
                externalTransactionId: app_trans_id,
            }

        } catch (error) {
            console.error("ZALOPAY Create Error:", error.response?.data || error.message);
            throw new BadRequestException("Failed to create ZaloPay payment URL");
        }
    }

    // ==== Xác thực trả về từ ZaloPay ====
    verifyWebhook(body: any): boolean {
        try {
            const mac = CryptoJS.HmacSHA256(body.data, this.config.key2).toString();

            if (mac !== body.mac) {
                console.warn('ZaloPay Webhook MAC mismatch');
                return false;
            }
            return true;

        } catch (error) {
            console.error('ZaloPay Verify Error:', error);
            return false;
        }
    }

    // Tra cứu trạng thái giao dịch ZaloPay
    async queryPaymentStatus(appTransId: string): Promise<any> {
        try {
            const postData = {
                app_id: this.config.app_id,
                app_trans_id: appTransId,
            };

            const data = postData.app_id + '|' + postData.app_trans_id + '|' + this.config.key1;

            postData['mac'] = CryptoJS.HmacSHA256(data, this.config.key1).toString();

            const response = await axios.post(
                this.config.endpoint + '/query',
                qs.stringify(postData),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
            );

            return response.data;
            } catch (error) {
            console.error('ZaloPay query error:', error);
            throw new BadRequestException('Failed to query ZaloPay transaction');
        }
    }

    // ==== Hoàn tiền giao dịch ZaloPay ====
    async refundPayment(zpTransId: string, amount: number, description: string): Promise<any> {
        try {
            const refund_id = `${dayjs().format('YYMMDD')}_${Date.now()}`;

            const postData: any = {
                app_id: this.config.app_id,
                zp_trans_id: zpTransId,
                amount,
                description,
                timestamp: Date.now(),
            };

            const data =
                postData.app_id +
                '|' +
                postData.zp_trans_id +
                '|' +
                postData.amount +
                '|' +
                postData.description +
                '|' +
                postData.timestamp;

            postData.mac = CryptoJS.HmacSHA256(data, this.config.key1).toString();

            const response = await axios.post(
                `${this.config.endpoint}/partialrefund`,
                qs.stringify(postData),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
            );

            return response.data;
        } catch (error) {
            console.error('ZaloPay refund error:', error);
            throw new BadRequestException('Failed to refund ZaloPay transaction');
        }
    }

}
