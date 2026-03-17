import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến voucher
export const EvtVoucherCreated = 'VoucherCreated'; // Sự kiện khi một voucher mới được tạo
export const EvtVoucherUpdated = 'VoucherUpdated'; // Sự kiện khi một voucher được cập nhật
export const EvtVoucherDeleted = 'VoucherDeleted'; // Sự kiện khi một voucher bị xóa

// Định nghĩa kiểu dữ liệu cho payload của sự kiện voucher
export type VoucherEventPayload = {
    voucherId: string; // ID của voucher
    code?: string; // Mã voucher
    type?: string; // Loại voucher (ví dụ: giảm giá theo phần trăm, giảm giá theo số tiền)
    value?: number; // Giá trị của voucher (ví dụ: 10% hoặc 100.000đ)
    minOrderVal?: number; // Giá trị đơn hàng tối thiểu để áp dụng voucher
    usageLimit?: number; // Giới hạn số lần sử dụng của voucher
    isActive?: boolean; // Trạng thái hoạt động của voucher
    startDate?: Date; // Ngày bắt đầu hiệu lực của voucher
    endDate?: Date; // Ngày kết thúc hiệu lực của voucher
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class VoucherEvent<T extends VoucherEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends VoucherEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): VoucherEvent<T> {
        return new VoucherEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends VoucherEventPayload>(json: any): VoucherEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new VoucherEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi voucher được tạo mới
export class VoucherCreatedEvent extends VoucherEvent<VoucherEventPayload> {
    static create(payload: VoucherEventPayload, senderId: string): VoucherCreatedEvent {
        return new VoucherCreatedEvent(EvtVoucherCreated, payload, { senderId });
    }

    static from(json: any): VoucherCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new VoucherCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi voucher được cập nhật
export class VoucherUpdatedEvent extends VoucherEvent<VoucherEventPayload> {
    static create(payload: VoucherEventPayload, senderId: string): VoucherUpdatedEvent {
        return new VoucherUpdatedEvent(EvtVoucherUpdated, payload, { senderId });
    }

    static from(json: any): VoucherUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new VoucherUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi voucher bị xóa
export class VoucherDeletedEvent extends VoucherEvent<VoucherEventPayload> {
    static create(payload: VoucherEventPayload, senderId: string): VoucherDeletedEvent {
        return new VoucherDeletedEvent(EvtVoucherDeleted, payload, { senderId });
    }

    static from(json: any): VoucherDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new VoucherDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}