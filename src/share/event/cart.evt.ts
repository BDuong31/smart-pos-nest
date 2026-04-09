import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến giỏ hàng
export const EvtCartCreated = 'CartCreated'; // Sự kiện khi một giỏ hàng mới được tạo
export const EvtCartUpdated = 'CartUpdated'; // Sự kiện khi một giỏ hàng được cập nhật
export const EvtCartDeleted = 'CartDeleted'; // Sự kiện khi một giỏ hàng bị xóa

// Định nghĩa tên sự kiện liên quan đến mục giỏ hàng
export const EvtCartItemAdded = 'CartItemAdded'; // Sự kiện khi một mục được thêm vào giỏ hàng
export const EvtCartItemUpdated = 'CartItemUpdated'; // Sự kiện khi một mục trong giỏ hàng được cập nhật
export const EvtCartItemRemoved = 'CartItemRemoved'; // Sự kiện khi một mục bị xóa khỏi giỏ hàng

// Định nghĩa tên sự kiện liên quan đến tùy chọn mục giỏ hàng
export const EvtCartItemOptionAdded = 'CartItemOptionAdded'; // Sự kiện khi một tùy chọn được thêm vào mục giỏ hàng
export const EvtCartItemOptionRemoved = 'CartItemOptionRemoved'; // Sự kiện khi một tùy chọn bị xóa khỏi mục giỏ hàng

// Định nghĩa kiểu dữ liệu cho payload của sự kiện giỏ hàng
export type CartEventPayload = {
    cartId: string; // ID của giỏ hàng
    userId?: string; // ID của người dùng sở hữu giỏ hàng
    totalItem?: number; // Tổng số lượng sản phẩm trong giỏ hàng
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Định nghĩa kiểu dữ liệu cho payload của sự kiện mục giỏ hàng
export type CartItemEventPayload = {
    cartItemId: string; // ID của mục giỏ hàng
    cartId: string; // ID của giỏ hàng chứa mục này
    productId?: string; // ID của sản phẩm trong mục giỏ hàng
    quantity?: number; // Số lượng sản phẩm trong mục giỏ hàng
    changeType: 'ADDED' | 'UPDATED' | 'REMOVED'; // Loại thay đổi
    statusUpdateCartItem?: 'increase' | 'decrease';
};

// Định nghĩa kiểu dữ liệu cho payload của sự kiện tùy chọn mục giỏ hàng
export type CartItemOptionEventPayload = {
    cartItemOptionId: string; // ID của tùy chọn mục giỏ hàng
    cartItemId: string; // ID của mục giỏ hàng chứa tùy chọn này
    optionItemId?: string; // ID của tùy chọn sản phẩm được thêm vào mục giỏ hàng
    changeType: 'ADDED' | 'REMOVED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class CartEvent<T extends CartEventPayload | CartItemEventPayload | CartItemOptionEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends CartEventPayload | CartItemEventPayload | CartItemOptionEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): CartEvent<T> {
        return new CartEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends CartEventPayload | CartItemEventPayload | CartItemOptionEventPayload>(json: any): CartEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new CartEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi giỏ hàng được tạo mới
export class CartCreatedEvent extends CartEvent<CartEventPayload> {
    static create(payload: CartEventPayload, senderId: string): CartCreatedEvent {
        return new CartCreatedEvent(EvtCartCreated, payload, { senderId });
    }

    static from(json: any): CartCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new CartCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi giỏ hàng được cập nhật
export class CartUpdatedEvent extends CartEvent<CartEventPayload> {
    static create(payload: CartEventPayload, senderId: string): CartUpdatedEvent {
        return new CartUpdatedEvent(EvtCartUpdated, payload, { senderId });
    }

    static from(json: any): CartUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new CartUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi giỏ hàng bị xóa
export class CartDeletedEvent extends CartEvent<CartEventPayload> {
    static create(payload: CartEventPayload, senderId: string): CartDeletedEvent {
        return new CartDeletedEvent(EvtCartDeleted, payload, { senderId });
    }

    static from(json: any): CartDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new CartDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi một mục được thêm vào giỏ hàng
export class CartItemAddedEvent extends CartEvent<CartItemEventPayload> {
    static create(payload: CartItemEventPayload, senderId: string): CartItemAddedEvent {
        return new CartItemAddedEvent(EvtCartItemAdded, payload, { senderId });
    }

    static from(json: any): CartItemAddedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new CartItemAddedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi một mục trong giỏ hàng được cập nhật
export class CartItemUpdatedEvent extends CartEvent<CartItemEventPayload> {
    static create(payload: CartItemEventPayload, senderId: string): CartItemUpdatedEvent {
        return new CartItemUpdatedEvent(EvtCartItemUpdated, payload, { senderId });
    }

    static from(json: any): CartItemUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new CartItemUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi một mục bị xóa khỏi giỏ hàng
export class CartItemRemovedEvent extends CartEvent<CartItemEventPayload> {
    static create(payload: CartItemEventPayload, senderId: string): CartItemRemovedEvent {
        return new CartItemRemovedEvent(EvtCartItemRemoved, payload, { senderId });
    }

    static from(json: any): CartItemRemovedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new CartItemRemovedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi một tùy chọn được thêm vào mục giỏ hàng
export class CartItemOptionAddedEvent extends CartEvent<CartItemOptionEventPayload> {
    static create(payload: CartItemOptionEventPayload, senderId: string): CartItemOptionAddedEvent {
        return new CartItemOptionAddedEvent(EvtCartItemOptionAdded, payload, { senderId });
    }

    static from(json: any): CartItemOptionAddedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new CartItemOptionAddedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi một tùy chọn bị xóa khỏi mục giỏ hàng
export class CartItemOptionRemovedEvent extends CartEvent<CartItemOptionEventPayload> {
    static create(payload: CartItemOptionEventPayload, senderId: string): CartItemOptionRemovedEvent {
        return new CartItemOptionRemovedEvent(EvtCartItemOptionRemoved, payload, { senderId });
    }

    static from(json: any): CartItemOptionRemovedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new CartItemOptionRemovedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}