import { AppEvent } from "../data-model";

//. Định nghĩa tên sự kiện liên quan đến công thức
export const EvtRecipeCreated = 'RecipeCreated'; // Sự kiện khi một công thức mới được tạo
export const EvtRecipeUpdated = 'RecipeUpdated'; // Sự kiện khi một công thức được cập nhật
export const EvtRecipeDeleted = 'RecipeDeleted'; // Sự kiện khi một công thức bị xóa

//. Định nghĩa kiểu dữ liệu cho payload của sự kiện công thức
export type RecipeEventPayload = {
    recipeId: string; // ID của công thức
    ingredientId?: string; // ID của nguyên liệu liên quan
    amount?: number; // Số lượng của nguyên liệu trong công thức
    productId?: string; // ID của sản phẩm liên quan (nếu có)
    variantId?: string; // ID của biến thể sản phẩm liên quan (nếu có)
    optionItemId?: string; // ID của mục tùy chọn liên quan (nếu có)
    changeType: 'CREATED' | 'UPDATED' | 'DELETED'; //   Loại thay đổi   
};

//. Payload: Dữ liệu đi kèm sự kiện
export class RecipeEvent<T extends RecipeEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }

    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends RecipeEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): RecipeEvent<T> {
        return new RecipeEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends RecipeEventPayload>(json: any): RecipeEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new RecipeEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

//. Sự kiện khi công thức được tạo mới
export class RecipeCreatedEvent extends RecipeEvent<RecipeEventPayload> {
    static create(payload: RecipeEventPayload, senderId: string): RecipeCreatedEvent {
        return new RecipeCreatedEvent(EvtRecipeCreated, payload, { senderId });
    }

    static from(json: any): RecipeCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new RecipeCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

//. Sự kiện khi công thức được cập nhật
export class RecipeUpdatedEvent extends RecipeEvent<RecipeEventPayload> {
    static create(payload: RecipeEventPayload, senderId: string): RecipeUpdatedEvent {
        return new RecipeUpdatedEvent(EvtRecipeUpdated, payload, { senderId });
    }

    static from(json: any): RecipeUpdatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new RecipeUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

//. Sự kiện khi công thức bị xóa
export class RecipeDeletedEvent extends RecipeEvent<RecipeEventPayload> {
    static create(payload: RecipeEventPayload, senderId: string): RecipeDeletedEvent {
        return new RecipeDeletedEvent(EvtRecipeDeleted, payload, { senderId });
    }

    static from(json: any): RecipeDeletedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new RecipeDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}