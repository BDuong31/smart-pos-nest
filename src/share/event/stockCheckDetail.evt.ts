import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến chi tiết đề kiểm tra tồn kho
export const EvtStockCheckDetailCreated = 'StockCheckDetailCreated'; // Sự kiện khi một chi tiết kiểm tra tồn kho mới được tạo
export const EvtStockCheckDetailUpdated = 'StockCheckDetailUpdated'; // Sự kiện khi một chi tiết kiểm tra tồn kho được cập nhật
export const EvtStockCheckDetailDeleted = 'StockCheckDetailDeleted'; // Sự kiện khi một chi tiết kiểm tra tồn kho bị xóa

// Định nghĩa kiểu dữ liệu cho payload của sự kiện chi tiết kiểm tra tồn kho
export type StockCheckDetailEventPayload = {
    detailId: string; // ID của chi tiết kiểm tra tồn kho
    chekcId: string; // ID của kiểm tra tồn kho liên quan
    ingredientId: string; // ID của nguyên liệu liên quan
    systemQty?: number; // Số lượng kiểm kê của hệ thống
    actualQty?: number; // Số lượng kiểm kê thực tế
    reason?: string; // Lý do chênh lệch (nếu có)
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};  

// Payload: Dữ liệu đi kèm sự kiện
export class StockCheckDetailEvent<T extends StockCheckDetailEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends StockCheckDetailEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): StockCheckDetailEvent<T> {
        return new StockCheckDetailEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends StockCheckDetailEventPayload>(json: any): StockCheckDetailEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new StockCheckDetailEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi chi tiết kiểm tra tồn kho được tạo mới
export class StockCheckDetailCreatedEvent extends StockCheckDetailEvent<StockCheckDetailEventPayload> {
    static create(payload: StockCheckDetailEventPayload, senderId: string): StockCheckDetailCreatedEvent {
        return new StockCheckDetailCreatedEvent(EvtStockCheckDetailCreated, payload, { senderId });
    }

    static from(json: any): StockCheckDetailCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new StockCheckDetailCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi chi tiết kiểm tra tồn kho được cập nhật
export class StockCheckDetailUpdatedEvent extends StockCheckDetailEvent<StockCheckDetailEventPayload> {
    static create(payload: StockCheckDetailEventPayload, senderId: string): StockCheckDetailUpdatedEvent {
        return new StockCheckDetailUpdatedEvent(EvtStockCheckDetailUpdated, payload, { senderId });
    }

    static from(json: any): StockCheckDetailUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new StockCheckDetailUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi chi tiết kiểm tra tồn kho bị xóa
export class StockCheckDetailDeletedEvent extends StockCheckDetailEvent<StockCheckDetailEventPayload> {
    static create(payload: StockCheckDetailEventPayload, senderId: string): StockCheckDetailDeletedEvent {
        return new StockCheckDetailDeletedEvent(EvtStockCheckDetailDeleted, payload, { senderId });
    }

    static from(json: any): StockCheckDetailDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new StockCheckDetailDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}