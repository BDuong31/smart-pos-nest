import { Paginated, PagingDTO, Requester } from "src/share";
import { PaymentStatus, PaymentTransaction } from "../models/payment.model";
import type { PaymentCreateDTO, PaymentUpdateDTO, PaymentCondDTO, InitiatePaymentDTO } from "../dtos/payment.dto";

// ============================
// Định nghĩa các interface cho Payment
// ============================

// Định nghĩa các phương thức mà PaymentService phải triển khai
export interface IPaymentService {
    createPayment(requester: Requester, paymentCreateDTO: PaymentCreateDTO, ip: string, userAgent: string): Promise<PaymentTransaction> // Tạo giao dịch thanh toán mới
    updatePayment(requester: Requester, paymentId: string, paymentUpdateDTO: PaymentUpdateDTO, ip: string, userAgent: string): Promise<PaymentTransaction> // Cập nhật thông tin giao dịch thanh toán theo ID
    deletePayment(requester: Requester, paymentId: string, ip: string, userAgent: string): Promise<void> // Xóa giao dịch thanh toán theo ID
    getPaymentById(requester: Requester, paymentId: string): Promise<PaymentTransaction | null> // Lấy thông tin giao dịch thanh toán theo ID
    listPayments(requester: Requester, pagingDTO: PagingDTO, paymentCondDTO: PaymentCondDTO): Promise<Paginated<PaymentTransaction>> // Lấy danh sách giao dịch thanh toán theo điều kiện
    listPaymentsByIds(requester: Requester, paymentIds: string[], pagingDTO : PagingDTO): Promise<Paginated<PaymentTransaction>> // Lấy danh sách giao dịch thanh toán theo nhiều ID

    // Các phương thức liên quan API thanh toán bên thứ ba (ví dụ: tích hợp với cổng thanh toán)
    initiatePayment(dto: InitiatePaymentDTO, user: Requester): Promise<{ paymentUrl?: string; paymentId?: string; success: boolean }>; // Khởi tạo giao dịch thanh toán và trả về URL thanh toán nếu có
    handleWebhook(gateway: string, payload: any, signatureOrQuery: any): Promise<boolean>; // Xử lý webhook từ cổng thanh toán để cập nhật trạng thái giao dịch
    verifyPayment(gateway: string, externalPaymentId: string): Promise<boolean>; // Xác minh trạng thái giao dịch thanh toán với cổng thanh toán
    queryPaymentStatus(gateway: string, externalPaymentId: string): Promise<PaymentStatus>; // Truy vấn trạng thái giao dịch thanh toán từ cổng thanh toán
    refundPayment(requester: Requester, paymentId: string, amount?: number): Promise<boolean>; // Yêu cầu hoàn tiền cho một giao dịch thanh toán
    cancelPayment(requester: Requester, paymentId: string): Promise<boolean>; // Hủy một giao dịch thanh toán nếu có thể
}

// Định nghĩa các phương thức mà PaymentRepository phải triển khai
export interface IPaymentRepository {
    getPaymentById(paymentId: string): Promise<PaymentTransaction | null> // Lấy thông tin giao dịch thanh toán theo ID
    listPayments(cond: PaymentCondDTO, paging: PagingDTO): Promise<Paginated<PaymentTransaction>> // Lấy danh sách giao dịch thanh toán theo điều kiện
    listPaymentsByIds(paymentIds: string[], paging: PagingDTO): Promise<Paginated<PaymentTransaction>> // Lấy danh sách giao dịch thanh toán theo nhiều ID
    insertPayment(payment: PaymentTransaction): Promise<void> // Tạo mới giao dịch thanh toán
    updatePayment(paymentId: string, paymentUpdateDTO: PaymentUpdateDTO): Promise<void> // Cập nhật thông tin giao dịch thanh toán theo ID
    deletePayment(paymentId: string): Promise<void> // Xóa giao dịch thanh toán theo ID
}