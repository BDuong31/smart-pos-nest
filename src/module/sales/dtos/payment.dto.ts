import { z } from "zod";
import { paymentTransactionSchema, InitiatePaymentSchemaTable } from "../models/payment.model";

// ============================
// Định nghĩa các DTO cho Payment
// ============================

// Định nghĩa schema cho tạo giao dịch thanh toán
export const paymentCreateDTOSchema = paymentTransactionSchema.pick({
    orderId: true, // ID đơn hàng
    externalTransactionId: true, // ID giao dịch từ hệ thống thanh toán bên thứ ba, nếu có
    amount: true, // Số tiền thanh toán
    method: true, // Phương thức thanh toán
    gatewayResponse: true, // Phản hồi từ cổng thanh toán
    paidAt: true,
}).required()

// Định nghĩa kiểu dữ liệu cho tạo giao dịch thanh toán
export interface PaymentCreateDTO extends z.infer<typeof paymentCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật giao dịch thanh toán
export const paymentUpdateDTOSchema = paymentTransactionSchema.pick({
    externalTransactionId: true, // ID giao dịch từ hệ thống thanh toán bên thứ ba, nếu có
    amount: true, // Số tiền thanh toán
    method: true, // Phương thức thanh toán
    gatewayResponse: true, // Phản hồi từ cổng thanh toán
    status: true, // Trạng thái thanh toán
    paidAt: true, // Thời gian thanh toán
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật giao dịch thanh toán
export interface PaymentUpdateDTO extends z.infer<typeof paymentUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn giao dịch thanh toán
export const paymentCondDTOSchema = paymentTransactionSchema.pick({
    orderId: true, // ID đơn hàng
    externalTransactionId: true, // ID giao dịch từ hệ thống thanh toán bên thứ ba, nếu có
    method: true, // Phương thức thanh toán
    status: true, // Trạng thái thanh toán
    paidAt: true, // Thời gian thanh toán
}).partial();

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn giao dịch thanh toán
export interface PaymentCondDTO extends z.infer<typeof paymentCondDTOSchema> {}

export const InitiatePaymentSchema = InitiatePaymentSchemaTable.partial().pick({
    paymentId: true,
    method: true,
    methodChild: true,
}); 
export type InitiatePaymentDTO = z.infer<typeof InitiatePaymentSchema>;