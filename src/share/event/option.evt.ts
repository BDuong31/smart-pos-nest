import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến nhóm tùy chọn
export const EvtOptionGroupCreated = 'OptionGroupCreated';
export const EvtOptionGroupUpdated = 'OptionGroupUpdated';
export const EvtOptionGroupDeleted = 'OptionGroupDeleted';

// Định nghĩa tên sự kiện liên quan đến mục tùy chọn
export const EvtOptionItemCreated = 'OptionItemCreated';
export const EvtOptionItemUpdated = 'OptionItemUpdated';
export const EvtOptionItemDeleted = 'OptionItemDeleted';

// Định nghĩa tên sự kiện liên quan đến cấu hình tùy chọn sản phẩm
export const EvtProductOptionConfigSet = 'ProductOptionConfigSet';
export const EvtProductOptionConfigRemoved = 'ProductOptionConfigRemoved';

// Định nghĩa kiểu dữ liệu cho sự kiện liên quan đến nhóm tùy chọn
export type OptionGroupEventPayload = {
    optionGroupId: string; // ID nhóm tùy chọn
    name?: string; // Tên nhóm tùy chọn
    changeType?: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Định nghĩa kiểu dữ liệu cho sự kiện liên quan đến mục tùy chọn
export type OptionItemEventPayload = {
    groupId: string; // ID nhóm tùy chọn
    optionItemId: string; // ID mục tùy chọn
    name?: string; // Tên mục tùy chọn
    priceExtra?: number; // Giá phụ thu của mục tùy chọn
    changeType?: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Định nghĩa kiểu dữ liệu cho sự kiện liên quan đến cấu hình tùy chọn sản phẩm
export type ProductOptionConfigEventPayload = {
    productId: string; // ID sản phẩm
    optionGroupId: string; // ID nhóm tùy chọn
    changeType?: 'SET' | 'REMOVED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class OptionEvent<T extends OptionGroupEventPayload | OptionItemEventPayload | ProductOptionConfigEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends OptionGroupEventPayload | OptionItemEventPayload | ProductOptionConfigEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): OptionEvent<T> {
        return new OptionEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends OptionGroupEventPayload | OptionItemEventPayload | ProductOptionConfigEventPayload>(json: any): OptionEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OptionEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi option group được tạo mới
export class OptionGroupCreatedEvent extends OptionEvent<OptionGroupEventPayload> {
    static create(payload: OptionGroupEventPayload, senderId: string): OptionGroupCreatedEvent {
        return new OptionGroupCreatedEvent(EvtOptionGroupCreated, payload, { senderId });
    }

    static from(json: any): OptionGroupCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OptionGroupCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi option group được cập nhật
export class OptionGroupUpdatedEvent extends OptionEvent<OptionGroupEventPayload> {
    static create(payload: OptionGroupEventPayload, senderId: string): OptionGroupUpdatedEvent {
        return new OptionGroupUpdatedEvent(EvtOptionGroupUpdated, payload, { senderId });
    }

    static from(json: any): OptionGroupUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OptionGroupUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi option group bị xóa
export class OptionGroupDeletedEvent extends OptionEvent<OptionGroupEventPayload> {
    static create(payload: OptionGroupEventPayload, senderId: string): OptionGroupDeletedEvent {
        return new OptionGroupDeletedEvent(EvtOptionGroupDeleted, payload, { senderId });
    }

    static from(json: any): OptionGroupDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OptionGroupDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi option item được tạo mới 
export class OptionItemCreatedEvent extends OptionEvent<OptionItemEventPayload> {
    static create(payload: OptionItemEventPayload, senderId: string): OptionItemCreatedEvent {
        return new OptionItemCreatedEvent(EvtOptionItemCreated, payload, { senderId });
    }

    static from(json: any): OptionItemCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OptionItemCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi option item được cập nhật
export class OptionItemUpdatedEvent extends OptionEvent<OptionItemEventPayload> {
    static create(payload: OptionItemEventPayload, senderId: string): OptionItemUpdatedEvent {
        return new OptionItemUpdatedEvent(EvtOptionItemUpdated, payload, { senderId });
    }

    static from(json: any): OptionItemUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OptionItemUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi option item bị xóa
export class OptionItemDeletedEvent extends OptionEvent<OptionItemEventPayload> {
    static create(payload: OptionItemEventPayload, senderId: string): OptionItemDeletedEvent {
        return new OptionItemDeletedEvent(EvtOptionItemDeleted, payload, { senderId });
    }

    static from(json: any): OptionItemDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OptionItemDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi cấu hình tùy chọn sản phẩm được thiết lập
export class ProductOptionConfigSetEvent extends OptionEvent<ProductOptionConfigEventPayload> {
    static create(payload: ProductOptionConfigEventPayload, senderId: string): ProductOptionConfigSetEvent {
        return new ProductOptionConfigSetEvent(EvtProductOptionConfigSet, payload, { senderId });
    }

    static from(json: any): ProductOptionConfigSetEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ProductOptionConfigSetEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi cấu hình tùy chọn sản phẩm bị xóa
export class ProductOptionConfigRemovedEvent extends OptionEvent<ProductOptionConfigEventPayload> {
    static create(payload: ProductOptionConfigEventPayload, senderId: string): ProductOptionConfigRemovedEvent {
        return new ProductOptionConfigRemovedEvent(EvtProductOptionConfigRemoved, payload, { senderId });
    }

    static from(json: any): ProductOptionConfigRemovedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ProductOptionConfigRemovedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}
