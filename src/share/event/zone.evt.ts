import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến khu vực
export const EvtZoneCreated = 'ZoneCreated'; // Sự kiện khi một khu vực mới được tạo
export const EvtZoneUpdated = 'ZoneUpdated'; // Sự kiện khi một khu vực được cập nhật
export const EvtZoneDeleted = 'ZoneDeleted'; // Sự kiện khi một khu vực bị xóa

// Định nghĩa kiểu dữ liệu cho payload của sự kiện khu vực
export type ZoneEventPayload = {
    zoneId: string; // ID của khu vực
    name: string; // Tên của khu vực
    description?: string; // Mô tả về khu vực (tùy chọn)
    isActive?: boolean; // Trạng thái hoạt động của khu vực (tùy chọn)
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class ZoneEvent<T extends ZoneEventPayload> extends AppEvent<T> {
    protected constructor(  
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends ZoneEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): ZoneEvent<T> {
        return new ZoneEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends ZoneEventPayload>(json: any): ZoneEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ZoneEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi khu vực được tạo mới
export class ZoneCreatedEvent extends ZoneEvent<ZoneEventPayload> {
    static create(payload: ZoneEventPayload, senderId: string): ZoneCreatedEvent {
        return new ZoneCreatedEvent(EvtZoneCreated, payload, { senderId });
    }

    static from(json: any): ZoneCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ZoneCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi khu vực được cập nhật
export class ZoneUpdatedEvent extends ZoneEvent<ZoneEventPayload> {
    static create(payload: ZoneEventPayload, senderId: string): ZoneUpdatedEvent {
        return new ZoneUpdatedEvent(EvtZoneUpdated, payload, { senderId });
    }

    static from(json: any): ZoneUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ZoneUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi khu vực bị xóa
export class ZoneDeletedEvent extends ZoneEvent<ZoneEventPayload> {
    static create(payload: ZoneEventPayload, senderId: string): ZoneDeletedEvent {
        return new ZoneDeletedEvent(EvtZoneDeleted, payload, { senderId });
    }

    static from(json: any): ZoneDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ZoneDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}