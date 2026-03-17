import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến chi tiết đề xuất mua hàng
export const EvtPurchaseProposalDetailCreated = 'PurchaseProposalDetailCreated'; // Sự kiện khi một chi tiết đề xuất mua hàng mới được tạo
export const EvtPurchaseProposalDetailUpdated = 'PurchaseProposalDetailUpdated'; // Sự kiện khi một chi tiết đề xuất mua hàng được cập nhật
export const EvtPurchaseProposalDetailDeleted = 'PurchaseProposalDetailDeleted'; // Sự kiện khi một chi tiết đề xuất mua hàng bị xóa

// Định nghĩa kiểu dữ liệu cho payload của sự kiện chi tiết đề xuất mua hàng
export type PurchaseProposalDetailEventPayload = {
    detailId: string; // ID của chi tiết đề xuất mua hàng
    proposalId?: string; // ID của đề xuất mua hàng liên quan
    ingredientId?: string; // ID của nguyên liệu liên quan
    quantity?: number; // Số lượng của chi tiết đề xuất mua hàng
    unit?: string; // Đơn vị của chi tiết đề xuất mua hàng
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class PurchaseProposalDetailEvent<T extends PurchaseProposalDetailEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends PurchaseProposalDetailEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): PurchaseProposalDetailEvent<T> {
        return new PurchaseProposalDetailEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends PurchaseProposalDetailEventPayload>(json: any): PurchaseProposalDetailEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PurchaseProposalDetailEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi chi tiết đề xuất mua hàng được tạo mới
export class PurchaseProposalDetailCreatedEvent extends PurchaseProposalDetailEvent<PurchaseProposalDetailEventPayload> {
    static create(payload: PurchaseProposalDetailEventPayload, senderId: string): PurchaseProposalDetailCreatedEvent {
        return new PurchaseProposalDetailCreatedEvent(EvtPurchaseProposalDetailCreated, payload, { senderId });
    }

    static from(json: any): PurchaseProposalDetailCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PurchaseProposalDetailCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi chi tiết đề xuất mua hàng được cập nhật
export class PurchaseProposalDetailUpdatedEvent extends PurchaseProposalDetailEvent<PurchaseProposalDetailEventPayload> {
    static create(payload: PurchaseProposalDetailEventPayload, senderId: string): PurchaseProposalDetailUpdatedEvent {
        return new PurchaseProposalDetailUpdatedEvent(EvtPurchaseProposalDetailUpdated, payload, { senderId });
    }

    static from(json: any): PurchaseProposalDetailUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PurchaseProposalDetailUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi chi tiết đề xuất mua hàng bị xóa
export class PurchaseProposalDetailDeletedEvent extends PurchaseProposalDetailEvent<PurchaseProposalDetailEventPayload> {
    static create(payload: PurchaseProposalDetailEventPayload, senderId: string): PurchaseProposalDetailDeletedEvent {
        return new PurchaseProposalDetailDeletedEvent(EvtPurchaseProposalDetailDeleted, payload, { senderId });
    }

    static from(json: any): PurchaseProposalDetailDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PurchaseProposalDetailDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}