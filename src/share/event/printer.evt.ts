import { AppEvent } from "../data-model";

export const EvtPrinerCreated = 'PrinterCreated'; // Sự kiện khi một máy in mới được tạo
export const EvtPrinerUpdated = 'PrinterUpdated'; // Sự kiện khi thông tin máy in được cập nhật
export const EvtPrinerDeleted = 'PrinterDeleted'; // Sự kiện khi một máy in bị xóa

export type PrinterEventPayload = {
    printerId: string;
    name?: string;
    type?: string;
    ipAddress?: string;
    changeType: 'CREATED' | 'UPDATED' | 'DELETED';
}

// Payload: Dữ liệu đi kèm sự kiện
export class PrinterEvent<T extends PrinterEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends PrinterEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): PrinterEvent<T> {
        return new PrinterEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends PrinterEventPayload>(json: any): PrinterEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PrinterEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi máy in được tạo mới
export class PrinterCreatedEvent extends PrinterEvent<PrinterEventPayload> {
    static create(payload: PrinterEventPayload, senderId: string): PrinterCreatedEvent {
        return new PrinterCreatedEvent(EvtPrinerCreated, payload, { senderId });
    }

    static from(json: any): PrinterCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PrinterCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi máy in được cập nhật
export class PrinterUpdatedEvent extends PrinterEvent<PrinterEventPayload> {
    static create(payload: PrinterEventPayload, senderId: string): PrinterUpdatedEvent {
        return new PrinterUpdatedEvent(EvtPrinerUpdated, payload, { senderId });
    }

    static from(json: any): PrinterUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PrinterUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi máy in bị xóa
export class PrinterDeletedEvent extends PrinterEvent<PrinterEventPayload> {
    static create(payload: PrinterEventPayload, senderId: string): PrinterDeletedEvent {
        return new PrinterDeletedEvent(EvtPrinerDeleted, payload, { senderId });
    }

    static from(json: any): PrinterDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new PrinterDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}