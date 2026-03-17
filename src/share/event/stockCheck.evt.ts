import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến kiểm tra tồn kho
export const EvtStockCheckCreated = 'StockCheckCreated'; // Sự kiện khi một kiểm tra tồn kho mới được tạo
export const EvtStockCheckUpdated = 'StockCheckUpdated'; // Sự kiện khi một kiểm tra tồn kho được cập nhật
export const EvtStockCheckDeleted = 'StockCheckDeleted'; // Sự kiện khi một kiểm tra tồn kho bị xóa

// Định nghĩa kiểu dữ liệu cho payload của sự kiện kiểm tra tồn kho
export type StockCheckEventPayload = {
    stockCheckId: string; // ID của kiểm tra tồn kho
    code?: string; // Mã kiểm tra tồn kho
    userId?: string; // ID của người thực hiện kiểm tra tồn kho
    note?: string; // Ghi chú về kiểm tra tồn kho
    checkDate?: Date; // Ngày thực hiện kiểm tra tồn kho
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class StockCheckEvent<T extends StockCheckEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends StockCheckEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): StockCheckEvent<T> {
        return new StockCheckEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends StockCheckEventPayload>(json: any): StockCheckEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new StockCheckEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi kiểm tra tồn kho được tạo mới
export class StockCheckCreatedEvent extends StockCheckEvent<StockCheckEventPayload> {
    static create(payload: StockCheckEventPayload, senderId: string): StockCheckCreatedEvent {
        return new StockCheckCreatedEvent(EvtStockCheckCreated, payload, { senderId });
    }

    static from(json: any): StockCheckCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new StockCheckCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi kiểm tra tồn kho được cập nhật
export class StockCheckUpdatedEvent extends StockCheckEvent<StockCheckEventPayload> {
    static create(payload: StockCheckEventPayload, senderId: string): StockCheckUpdatedEvent {
        return new StockCheckUpdatedEvent(EvtStockCheckUpdated, payload, { senderId });
    }

    static from(json: any): StockCheckUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new StockCheckUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi kiểm tra tồn kho bị xóa
export class StockCheckDeletedEvent extends StockCheckEvent<StockCheckEventPayload> {
    static create(payload: StockCheckEventPayload, senderId: string): StockCheckDeletedEvent {
        return new StockCheckDeletedEvent(EvtStockCheckDeleted, payload, { senderId });
    }

    static from(json: any): StockCheckDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new StockCheckDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}