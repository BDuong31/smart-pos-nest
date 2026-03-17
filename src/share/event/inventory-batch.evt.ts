import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến lô hàng tồn kho
export const EvtInventoryBatchCreated = 'InventoryBatchCreated'; // Sự kiện khi một lô hàng tồn kho mới được tạo
export const EvtInventoryBatchUpdated = 'InventoryBatchUpdated'; // Sự kiện khi một lô hàng tồn kho được cập nhật
export const EvtInventoryBatchDeleted = 'InventoryBatchDeleted'; // Sự kiện khi một lô hàng tồn kho bị xóa

// Định nghĩa kiểu dữ liệu cho payload của sự kiện lô hàng tồn kho
export type InventoryBatchEventPayload = {
    batchId: string; // ID của lô hàng tồn kho
    ingredientId?: string; // ID nguyên liệu
    quantity?: number; // Số lượng trong lô hàng tồn kho
    expiryDate?: Date; // Ngày hết hạn của lô hàng tồn kho
    importDate?: Date; // Ngày nhập của lô hàng tồn kho
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class InventoryBatchEvent<T extends InventoryBatchEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends InventoryBatchEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): InventoryBatchEvent<T> {
        return new InventoryBatchEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends InventoryBatchEventPayload>(json: any): InventoryBatchEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new InventoryBatchEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi lô hàng tồn kho được tạo mới
export class InventoryBatchCreatedEvent extends InventoryBatchEvent<InventoryBatchEventPayload> {
    static create(payload: InventoryBatchEventPayload, senderId: string): InventoryBatchCreatedEvent {
        return new InventoryBatchCreatedEvent(EvtInventoryBatchCreated, payload, { senderId });
    }

    static from(json: any): InventoryBatchCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new InventoryBatchCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi lô hàng tồn kho được cập nhật
export class InventoryBatchUpdatedEvent extends InventoryBatchEvent<InventoryBatchEventPayload> {
    static create(payload: InventoryBatchEventPayload, senderId: string): InventoryBatchUpdatedEvent {
        return new InventoryBatchUpdatedEvent(EvtInventoryBatchUpdated, payload, { senderId });
    } 

    static from(json: any): InventoryBatchUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new InventoryBatchUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi lô hàng tồn kho bị xóa
export class InventoryBatchDeletedEvent extends InventoryBatchEvent<InventoryBatchEventPayload> {
    static create(payload: InventoryBatchEventPayload, senderId: string): InventoryBatchDeletedEvent {
        return new InventoryBatchDeletedEvent(EvtInventoryBatchDeleted, payload, { senderId });
    }

    static from(json: any): InventoryBatchDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new InventoryBatchDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}