import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến hoá đơn
export const EvtOrderCreated = 'OrderCreated'; // Sự kiện khi một hoá đơn mới được tạo
export const EvtOrderUpdated = 'OrderUpdated'; // Sự kiện khi một hoá đơn được cập nhật
export const EvtOrderDeleted = 'OrderDeleted'; // Sự kiện khi một hoá đơn bị xóa

// Định nghĩa tên sự kiện liên quan đến khuyến mãi áp dụng cho hoá đơn
export const EvtOrderVoucherApplied = 'OrderVoucherApplied'; // Sự kiện khi một voucher được áp dụng cho hoá đơn
export const EvtOrderVoucherRemoved = 'OrderVoucherRemoved'; // Sự kiện khi một voucher được gỡ bỏ khỏi hoá đơn

// Định nghĩa tên sự kiện liên quan đến bàn ăn được gán cho hoá đơn
export const EvtOrderTableAssigned = 'OrderTableAssigned'; // Sự kiện khi một bàn ăn được gán cho hoá đơn
export const EvtOrderTableUnassigned = 'OrderTableUnassigned'; // Sự kiện khi một bàn ăn được gỡ bỏ khỏi hoá đơn

// Định nghĩa tên sự kiện liên quan đến mục hoá đơn
export const EvtOrderItemAdded = 'OrderItemAdded'; // Sự kiện khi một mục hoá đơn được thêm vào hoá đơn
export const EvtOrderItemUpdated = 'OrderItemUpdated'; // Sự kiện khi một mục hoá đơn được cập nhật trong hoá đơn
export const EvtOrderItemRemoved = 'OrderItemRemoved'; // Sự kiện khi một mục hoá đơn bị xóa khỏi hoá đơn

//  Định nghĩa tên sự kiện liên quan đến tuỳ chọn của mục hoá đơn
export const EvtOrderItemOptionAdded = 'OrderItemOptionAdded'; // Sự kiện khi một tuỳ chọn của mục hoá đơn được thêm vào mục hoá đơn
export const EvtOrderItemOptionUpdated = 'OrderItemOptionUpdated'; // Sự kiện khi một tuỳ chọn của mục hoá đơn được cập nhật trong mục hoá đơn
export const EvtOrderItemOptionRemoved = 'OrderItemOptionRemoved'; // Sự kiện khi một tuỳ chọn của mục hoá đơn bị xóa khỏi mục hoá đơn

// Định nghĩa tên sự kiện liên quan đến hoá đơn công ty
export const EvtInvoiceCreated = 'InvoiceCreated'; // Sự kiện khi một hoá đơn công ty mới được tạo
export const EvtInvoiceUpdated = 'InvoiceUpdated'; // Sự kiện khi một hoá đơn công ty được cập nhật
export const EvtInvoiceDeleted = 'InvoiceDeleted'; // Sự kiện khi một hoá đơn công ty bị xóa

