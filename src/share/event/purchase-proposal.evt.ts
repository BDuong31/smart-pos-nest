import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến đề xuất mua hàng
export const EvtPurchaseProposalCreated = 'PurchaseProposalCreated'; // Sự kiện khi một đề xuất mua hàng mới được tạo
export const EvtPurchaseProposalUpdated = 'PurchaseProposalUpdated'; // Sự kiện khi một đề xuất mua hàng được cập nhật
export const EvtPurchaseProposalDeleted = 'PurchaseProposalDeleted'; // Sự kiện khi một đề xuất mua hàng bị xóa

// Định nghĩa kiểu dữ liệu cho payload của sự kiện đề xuất mua hàng
export type PurchaseProposalEventPayload = {
    proposalId: string; // ID của đề xuất mua hàng
    code?: string; // Mã của đề xuất mua hàng
    creatorId?: string; // ID người tạo đề xuất mua hàng
    status?: string; // Trạng thái của đề xuất mua hàng
    note?: string; // Ghi chú của đề xuất mua hàng
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class PurchaseProposalEvent<T extends PurchaseProposalEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends PurchaseProposalEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): PurchaseProposalEvent<T> {
        return new PurchaseProposalEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends PurchaseProposalEventPayload>(json: any): PurchaseProposalEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PurchaseProposalEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi đề xuất mua hàng được tạo mới
export class PurchaseProposalCreatedEvent extends PurchaseProposalEvent<PurchaseProposalEventPayload> {
    static create(payload: PurchaseProposalEventPayload, senderId: string): PurchaseProposalCreatedEvent {
        return new PurchaseProposalCreatedEvent(EvtPurchaseProposalCreated, payload, { senderId });
    }

    static from(json: any): PurchaseProposalCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PurchaseProposalCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi đề xuất mua hàng được cập nhật
export class PurchaseProposalUpdatedEvent extends PurchaseProposalEvent<PurchaseProposalEventPayload> {
    static create(payload: PurchaseProposalEventPayload, senderId: string): PurchaseProposalUpdatedEvent {
        return new PurchaseProposalUpdatedEvent(EvtPurchaseProposalUpdated, payload, { senderId });
    }

    static from(json: any): PurchaseProposalUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PurchaseProposalUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi đề xuất mua hàng bị xóa
export class PurchaseProposalDeletedEvent extends PurchaseProposalEvent<PurchaseProposalEventPayload> {
    static create(payload: PurchaseProposalEventPayload, senderId: string): PurchaseProposalDeletedEvent {
        return new PurchaseProposalDeletedEvent(EvtPurchaseProposalDeleted, payload, { senderId });
    }

    static from(json: any): PurchaseProposalDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PurchaseProposalDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}