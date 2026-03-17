import { AppEvent } from "../data-model";

// Định nghĩa tên sự kiện liên quan đến sản phẩm
export const EvtProductCreated = 'ProductCreated'; // Sự kiện khi một sản phẩm mới được tạo
export const EvtProductUpdated = 'ProductUpdated'; // Sự kiện khi một sản phẩm được cập nhật
export const EvtProductDeleted = 'ProductDeleted'; // Sự kiện khi một sản phẩm bị xóa

// Định nghĩa tên sự kiện liên quan đến biến thể sản phẩm
export const EvtProductVariantCreated = 'ProductVariantCreated'; // Sự kiện khi một biến thể sản phẩm mới được tạo
export const EvtProductVariantUpdated = 'ProductVariantUpdated'; // Sự kiện khi một biến thể sản phẩm được cập nhật
export const EvtProductVariantDeleted = 'ProductVariantDeleted'; // Sự kiện khi một biến thể sản phẩm bị xóa

// Định nghĩa tên sự kiện liên quan đến combo sản phẩm
export const EvtProductComboCreated = 'ProductComboCreated'; // Sự kiện khi một combo sản phẩm mới được tạo
export const EvtProductComboUpdated = 'ProductComboUpdated'; // Sự kiện khi một combo sản phẩm được cập nhật
export const EvtProductComboDeleted = 'ProductComboDeleted'; // Sự kiện khi một combo sản phẩm bị xóa

// Định nghĩa tên sự kiện liên quan đến mục combo sản phẩm
export const EvtProductComboItemCreated = 'ProductComboItemCreated'; // Sự kiện khi một mục combo sản phẩm mới được tạo
export const EvtProductComboItemUpdated = 'ProductComboItemUpdated'; // Sự kiện khi một mục combo sản phẩm được cập nhật
export const EvtProductComboItemDeleted = 'ProductComboItemDeleted'; // Sự kiện khi một mục combo sản phẩm bị xóa

