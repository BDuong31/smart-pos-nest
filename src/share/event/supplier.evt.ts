import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến nhà cung cấp
export const EvtSupplierCreated = 'SupplierCreated'; // Sự kiện khi một nhà cung cấp mới được tạo
export const EvtSupplierUpdated = 'SupplierUpdated'; // Sự kiện khi một nhà cung cấp được cập nhật
export const EvtSupplierDeleted = 'SupplierDeleted'; // Sự kiện khi một nhà cung cấp bị xóa

// Định nghĩa kiểu dữ liệu cho payload của sự kiện nhà cung cấp
export type SupplierEventPayload = {
    supplierId: string; // ID của nhà cung cấp
    name?: string; // Tên của nhà cung cấp
    contact?: string; // Thông tin liên hệ của nhà cung cấp
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class SupplierEvent<T extends SupplierEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends SupplierEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): SupplierEvent<T> {
        return new SupplierEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends SupplierEventPayload>(json: any): SupplierEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new SupplierEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi nhà cung cấp được tạo mới
export class SupplierCreatedEvent extends SupplierEvent<SupplierEventPayload> {
    static create(payload: SupplierEventPayload, senderId: string): SupplierCreatedEvent {
        return new SupplierCreatedEvent(EvtSupplierCreated, payload, { senderId });
    }

    static from(json: any): SupplierCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new SupplierCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi nhà cung cấp được cập nhật
export class SupplierUpdatedEvent extends SupplierEvent<SupplierEventPayload> {
    static create(payload: SupplierEventPayload, senderId: string): SupplierUpdatedEvent {
        return new SupplierUpdatedEvent(EvtSupplierUpdated, payload, { senderId });
    }

    static from(json: any): SupplierUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new SupplierUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi nhà cung cấp bị xóa
export class SupplierDeletedEvent extends SupplierEvent<SupplierEventPayload> {
    static create(payload: SupplierEventPayload, senderId: string): SupplierDeletedEvent {
        return new SupplierDeletedEvent(EvtSupplierDeleted, payload, { senderId });
    }

    static from(json: any): SupplierDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new SupplierDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}