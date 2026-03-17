import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến hóa đơn nhập hàng
export const EvtImportInvoiceCreated = 'import.invoice.created'; // Sự kiện khi một hóa đơn nhập hàng mới được tạo
export const EvtImportInvoiceUpdated = 'import.invoice.updated'; // Sự kiện khi một hóa đơn nhập hàng được cập nhật
export const EvtImportInvoiceDeleted = 'import.invoice.deleted'; // Sự kiện khi một hóa đơn nhập hàng bị xóa 

// Định nghĩa kiểu dữ liệu cho payload của sự kiện hóa đơn nhập hàng
export type ImportInvoiceEventPayload = {
    invoiceId: string; // ID của hóa đơn nhập hàng
    code?: string; // Mã hóa đơn nhập hàng
    supplierId?: string; // ID nhà cung cấp
    totalCost?: number; // Tổng chi phí của hóa đơn nhập hàng
    importDate?: Date; // Ngày nhập hàng
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class ImportInvoiceEvent<T extends ImportInvoiceEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends ImportInvoiceEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): ImportInvoiceEvent<T> {
        return new ImportInvoiceEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends ImportInvoiceEventPayload>(json: any): ImportInvoiceEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ImportInvoiceEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi hóa đơn nhập hàng được tạo mới
export class ImportInvoiceCreatedEvent extends ImportInvoiceEvent<ImportInvoiceEventPayload> {
    static create(payload: ImportInvoiceEventPayload, senderId: string): ImportInvoiceCreatedEvent {
        return new ImportInvoiceCreatedEvent(EvtImportInvoiceCreated, payload, { senderId });
    }

    static from(json: any): ImportInvoiceCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ImportInvoiceCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi hóa đơn nhập hàng được cập nhật
export class ImportInvoiceUpdatedEvent extends ImportInvoiceEvent<ImportInvoiceEventPayload> {
    static create(payload: ImportInvoiceEventPayload, senderId: string): ImportInvoiceUpdatedEvent {
        return new ImportInvoiceUpdatedEvent(EvtImportInvoiceUpdated, payload, { senderId });
    }

    static from(json: any): ImportInvoiceUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ImportInvoiceUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi hóa đơn nhập hàng bị xóa
export class ImportInvoiceDeletedEvent extends ImportInvoiceEvent<ImportInvoiceEventPayload> {
    static create(payload: ImportInvoiceEventPayload, senderId: string): ImportInvoiceDeletedEvent {
        return new ImportInvoiceDeletedEvent(EvtImportInvoiceDeleted, payload, { senderId });
    }

    static from(json: any): ImportInvoiceDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ImportInvoiceDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}