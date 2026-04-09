import { AppEvent } from "../data-model"

// Định nghĩa tên sự kiện liên quan đến chi tiết hóa đơn nhập hàng
export const EvtImportInvoiceDetailCreated = 'import.invoice.detail.created'; // Sự kiện khi một chi tiết hóa đơn nhập hàng mới được tạo
export const EvtImportInvoiceDetailUpdated = 'import.invoice.detail.updated'; // Sự kiện khi một chi tiết hóa đơn nhập hàng được cập nhật
export const EvtImportInvoiceDetailDeleted = 'import.invoice.detail.deleted'; // Sự kiện khi một chi tiết hóa đơn nhập hàng bị xóa

// Định nghĩa kiểu dữ liệu cho payload của sự kiện chi tiết hóa đơn nhập hàng
export type ImportInvoiceDetailEventPayload = {
    detailId: string; // ID của chi tiết hóa đơn nhập hàng
    invoiceId: string; // ID của hóa đơn nhập hàng
    ingredientId?: string; // ID nguyên liệu
    quantity?: number; // Số lượng nguyên liệu
    unit?: string; // Đơn vị tính của nguyên liệu
    unitPrice?: number; // Giá của đơn vị nguyên liệu
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class ImportInvoiceDetailEvent<T extends ImportInvoiceDetailEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends ImportInvoiceDetailEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): ImportInvoiceDetailEvent<T> {
        return new ImportInvoiceDetailEvent<T>(eventName, payload, { senderId });
    }
    
    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends ImportInvoiceDetailEventPayload>(json: any): ImportInvoiceDetailEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ImportInvoiceDetailEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi chi tiết hóa đơn nhập hàng được tạo mới
export class ImportInvoiceDetailCreatedEvent extends ImportInvoiceDetailEvent<ImportInvoiceDetailEventPayload> {
    static create(payload: ImportInvoiceDetailEventPayload, senderId: string): ImportInvoiceDetailCreatedEvent {
        return new ImportInvoiceDetailCreatedEvent(EvtImportInvoiceDetailCreated, payload, { senderId });
    }

    static from(json: any): ImportInvoiceDetailCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ImportInvoiceDetailCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi chi tiết hóa đơn nhập hàng được cập nhật
export class ImportInvoiceDetailUpdatedEvent extends ImportInvoiceDetailEvent<ImportInvoiceDetailEventPayload> {
    static create(payload: ImportInvoiceDetailEventPayload, senderId: string): ImportInvoiceDetailUpdatedEvent {
        return new ImportInvoiceDetailUpdatedEvent(EvtImportInvoiceDetailUpdated, payload, { senderId });
    }

    static from(json: any): ImportInvoiceDetailUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ImportInvoiceDetailUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi chi tiết hóa đơn nhập hàng bị xóa
export class ImportInvoiceDetailDeletedEvent extends ImportInvoiceDetailEvent<ImportInvoiceDetailEventPayload> {
    static create(payload: ImportInvoiceDetailEventPayload, senderId: string): ImportInvoiceDetailDeletedEvent {
        return new ImportInvoiceDetailDeletedEvent(EvtImportInvoiceDetailDeleted, payload, { senderId });
    }

    static from(json: any): ImportInvoiceDetailDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ImportInvoiceDetailDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}