import { AppEvent } from "../data-model";

export const EvtCategoryCreated = 'CategoryCreated';
export const EvtCategoryUpdated = 'CategoryUpdated';
export const EvtCategoryDeleted = 'CategoryDeleted';

export type CategoryEventPayload = {
  categoryId: string;
  parentId?: string;
  name?: string;
  changeType: 'CREATED' | 'UPDATED' | 'DELETED';
};

export class CategoryEvent<T extends CategoryEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }   

    // Option: Thông tin thêm của sự kiện   
    protected static createEvent<T extends CategoryEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): CategoryEvent<T> {
        return new CategoryEvent<T>(eventName, payload, { senderId });
    }

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends CategoryEventPayload>(json: any): CategoryEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new CategoryEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}


export class CategoryCreatedEvent extends CategoryEvent<CategoryEventPayload> {
    
    // Tạo sự kiện
    static create(payload: CategoryEventPayload, senderId: string): CategoryCreatedEvent {
        return new CategoryCreatedEvent(EvtCategoryCreated, payload, { senderId });
    }   

    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): CategoryCreatedEvent {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new CategoryCreatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

export class CategoryUpdatedEvent extends CategoryEvent<CategoryEventPayload> {
  
  static create(payload: CategoryEventPayload, senderId: string): CategoryUpdatedEvent {
    return new CategoryUpdatedEvent(EvtCategoryUpdated, payload, { senderId });
  }

  static from(json: any): CategoryUpdatedEvent {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new CategoryUpdatedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
  }
}

export class CategoryDeletedEvent extends CategoryEvent<CategoryEventPayload> {
  static create(payload: CategoryEventPayload, senderId: string): CategoryDeletedEvent {
    return new CategoryDeletedEvent(EvtCategoryDeleted, payload, { senderId });
  }

  static from(json: any): CategoryDeletedEvent {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new CategoryDeletedEvent(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
  } 
}