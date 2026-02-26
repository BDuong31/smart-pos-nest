import e from "express";
import { AppEvent } from "../data-model";

// Định nghĩa tên các sự kiện liên quan đến điểm thưởng hạng thành viên
export const EvtPointsIncreased = 'loyalty.points.increased'; // sự kiện khi người dùng tăng điểm thưởng
export const EvtPointsDecreased = 'loyalty.points.decreased'; // sự kiện khi người dùng giảm điểm thưởng
export const EvtPointsReset = 'loyalty.points.reset'; // sự kiện reset điểm thưởng của người dùng
export const EvtUserRankChanged = 'loyalty.user.rank.changed'; // sự kiện khi người dùng đổi hạng thành viên
export const EvtRankCreated = 'loyalty.rank.created'; // sự kiện khi có thêm hạng thành viên mới
export const EvtRankDeleted = 'loyalty.rank.deleted'; // sự kiện khi hạng thành viên bị xóa
export const EvtRankUpdated = 'loyalty.rank.updated'; // sự kiện khi hạng thành viên được cập nhật

// Định nghĩa các sự kiện liên quan đến điểm thưởng hạng thành viên
export type LoyaltyEventPayload = {
    userId?: string; // ID người dùng   
    points?: number; // Số điểm thay đổi    
    oldRankId?: string; // ID hạng thành viên cũ    
    newRankId?: string; // ID hạng thành viên mới    
    rankId?: string; // ID hạng thành viên    
    rankName?: string; // Tên hạng thành viên
    rankChanges?: any; // thay đổi của hạng thành viên
};

// Payload: Dữ liệu đi kèm sự kiện  
export class LoyaltyEvent<T extends LoyaltyEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }   
    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends LoyaltyEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): LoyaltyEvent<T> {
        return new LoyaltyEvent<T>(eventName, payload, { senderId });
    }
    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends LoyaltyEventPayload>(json: any): LoyaltyEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new LoyaltyEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi người dùng tăng điểm thưởng
export class PointsIncreasedEvent extends LoyaltyEvent<LoyaltyEventPayload> {
    // Tạo sự kiện 
    static create(payload: LoyaltyEventPayload, senderId: string): PointsIncreasedEvent {
         return LoyaltyEvent.createEvent(EvtPointsIncreased, payload, senderId) as PointsIncreasedEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): PointsIncreasedEvent {
        return LoyaltyEvent.fromJson<LoyaltyEventPayload>(json) as PointsIncreasedEvent;
    }
}

// Sự kiện khi người dùng giảm điểm thưởng
export class PointsDecreasedEvent extends LoyaltyEvent<LoyaltyEventPayload> {
    // Tạo sự kiện 
    static create(payload: LoyaltyEventPayload, senderId: string): PointsDecreasedEvent {
         return LoyaltyEvent.createEvent(EvtPointsDecreased, payload, senderId) as PointsDecreasedEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): PointsDecreasedEvent {
        return LoyaltyEvent.fromJson<LoyaltyEventPayload>(json) as PointsDecreasedEvent;
    }
}

// Sự kiện khi điểm thưởng của người dùng được reset
export class PointsResetEvent extends LoyaltyEvent<LoyaltyEventPayload> {
    // Tạo sự kiện 
    static create(payload: LoyaltyEventPayload, senderId: string): PointsResetEvent {
         return LoyaltyEvent.createEvent(EvtPointsReset, payload, senderId) as PointsResetEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): PointsResetEvent {
        return LoyaltyEvent.fromJson<LoyaltyEventPayload>(json) as PointsResetEvent;
    }
}

// Sự kiện khi người dùng đổi hạng thành viên
export class UserRankChangedEvent extends LoyaltyEvent<LoyaltyEventPayload> {
    // Tạo sự kiện 
    static create(payload: LoyaltyEventPayload, senderId: string): UserRankChangedEvent {
         return LoyaltyEvent.createEvent(EvtUserRankChanged, payload, senderId) as UserRankChangedEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): UserRankChangedEvent {
        return LoyaltyEvent.fromJson<LoyaltyEventPayload>(json) as UserRankChangedEvent;
    }
}

// Sự kiện khi có thêm hạng thành viên mới
export class RankCreatedEvent extends LoyaltyEvent<LoyaltyEventPayload> {
    // Tạo sự kiện 
    static create(payload: LoyaltyEventPayload, senderId: string): RankCreatedEvent {
         return LoyaltyEvent.createEvent(EvtRankCreated, payload, senderId) as RankCreatedEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): RankCreatedEvent {
        return LoyaltyEvent.fromJson<LoyaltyEventPayload>(json) as RankCreatedEvent;
    }
}

// Sự kiện khi hạng thành viên bị xóa
export class RankDeletedEvent extends LoyaltyEvent<LoyaltyEventPayload> {
    // Tạo sự kiện 
    static create(payload: LoyaltyEventPayload, senderId: string): RankDeletedEvent {
         return LoyaltyEvent.createEvent(EvtRankDeleted, payload, senderId) as RankDeletedEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): RankDeletedEvent {
        return LoyaltyEvent.fromJson<LoyaltyEventPayload>(json) as RankDeletedEvent;
    }
}

// Sự kiện khi hạng thành viên được cập nhật
export class RankUpdatedEvent extends LoyaltyEvent<LoyaltyEventPayload> {
    // Tạo sự kiện 
    static create(payload: LoyaltyEventPayload, senderId: string): RankUpdatedEvent {
         return LoyaltyEvent.createEvent(EvtRankUpdated, payload, senderId) as RankUpdatedEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): RankUpdatedEvent {
        return LoyaltyEvent.fromJson<LoyaltyEventPayload>(json) as RankUpdatedEvent;
    }
}

// Sự kiện khi người dùng bị xóa
export class UserDeletedEvent extends LoyaltyEvent<LoyaltyEventPayload> {
    // Tạo sự kiện
    static create(payload: LoyaltyEventPayload, senderId: string): UserDeletedEvent {
        return LoyaltyEvent.createEvent(EvtRankUpdated, payload, senderId) as UserDeletedEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): UserDeletedEvent {
        return LoyaltyEvent.fromJson<LoyaltyEventPayload>(json) as UserDeletedEvent;
    }
}