import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến nguyên liệu
export const EvtIngredientCreated = 'IngredientCreated'; // Sự kiện khi một nguyên liệu mới được tạo
export const EvtIngredientUpdated = 'IngredientUpdated'; // Sự kiện khi một nguyên liệu được cập nhật
export const EvtIngredientDeleted = 'IngredientDeleted'; // Sự kiện khi một nguyên liệu bị xóa

// Định nghĩa kiểu dữ liệu cho payload của sự kiện nguyên liệu
export type IngredientEventPayload = {
    ingredientId: string; // ID của nguyên liệu
    name?: string; // Tên của nguyên liệu
    baseUnit?: string; // Đơn vị cơ sở của nguyên liệu
    minStock?: number; // Tồn kho nhỏ nhất của nguyên liệu
    forecastDataId?: string; // ID dữ liệu dự báo của nguyên liệu
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class IngredientEvent<T extends IngredientEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends IngredientEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): IngredientEvent<T> {
        return new IngredientEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends IngredientEventPayload>(json: any): IngredientEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new IngredientEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi nguyên liệu được tạo mới
export class IngredientCreatedEvent extends IngredientEvent<IngredientEventPayload> {
    static create(payload: IngredientEventPayload, senderId: string): IngredientCreatedEvent {
        return new IngredientCreatedEvent(EvtIngredientCreated, payload, { senderId });
    }

    static from(json: any): IngredientCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new IngredientCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi nguyên liệu được cập nhật
export class IngredientUpdatedEvent extends IngredientEvent<IngredientEventPayload> {
    static create(payload: IngredientEventPayload, senderId: string): IngredientUpdatedEvent {
        return new IngredientUpdatedEvent(EvtIngredientUpdated, payload, { senderId });
    }

    static from(json: any): IngredientUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new IngredientUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi nguyên liệu bị xóa
export class IngredientDeletedEvent extends IngredientEvent<IngredientEventPayload> {
    static create(payload: IngredientEventPayload, senderId: string): IngredientDeletedEvent {
        return new IngredientDeletedEvent(EvtIngredientDeleted, payload, { senderId });
    }

    static from(json: any): IngredientDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new IngredientDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}