// Định nghĩa kiểu dữ liệu cho sự kiện liên quan đến sản phẩm
export type ProductEventPayload = {
    productId: string; // ID sản phẩm
    name?: string; // Tên sản phẩm
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Định nghĩa kiểu dữ liệu cho sự kiện liên quan đến biến thể sản phẩm
export type ProductVariantEventPayload = {
    productId: string; // ID sản phẩm
    variantId: string; // ID biến thể sản phẩm
    name?: string; // Tên biến thể sản phẩm
    priceDiff?: number; // Chênh lệch giá so với sản phẩm gốc
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Định nghĩa kiểu dữ liệu cho sự kiện liên quan đến combo sản phẩm
export type ProductComboEventPayload = {
    comboId: string; // ID combo sản phẩm
    name?: string; // Tên combo sản phẩm
    price?: number; // Giá combo sản phẩm
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Định nghĩa kiểu dữ liệu cho sự kiện liên quan đến mục combo sản phẩm
export type ProductComboItemEventPayload = {
    comboItemId: string; // ID mục combo sản phẩm
    comboId: string; // ID combo sản phẩm
    productId: string; // ID sản phẩm trong mục combo
    quantity?: number; // Số lượng sản phẩm trong mục combo
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; // Loại thay đổi
};

// Payload: Dữ liệu đi kèm sự kiện
export class ProductEvent<T extends ProductEventPayload | ProductVariantEventPayload | ProductComboEventPayload | ProductComboItemEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends ProductEventPayload | ProductVariantEventPayload | ProductComboEventPayload | ProductComboItemEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): ProductEvent<T> {
        return new ProductEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends ProductEventPayload | ProductVariantEventPayload | ProductComboEventPayload | ProductComboItemEventPayload>(json: any): ProductEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ProductEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi sản phẩm được tạo mới
export class ProductCreatedEvent extends ProductEvent<ProductEventPayload> {
    static create(payload: ProductEventPayload, senderId: string): ProductCreatedEvent {
        return new ProductCreatedEvent(EvtProductCreated, payload, { senderId });
    }

    static from(json: any): ProductCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ProductCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi sản phẩm được cập nhật
export class ProductUpdatedEvent extends ProductEvent<ProductEventPayload> {
    static create(payload: ProductEventPayload, senderId: string): ProductUpdatedEvent {
        return new ProductUpdatedEvent(EvtProductUpdated, payload, { senderId });
    }

    static from(json: any): ProductUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ProductUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi sản phẩm bị xóa
export class ProductDeletedEvent extends ProductEvent<ProductEventPayload> {
    static create(payload: ProductEventPayload, senderId: string): ProductDeletedEvent {
        return new ProductDeletedEvent(EvtProductDeleted, payload, { senderId });
    }

    static from(json: any): ProductDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ProductDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi biến thể sản phẩm được tạo mới
export class ProductVariantCreatedEvent extends ProductEvent<ProductVariantEventPayload> {
    static create(payload: ProductVariantEventPayload, senderId: string): ProductVariantCreatedEvent {
        return new ProductVariantCreatedEvent(EvtProductVariantCreated, payload, { senderId });
    }

    static from(json: any): ProductVariantCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ProductVariantCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi biến thể sản phẩm được cập nhật
export class ProductVariantUpdatedEvent extends ProductEvent<ProductVariantEventPayload> {
    static create(payload: ProductVariantEventPayload, senderId: string): ProductVariantUpdatedEvent {
        return new ProductVariantUpdatedEvent(EvtProductVariantUpdated, payload, { senderId });
    }

    static from(json: any): ProductVariantUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ProductVariantUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi biến thể sản phẩm bị xóa
export class ProductVariantDeletedEvent extends ProductEvent<ProductVariantEventPayload> {
    static create(payload: ProductVariantEventPayload, senderId: string): ProductVariantDeletedEvent {
        return new ProductVariantDeletedEvent(EvtProductVariantDeleted, payload, { senderId });
    }

    static from(json: any): ProductVariantDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ProductVariantDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi combo sản phẩm được tạo mới
export class ProductComboCreatedEvent extends ProductEvent<ProductComboEventPayload> {
    static create(payload: ProductComboEventPayload, senderId: string): ProductComboCreatedEvent {
        return new ProductComboCreatedEvent(EvtProductComboCreated, payload, { senderId });
    }

    static from(json: any): ProductComboCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ProductComboCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi combo sản phẩm được cập nhật
export class ProductComboUpdatedEvent extends ProductEvent<ProductComboEventPayload> {
    static create(payload: ProductComboEventPayload, senderId: string): ProductComboUpdatedEvent {
        return new ProductComboUpdatedEvent(EvtProductComboUpdated, payload, { senderId });
    }

    static from(json: any): ProductComboUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ProductComboUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi combo sản phẩm bị xóa
export class ProductComboDeletedEvent extends ProductEvent<ProductComboEventPayload> {
    static create(payload: ProductComboEventPayload, senderId: string): ProductComboDeletedEvent {
        return new ProductComboDeletedEvent(EvtProductComboDeleted, payload, { senderId });
    }

    static from(json: any): ProductComboDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ProductComboDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi mục combo sản phẩm được tạo mới
export class ProductComboItemCreatedEvent extends ProductEvent<ProductComboItemEventPayload> {
    static create(payload: ProductComboItemEventPayload, senderId: string): ProductComboItemCreatedEvent {
        return new ProductComboItemCreatedEvent(EvtProductComboItemCreated, payload, { senderId });
    }

    static from(json: any): ProductComboItemCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ProductComboItemCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi mục combo sản phẩm được cập nhật
export class ProductComboItemUpdatedEvent extends ProductEvent<ProductComboItemEventPayload> {
    static create(payload: ProductComboItemEventPayload, senderId: string): ProductComboItemUpdatedEvent {
        return new ProductComboItemUpdatedEvent(EvtProductComboItemUpdated, payload, { senderId });
    }

    static from(json: any): ProductComboItemUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ProductComboItemUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi mục combo sản phẩm bị xóa
export class ProductComboItemDeletedEvent extends ProductEvent<ProductComboItemEventPayload> {
    static create(payload: ProductComboItemEventPayload, senderId: string): ProductComboItemDeletedEvent {
        return new ProductComboItemDeletedEvent(EvtProductComboItemDeleted, payload, { senderId });
    }

    static from(json: any): ProductComboItemDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ProductComboItemDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}