// Định nghĩa kiểu dữ liệu cho payload của sự kiện hoá đơn
export type OrderEventPayload = {
    orderId: string; // ID của hoá đơn
    code?: string; // Mã code của hoá đơn
    userId?: string; // ID người dùng tạo hoá đơn
    totalAmount?: number; // Tổng số tiền của hoá đơn
    status?: string; // Trạng thái của hoá đơn
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Định nghĩa kiểu dữ liệu cho payload của sự kiện khuyến mãi áp dụng cho hoá đơn
export type OrderVoucherEventPayload = {
    orderId: string; // ID của hoá đơn
    voucherId: string; // ID của voucher
    discountValue?: number; // Giá trị giảm giá của voucher
    changeType: 'APPLIED' | 'REMOVED'; // Loại thay đổi
};

// Định nghĩa kiểu dữ liệu cho payload của sự kiện bàn ăn được gán cho hoá đơn
export type OrderTableEventPayload = {
    orderId: string; // ID của hoá đơn
    tableId: string; // ID của bàn ăn
    changeType: 'ASSIGNED' | 'UNASSIGNED'; // Loại thay đổi
};

// Định nghĩa kiểu dữ liệu cho payload của sự kiện mục hoá đơn
export type OrderItemEventPayload = {
    orderId: string; // ID của hoá đơn
    itemId: string; // ID của mục hoá đơn
    productId?: string; // ID của sản phẩm
    variantId?: string; // ID của biến thể sản phẩm
    productName?: string; // Tên sản phẩm
    quantity?: number; // Số lượng của mục hoá đơn
    price?: number; // Giá tiền của mục hoá đơn
    changeType: 'ADDED' | 'UPDATED' | 'REMOVED'; // Loại thay đổi
};

// Định nghĩa kiểu dữ liệu cho payload của sự kiện tuỳ chọn của mục hoá đơn
export type OrderItemOptionEventPayload = {
    orderId: string; // ID của hoá đơn
    itemId: string; // ID của mục hoá đơn
    optionId: string; // ID của tuỳ chọn
    name?: string; // Tên tuỳ chọn
    price?: number; // Giá phụ thu của tuỳ chọn
    changeType: 'ADDED' | 'UPDATED' | 'REMOVED'; // Loại thay đổi
};

// Định nghĩa kiểu dữ liệu cho payload của sự kiện hoá đơn công ty
export type InvoiceEventPayload = {
    invoiceId: string; // ID của hoá đơn công ty
    orderId: string; // ID của hoá đơn liên quan
    taxCode?: string; // Mã số thuế của công ty
    issuedAt?: Date; // Ngày phát hành hoá đơn
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class OrderEvent<T extends OrderEventPayload | OrderVoucherEventPayload | OrderTableEventPayload | OrderItemEventPayload | OrderItemOptionEventPayload | InvoiceEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends OrderEventPayload | OrderVoucherEventPayload | OrderTableEventPayload | OrderItemEventPayload | OrderItemOptionEventPayload | InvoiceEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): OrderEvent<T> {
        return new OrderEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends OrderEventPayload | OrderVoucherEventPayload | OrderTableEventPayload | OrderItemEventPayload | OrderItemOptionEventPayload | InvoiceEventPayload>(json: any): OrderEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OrderEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi hoá đơn được tạo mới
export class OrderCreatedEvent extends OrderEvent<OrderEventPayload> {
    static create(payload: OrderEventPayload, senderId: string): OrderCreatedEvent {
        return new OrderCreatedEvent(EvtOrderCreated, payload, { senderId });
    }

    static from(json: any): OrderCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OrderCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi hoá đơn được cập nhật
export class OrderUpdatedEvent extends OrderEvent<OrderEventPayload> {
    static create(payload: OrderEventPayload, senderId: string): OrderUpdatedEvent {
        return new OrderUpdatedEvent(EvtOrderUpdated, payload, { senderId });
    }

    static from(json: any): OrderUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OrderUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi hoá đơn bị xóa
export class OrderDeletedEvent extends OrderEvent<OrderEventPayload> {
    static create(payload: OrderEventPayload, senderId: string): OrderDeletedEvent {
        return new OrderDeletedEvent(EvtOrderDeleted, payload, { senderId });
    }

    static from(json: any): OrderDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OrderDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi một voucher được áp dụng cho hoá đơn
export class OrderVoucherAppliedEvent extends OrderEvent<OrderVoucherEventPayload> {
    static create(payload: OrderVoucherEventPayload, senderId: string): OrderVoucherAppliedEvent {
        return new OrderVoucherAppliedEvent(EvtOrderVoucherApplied, payload, { senderId });
    }

    static from(json: any): OrderVoucherAppliedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OrderVoucherAppliedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi một voucher được gỡ bỏ khỏi hoá đơn
export class OrderVoucherRemovedEvent extends OrderEvent<OrderVoucherEventPayload> {
    static create(payload: OrderVoucherEventPayload, senderId: string): OrderVoucherRemovedEvent {
        return new OrderVoucherRemovedEvent(EvtOrderVoucherRemoved, payload, { senderId });
    }

    static from(json: any): OrderVoucherRemovedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OrderVoucherRemovedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi một bàn ăn được gán cho hoá đơn
export class OrderTableAssignedEvent extends OrderEvent<OrderTableEventPayload> {
    static create(payload: OrderTableEventPayload, senderId: string): OrderTableAssignedEvent {
        return new OrderTableAssignedEvent(EvtOrderTableAssigned, payload, { senderId });
    }

    static from(json: any): OrderTableAssignedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OrderTableAssignedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi một bàn ăn được gỡ bỏ khỏi hoá đơn
export class OrderTableUnassignedEvent extends OrderEvent<OrderTableEventPayload> {
    static create(payload: OrderTableEventPayload, senderId: string): OrderTableUnassignedEvent {
        return new OrderTableUnassignedEvent(EvtOrderTableUnassigned, payload, { senderId });
    }

    static from(json: any): OrderTableUnassignedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OrderTableUnassignedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi một mục hoá đơn được thêm vào hoá đơn
export class OrderItemAddedEvent extends OrderEvent<OrderItemEventPayload> {
    static create(payload: OrderItemEventPayload, senderId: string): OrderItemAddedEvent {
        return new OrderItemAddedEvent(EvtOrderItemAdded, payload, { senderId });
    }   

    static from(json: any): OrderItemAddedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OrderItemAddedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi một mục hoá đơn được cập nhật trong hoá đơn
export class OrderItemUpdatedEvent extends OrderEvent<OrderItemEventPayload> {
    static create(payload: OrderItemEventPayload, senderId: string): OrderItemUpdatedEvent {
        return new OrderItemUpdatedEvent(EvtOrderItemUpdated, payload, { senderId });
    }

    static from(json: any): OrderItemUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OrderItemUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi một mục hoá đơn bị xóa khỏi hoá đơn
export class OrderItemRemovedEvent extends OrderEvent<OrderItemEventPayload> {
    static create(payload: OrderItemEventPayload, senderId: string): OrderItemRemovedEvent {
        return new OrderItemRemovedEvent(EvtOrderItemRemoved, payload, { senderId });
    }

    static from(json: any): OrderItemRemovedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OrderItemRemovedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi một tuỳ chọn của mục hoá đơn được thêm vào mục hoá đơn
export class OrderItemOptionAddedEvent extends OrderEvent<OrderItemOptionEventPayload> {
    static create(payload: OrderItemOptionEventPayload, senderId: string): OrderItemOptionAddedEvent {
        return new OrderItemOptionAddedEvent(EvtOrderItemOptionAdded, payload, { senderId });
    }

    static from(json: any): OrderItemOptionAddedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OrderItemOptionAddedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi một tuỳ chọn của mục hoá đơn được cập nhật trong mục hoá đơn
export class OrderItemOptionUpdatedEvent extends OrderEvent<OrderItemOptionEventPayload> {
    static create(payload: OrderItemOptionEventPayload, senderId: string): OrderItemOptionUpdatedEvent {
        return new OrderItemOptionUpdatedEvent(EvtOrderItemOptionUpdated, payload, { senderId });
    }

    static from(json: any): OrderItemOptionUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OrderItemOptionUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi một tuỳ chọn của mục hoá đơn bị xóa khỏi mục hoá đơn
export class OrderItemOptionRemovedEvent extends OrderEvent<OrderItemOptionEventPayload> {
    static create(payload: OrderItemOptionEventPayload, senderId: string): OrderItemOptionRemovedEvent {
        return new OrderItemOptionRemovedEvent(EvtOrderItemOptionRemoved, payload, { senderId });
    }

    static from(json: any): OrderItemOptionRemovedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new OrderItemOptionRemovedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    } 
}

// Sự kiện khi hoá đơn công ty được tạo mới
export class InvoiceCreatedEvent extends OrderEvent<InvoiceEventPayload> {
    static create(payload: InvoiceEventPayload, senderId: string): InvoiceCreatedEvent {
        return new InvoiceCreatedEvent(EvtInvoiceCreated, payload, { senderId });
    }

    static from(json: any): InvoiceCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new InvoiceCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi hoá đơn công ty được cập nhật
export class InvoiceUpdatedEvent extends OrderEvent<InvoiceEventPayload> {
    static create(payload: InvoiceEventPayload, senderId: string): InvoiceUpdatedEvent {
        return new InvoiceUpdatedEvent(EvtInvoiceUpdated, payload, { senderId });
    }

    static from(json: any): InvoiceUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new InvoiceUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi hoá đơn công ty bị xóa
export class InvoiceDeletedEvent extends OrderEvent<InvoiceEventPayload> {
    static create(payload: InvoiceEventPayload, senderId: string): InvoiceDeletedEvent {
        return new InvoiceDeletedEvent(EvtInvoiceDeleted, payload, { senderId });
    }

    static from(json: any): InvoiceDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new InvoiceDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}