import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến thanh toán
export const EvtPaymentCreated = 'PaymentCreated'; // Sự kiện khi một thanh toán mới được tạo
export const EvtPaymentUpdated = 'PaymentUpdated'; // Sự kiện khi một thanh toán được cập nhật
export const EvtPaymentDeleted = 'PaymentDeleted'; // Sự kiện khi một thanh toán bị xóa

// Định nghĩa kiểu dữ liệu cho payload của sự kiện thanh toán
export type PaymentEventPayload = {
    userId: string; // ID của người dùng thực hiện thanh toán
    paymentId: string; // ID của thanh toán
    orderId: string; // ID của đơn hàng liên quan đến thanh toán
    externalTransactionId?: string; // ID giao dịch từ hệ thống thanh toán bên thứ ba, nếu có
    amount?: number; // Số tiền của thanh toán
    method?: string; // Phương thức thanh toán (ví dụ: tiền mặt, thẻ tín dụng, ví điện tử)
    gatewayResponse?: any; // Phản hồi từ cổng thanh toán, lưu dưới dạng JSON
    status?: string; // Trạng thái của thanh toán (ví dụ: pending, success, failed)
    paidAt?: Date; // Thời điểm thanh toán được thực hiện
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class PaymentEvent<T extends PaymentEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,  
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends PaymentEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): PaymentEvent<T> {
        return new PaymentEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends PaymentEventPayload>(json: any): PaymentEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PaymentEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi thanh toán được tạo mới
export class PaymentCreatedEvent extends PaymentEvent<PaymentEventPayload> {
    static create(payload: PaymentEventPayload, senderId: string): PaymentCreatedEvent {
        return new PaymentCreatedEvent(EvtPaymentCreated, payload, { senderId });
    }

    static from(json: any): PaymentCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PaymentCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi thanh toán được cập nhật
export class PaymentUpdatedEvent extends PaymentEvent<PaymentEventPayload> {
    static create(payload: PaymentEventPayload, senderId: string): PaymentUpdatedEvent {
        return new PaymentUpdatedEvent(EvtPaymentUpdated, payload, { senderId });
    }

    static from(json: any): PaymentUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PaymentUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi thanh toán bị xóa
export class PaymentDeletedEvent extends PaymentEvent<PaymentEventPayload> {
    static create(payload: PaymentEventPayload, senderId: string): PaymentDeletedEvent {
        return new PaymentDeletedEvent(EvtPaymentDeleted, payload, { senderId });
    }

    static from(json: any): PaymentDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PaymentDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}