import { AppEvent } from "../data-model"

// Định nghĩa tên sự kiện liên quan đến bàn
export const EvtTableCreated = 'TableCreated'; // Sự kiện khi một bàn mới được tạo
export const EvtTableUpdated = 'TableUpdated'; // Sự kiện khi một bàn được cập nhật
export const EvtTableDeleted = 'TableDeleted'; // Sự kiện khi một bàn bị xóa

// Định nghĩa kiểu dữ liệu cho payload của sự kiện bàn
export type TableEventPayload = {
    tableId: string; // ID của bàn
    name: string; // Tên của bàn
    description?: string; // Mô tả về bàn (tùy chọn)
    isActive?: boolean; // Trạng thái hoạt động của bàn (tùy chọn)
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class TableEvent<T extends TableEventPayload> extends AppEvent<T> {  
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends TableEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): TableEvent<T> {
        return new TableEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends TableEventPayload>(json: any): TableEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new TableEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi bàn được tạo mới
export class TableCreatedEvent extends TableEvent<TableEventPayload> {
    static create(payload: TableEventPayload, senderId: string): TableCreatedEvent {
        return new TableCreatedEvent(EvtTableCreated, payload, { senderId });
    }

    static from(json: any): TableCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new TableCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi bàn được cập nhật
export class TableUpdatedEvent extends TableEvent<TableEventPayload> {
    static create(payload: TableEventPayload, senderId: string): TableUpdatedEvent {
        return new TableUpdatedEvent(EvtTableUpdated, payload, { senderId });
    }

    static from(json: any): TableUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new TableUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi bàn bị xóa
export class TableDeletedEvent extends TableEvent<TableEventPayload > {
    static create(payload: TableEventPayload, senderId: string): TableDeletedEvent {
        return new TableDeletedEvent(EvtTableDeleted, payload, { senderId });
    }

    static from(json: any): TableDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new TableDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}