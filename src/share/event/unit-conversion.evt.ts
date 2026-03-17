import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến chuyển đổi đơn vị
export const EvtUnitConversionCreated = 'UnitConversionCreated'; // Sự kiện khi một chuyển đổi đơn vị mới được tạo
export const EvtUnitConversionUpdated = 'UnitConversionUpdated'; // Sự kiện khi một chuyển đổi đơn vị được cập nhật
export const EvtUnitConversionDeleted = 'UnitConversionDeleted'; // Sự kiện khi một chuyển đổi đơn vị bị xóa

// Định nghĩa kiểu dữ liệu cho payload của sự kiện chuyển đổi đơn vị
export type UnitConversionEventPayload = {
    unitConversionId: string; // ID của chuyển đổi đơn vị
    ingredientId: string; // ID nguyên liệu
    fromUnit?: string; // Đơn vị gốc
    toUnit?: string; // Đơn vị đích
    factor?: number; // Hệ số chuyển đổi
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class UnitConversionEvent<T extends UnitConversionEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends UnitConversionEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): UnitConversionEvent<T> {
        return new UnitConversionEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends UnitConversionEventPayload>(json: any): UnitConversionEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new UnitConversionEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi chuyển đổi đơn vị được tạo mới
export class UnitConversionCreatedEvent extends UnitConversionEvent<UnitConversionEventPayload> {
    static create(payload: UnitConversionEventPayload, senderId: string): UnitConversionCreatedEvent {
        return new UnitConversionCreatedEvent(EvtUnitConversionCreated, payload, { senderId });
    }

    static from(json: any): UnitConversionCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new UnitConversionCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi chuyển đổi đơn vị được cập nhật
export class UnitConversionUpdatedEvent extends UnitConversionEvent<UnitConversionEventPayload> {
    static create(payload: UnitConversionEventPayload, senderId: string): UnitConversionUpdatedEvent {
        return new UnitConversionUpdatedEvent(EvtUnitConversionUpdated, payload, { senderId });
    }

    static from(json: any): UnitConversionUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new UnitConversionUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi chuyển đổi đơn vị bị xóa
export class UnitConversionDeletedEvent extends UnitConversionEvent<UnitConversionEventPayload> {
    static create(payload: UnitConversionEventPayload, senderId: string): UnitConversionDeletedEvent {
        return new UnitConversionDeletedEvent(EvtUnitConversionDeleted, payload, { senderId });
    }

    static from(json: any): UnitConversionDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new UnitConversionDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}