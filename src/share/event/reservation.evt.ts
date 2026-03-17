import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến đặt bàn
export const EvtReservationCreated = 'reservation.created'; // Sự kiện khi một đặt bàn mới được tạo
export const EvtReservationUpdated = 'reservation.updated'; // Sự kiện khi một đặt bàn được cập nhật
export const EvtReservationDeleted = 'reservation.deleted'; // Sự kiện khi một đặt bàn bị xóa

// Định nghĩa kiểu dữ liệu cho payload của sự kiện đặt bàn
export type ReservationEventPayload = {
    reservationId: string; // ID của đặt bàn
    userId?: string; // ID của người dùng đặt bàn
    tableId?: string; // ID của bàn được đặt
    customerName?: string; // Tên khách hàng
    phone?: string; // Số điện thoại khách hàng
    time?: Date; // Thời gian đặt bàn
    guestCount?: number; // Số lượng khách
    note?: string; // Ghi chú thêm
    status?: string; // Trạng thái đặt bàn
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class ReservationEvent<T extends ReservationEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends ReservationEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): ReservationEvent<T> {
        return new ReservationEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends ReservationEventPayload>(json: any): ReservationEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ReservationEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi đặt bàn được tạo mới
export class ReservationCreatedEvent extends ReservationEvent<ReservationEventPayload> {
    static create(payload: ReservationEventPayload, senderId: string): ReservationCreatedEvent {
        return new ReservationCreatedEvent(EvtReservationCreated, payload, { senderId });
    }

    static from(json: any): ReservationCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ReservationCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi đặt bàn được cập nhật
export class ReservationUpdatedEvent extends ReservationEvent<ReservationEventPayload> {
    static create(payload: ReservationEventPayload, senderId: string): ReservationUpdatedEvent {
        return new ReservationUpdatedEvent(EvtReservationUpdated, payload, { senderId });
    }

    static from(json: any): ReservationUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ReservationUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi đặt bàn bị xóa
export class ReservationDeletedEvent extends ReservationEvent<ReservationEventPayload> {
    static create(payload: ReservationEventPayload, senderId: string): ReservationDeletedEvent {
        return new ReservationDeletedEvent(EvtReservationDeleted, payload, { senderId });
    }

    static from(json: any): ReservationDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ReservationDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}