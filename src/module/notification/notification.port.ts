import { Paginated, PagingDTO, Requester } from "src/share";
import { Notification, NotificationRead, NotificationSetting } from "./notification.model";
import type { CreateNotificationDTO, UpdateNotificationDTO, NotificationCondDTO, UpdateNotificationSettingDTO } from "./notification.dto";

// ============================
// Định nghĩa các interface cho Notification
// ============================

// Định nghĩa các phương thức mà NotificationService phải triển khai
export interface INotificationService {
    // Notification
    createNotification(requester: Requester, dto: CreateNotificationDTO, ip: string, userAgent: string): Promise<string>; // Tạo thông báo mới
    updateNotification(requester: Requester, id: string, dto: UpdateNotificationDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật thông báo theo ID
    deleteNotification(requester: Requester, id: string, ip: string, userAgent: string): Promise<void>; // Xóa thông báo theo ID

    getNotification(id: string): Promise<Notification | null>; // Lấy thông tin thông báo theo ID
    listNotification(cond: NotificationCondDTO, paging: PagingDTO): Promise<Paginated<Notification>>; // Lấy danh sách thông báo theo điều kiện
    listNotificationByIds(ids: string[]): Promise<Notification[]>; // Lấy danh sách thông báo theo nhiều ID

    // Notification Read
    markAsRead(requester: Requester, notificationId: string, ip: string, userAgent: string): Promise<void>; // Đánh dấu thông báo đã đọc
    markAllAsRead(requester: Requester, userId: string, ip: string, userAgent: string): Promise<void>; // Đánh dấu tất cả thông báo của người dùng đã đọc

    getNotificationRead(notificationId: string, userId: string): Promise<NotificationRead | null>; // Lấy thông tin bản ghi đọc thông báo theo ID thông báo và ID người dùng

    updateNotificationSetting(requester: Requester, userId: string, dto: UpdateNotificationSettingDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật cài đặt thông báo cho người dùng
    getNotificationSetting(userId: string): Promise<NotificationSetting | null>; // Lấy thông tin cài đặt thông báo của người dùng theo ID người dùng   
}

// Định nghĩa các phương thức mà NotificationRepository phải triển khai
export interface INotificationRepository {
  // Notification
  getNotification(id: string): Promise<Notification | null>;
  listNotification(cond: NotificationCondDTO, paging: PagingDTO): Promise<Paginated<Notification>>;
  listNotificationByIds(ids: string[]): Promise<Notification[]>;
  createNotification(dto: CreateNotificationDTO): Promise<Notification>;
  updateNotification(id: string, dto: UpdateNotificationDTO): Promise<void>;
  deleteNotification(id: string): Promise<void>;
  // Read
  getNotificationRead(notificationId: string, userId: string): Promise<NotificationRead | null>;
  insertNotificationRead(data: { notificationId: string;  userId: string;}): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  countUnread(userId: string): Promise<number>;
  // Setting
  getNotificationSetting(userId: string): Promise<NotificationSetting | null>;
  updateNotificationSetting(userId: string,  dto: UpdateNotificationSettingDTO): Promise<void>;
  createSettingIfNotExists(userId: string): Promise<NotificationSetting>;
}