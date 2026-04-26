import { Injectable, BadRequestException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { VNPay, dateFormat, QueryDr } from 'vnpay';

interface VNPayVerifyResult {
  isSuccess: boolean;
  vnp_ResponseCode?: string | number;
  vnp_TxnRef?: string;
  vnp_TransactionNo?: string | number;
  vnp_Amount?: string | number;
  [key: string]: any;
}

@Injectable()
export class VnpayService {
    private vnpay: VNPay;
    private returnUrl: string;
    private ipnUrl: string;

    constructor(private configService: ConfigService) {
        this.returnUrl = this.configService.get<string>('VNPAY_RETURN_URL')!;
        this.ipnUrl = this.configService.get<string>('VNPAY_IPN_URL')!;
        
        this.vnpay = new VNPay({
            // vnpayHost: this.configService.get<string>('VNPAY_URL')!,
            tmnCode: this.configService.get<string>('VNPAY_TMN_CODE')!,
            secureSecret: this.configService.get<string>('VNPAY_HASH_SECRET')!,
        });
    }

    // ==== Tạo URL thanh toán VNPAY ====
    async createPaymentUrl(amount: number, paymentId: string, userId: string, bankCode: string): Promise<{ paymentUrl: string; externalTransactionId: string }> {
        try {
            const url = await this.vnpay.buildPaymentUrl({
                vnp_Amount: amount,
                vnp_TxnRef: paymentId,
                vnp_OrderInfo: `Payment for ${paymentId}`,
                vnp_BankCode: bankCode,
                vnp_ReturnUrl: this.returnUrl,
                vnp_IpAddr: '127.0.0.1', 
            });
            return { paymentUrl: url, externalTransactionId: paymentId }    ;
        } catch (error) {
            console.error("VNPAY Build URL Error:", error);
            throw new Error("Failed to create VNPAY URL");
        }
    }

    // ==== Xác thực trả về từ VNPAY ====
    async verifyReturn(query: any): Promise<VNPayVerifyResult> {
        try {
            const result: VNPayVerifyResult = await this.vnpay.verifyReturnUrl(query);
            return result; // Trả về boolean
        } catch (error) {
            console.error('VNPAY verify failed:', error);
            throw new Error('Failed to verify VNPAY response');
        }
    }

    // ==== Xác thực IPN từ VNPAY ====
    async verifyIpn(query: any): Promise<VNPayVerifyResult> {
        try {
            const result: VNPayVerifyResult = await this.vnpay.verifyIpnCall(query);

            return result;
        } catch (error) {
        console.error('VNPAY verify IPN failed:', error);
        throw new BadRequestException('Invalid VNPay IPN data');
        }
    }

    // ==== Tra cứu trạng thái giao dịch VNPAY ====
    async queryPaymentStatus(txnRef: string, transactionDate: Date, orderInfo: string, createDate: Date): Promise<any> {
        try {
            const payload = {
            vnp_RequestId: randomUUID(),
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: orderInfo,
            vnp_TransactionNo: 0,
            vnp_TransactionDate: Number(
                dateFormat(transactionDate, 'yyyyMMddHHmmss'),
            ),
            vnp_CreateDate: Number(
                dateFormat(createDate, 'yyyyMMddHHmmss'),
            ),
            vnp_IpAddr: '127.0.0.1',
            };

            return await this.vnpay.queryDr(payload);
        } catch (error) {
            console.error('VNPAY query failed:', error);
            throw new BadRequestException('Failed to query VNPay transaction');
        }
    }

    // 
    async refundPayment(txnRef: string, amount: number, transactionDate: Date, transactionNo: string, user: string): Promise<any> {
        try {
            const result = await this.vnpay.refund({
                vnp_RequestId: randomUUID(),
                vnp_TxnRef: txnRef,
                vnp_Amount: amount * 100,
                vnp_OrderInfo: `Refund for ${txnRef}`,
                vnp_TransactionDate: Number(dateFormat(transactionDate, 'yyyyMMddHHmmss')),
                vnp_TransactionNo: Number(transactionNo),
                vnp_CreateBy: user,
                vnp_CreateDate: Number(dateFormat(new Date(), 'yyyyMMddHHmmss')),
                vnp_TransactionType: '02',
                vnp_IpAddr: '127.0.0.1',
            });
            return result;
        } catch (error) {
            console.error('VNPAY refund failed:', error);
            throw new BadRequestException('Failed to refund VNPay transaction');
        }
    }
}