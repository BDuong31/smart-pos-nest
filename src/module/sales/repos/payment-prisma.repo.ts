import prisma from 'src/share/components/prisma'
import { Injectable } from '@nestjs/common';
import { PaymentTransaction } from '../models/payment.model';
import type { PaymentCreateDTO, PaymentUpdateDTO, PaymentCondDTO } from '../dtos/payment.dto';
import type { IPaymentRepository } from '../ports/payment.port';
import type { PaymentTransaction as PaymentTransactionPrisma } from '@prisma/client';
import { Paginated, PagingDTO } from 'src/share/data-model';

// Lớp PaymentReposiory cung cấp phương thức truy vấn dữ liệu giao dịch thanh toán từ Prisma
@Injectable()
export class PaymentPrismaRepo implements IPaymentRepository {
    // Lấy giao dịch thanh toán theo ID
    async getPaymentById(paymentId: string): Promise<PaymentTransaction | null> {
        const data = await prisma.paymentTransaction.findFirst({ where: { id: paymentId } });

        if (!data) return null;
        
        return this._toModel(data);
    }

    // Lấy danh sách giao dịch thanh toán theo điều kiện
    async listPayments(cond: PaymentCondDTO, paging: PagingDTO): Promise<Paginated<PaymentTransaction>> {
        const { orderId, externalTransactionId, method, status, paidAt, ...rest } = cond; 

        let where = {
            ...rest,
        }

        if (orderId) {  
            where = {
                ...where,
                orderId: orderId,
            }
        }

        if (externalTransactionId) {
            where = {
                ...where,
                externalTransactionId: externalTransactionId,
            }
        }

        if (method) {
            where = {
                ...where,
                method: method,
            }
        }

        if (status) {   
            where = {
                ...where,
                status: status,
            }
        }

        if (paidAt) {
            where = {
                ...where,
                paidAt: paidAt,
            }
        }

        const total = await prisma.paymentTransaction.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.paymentTransaction.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { createdAt: 'desc' },
        }); 

        return {
            data: result.map(this._toModel),
            paging,
            total
        };
    }

    // Lấy danh sách giao dịch thanh toán theo nhiều ID
    async listPaymentsByIds(ids: string[]): Promise<PaymentTransaction[]> {
        const data = await prisma.paymentTransaction.findMany({ where: { id: { in: ids } } });

        return data.map(this._toModel);
    }

    // Tạo mới giao dịch thanh toán
    async insertPayment(payment: PaymentTransaction): Promise<void> {
        await prisma.paymentTransaction.create({ data: payment });
    }

    // Cập nhật thông tin giao dịch thanh toán theo ID
    async updatePayment(paymentId: string, paymentUpdateDTO: PaymentUpdateDTO): Promise<void> {
        await prisma.paymentTransaction.update({ where: { id: paymentId }, data: paymentUpdateDTO });
    }

    // Xóa giao dịch thanh toán theo ID
    async deletePayment(paymentId: string): Promise<void> {
        await prisma.paymentTransaction.delete({ where: { id: paymentId } });
    }

    // Chuyển đổi dữ liệu từ Prisma sang model PaymentTransaction
    private _toModel(data: PaymentTransactionPrisma): PaymentTransaction {
        return { ...data } as PaymentTransaction;
    }
}