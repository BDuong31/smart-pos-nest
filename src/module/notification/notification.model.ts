import { en } from "@faker-js/faker";
import { UserRole } from "src/share";
import { z } from "zod";

// ============================
// Model cho Notification
// ============================

// Định nghĩa lỗi cho Notification
// 1. Lỗi chung về Notification
export const ErrNotificationNotFound = new Error('Notification not found'); // Lỗi thông báo không tồn tại
export const ErrNotificationAlreadyExists = new Error('Notification already exists'); // Lỗi thông báo đã tồn tại

// 2. Lỗi về loại thông báo
export const ErrNotificationTypeInvalid = new Error('Invalid notification type'); // Lỗi loại thông báo không hợp lệ

// Định nghĩa lỗi cho NotificationRead
// 1. Lỗi chung về NotificationRead
export const ErrNotificationReadNotFound = new Error('Notification read record not found'); // Lỗi bản ghi đọc thông báo không tồn tại
export const ErrNotificationReadAlreadyExists = new Error('Notification read record already exists'); // Lỗi bản ghi đọc thông báo đã tồn tại

// Định nghĩa lỗi cho NotificationSetting
// 1. Lỗi chung về NotificationSetting
export const ErrNotificationSettingNotFound = new Error('Notification setting not found'); // Lỗi cài đặt thông báo không tồn tại
export const ErrNotificationSettingAlreadyExists = new Error('Notification setting already exists'); // Lỗi cài đặt thông báo đã tồn tại

// Định nghĩa các loại thông báo
export enum NotificationType {
  ORDER = "order",
  PAYMENT = "payment",
  INVENTORY = "inventory",
  RESERVATION = "reservation",
  PROMOTION = "promotion",
  SYSTEM = "system"
}

// Định nghĩa model cho Notification
export const NotificationSchema = z.object({
    id: z.string().uuid(),
    title: z.string().max(255),
    content: z.string(),
    userId: z.string().uuid().optional(),
    role: z.nativeEnum(UserRole).optional(),
    type: z.nativeEnum(NotificationType),
    isGlobal: z.boolean(),
    refType: z.string().max(50).optional(),
    refId: z.string().uuid().optional(),
    isRead: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

// Định nghĩa kiểu dữ liệu cho Notification
export type Notification = z.infer<typeof NotificationSchema>;

// Định nghĩa model cho NotificationRead
export const NotificationReadSchema = z.object({
    id: z.string().uuid(),
    notificationId: z.string().uuid(),
    userId: z.string().uuid(),
    readAt: z.date()
});

// Định nghĩa kiểu dữ liệu cho NotificationRead
export type NotificationRead = z.infer<typeof NotificationReadSchema>;

// Định nghĩa model cho NotificationSetting
export const NotificationSettingSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    enabled: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date()
});

// Định nghĩa kiểu dữ liệu cho NotificationSetting
export type NotificationSetting = z.infer<typeof NotificationSettingSchema>;
