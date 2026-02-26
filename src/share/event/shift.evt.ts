import e from "express";
import { AppEvent } from "../data-model";

// Định nghĩa tên các sự kiện liên quan đến ca làm việc
export const EvtShiftCreated = 'shift.created'; // Sự kiện khi ca làm việc được tạo
export const EvtShiftUpdated = 'shift.updated'; // Sự kiện khi ca làm việc được cập nhật
export const EvtShiftDeleted = 'shift.deleted'; // Sự kiện khi ca làm việc bị xóa

// Định nghĩa các sự kiện liên quan đến ca làm việc
export type ShiftEventPayload = {
    shiftId: string; // ID ca làm việc
    name: string; // Tên ca làm việc
    startTime?: string; // Thời gian bắt đầu
    startCash?: number; // Số tiền mặt ban đầu 
    endTime?: string; // Thời gian kết thúc
    endCash?: number; // Số tiền mặt cuối ca
};

// Payload: Dữ liệu đi kèm sự kiện
export class ShiftEvent<T extends ShiftEventPayload> extends AppEvent<T> {
    protected constructor(
        eventName: string,
        payload: T,
        option: { id?: string; occurredAt?: Date; senderId: string }
    ) {
        super(eventName, payload, option);
    }
    
    // Option: Thông tin thêm của sự kiện
    protected static createEvent<T extends ShiftEventPayload>(
        eventName: string,
        payload: T,
        senderId: string
    ): ShiftEvent<T> {
        return new ShiftEvent<T>(eventName, payload, { senderId });
    } 

    // Chuyển đổi dữ liệu JSON sang đối tượng sự kiện
    protected static fromJson<T extends ShiftEventPayload>(json: any): ShiftEvent<T> {
        const { eventName, payload, id, occurredAt, senderId } = json;
        return new ShiftEvent<T>(eventName, payload, { id, occurredAt: new Date(occurredAt), senderId });
    }
}

// Sự kiện khi ca làm việc được tạo
export class ShiftCreatedEvent extends ShiftEvent<ShiftEventPayload> {

    // Tạo sự kiện 
    static create(payload: ShiftEventPayload, senderId: string): ShiftCreatedEvent {
         return ShiftEvent.createEvent(EvtShiftCreated, payload, senderId) as ShiftCreatedEvent;
    }

    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): ShiftCreatedEvent {
        return ShiftEvent.fromJson<ShiftEventPayload>(json) as ShiftCreatedEvent;
    }
}

// Sự kiện khi ca làm việc được cập nhật
export class ShiftUpdatedEvent extends ShiftEvent<ShiftEventPayload> {
    // Tạo sự kiện 
    static create(payload: ShiftEventPayload, senderId: string): ShiftUpdatedEvent {
         return ShiftEvent.createEvent(EvtShiftUpdated, payload, senderId) as ShiftUpdatedEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): ShiftUpdatedEvent {
        return ShiftEvent.fromJson<ShiftEventPayload>(json) as ShiftUpdatedEvent;
    }
}

// Sự kiện khi ca làm việc bị xóa
export class ShiftDeletedEvent extends ShiftEvent<ShiftEventPayload> {
    // Tạo sự kiện 
    static create(payload: ShiftEventPayload, senderId: string): ShiftDeletedEvent {
         return ShiftEvent.createEvent(EvtShiftDeleted, payload, senderId) as ShiftDeletedEvent;
    }
    // Chuyển đổi từ JSON sang đối tượng sự kiện
    static from(json: any): ShiftDeletedEvent {
        return ShiftEvent.fromJson<ShiftEventPayload>(json) as ShiftDeletedEvent;
    }
}