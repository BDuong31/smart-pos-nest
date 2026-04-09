import { INotificationService,type INotificationRepository } from "./notification.port";
import {
  CreateNotificationDTO,
  UpdateNotificationDTO,
  NotificationCondDTO,
  UpdateNotificationSettingDTO,
} from "./notification.dto";
import {
  Notification,
  NotificationSetting,
  ErrNotificationNotFound,
} from "./notification.model";
import { GATEWAY_SERVICE, Paginated, PagingDTO, Requester } from "src/share";
import { Inject } from "@nestjs/common";
import { NOTIFICATION_REPOSITORY } from "./notification.di-token";
import { AppGateway } from "src/share/components/gateway";

export class NotificationService implements INotificationService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly repo: INotificationRepository,
    @Inject(GATEWAY_SERVICE) private readonly gateway: AppGateway,
  ) {}

  // ========================
  // NOTIFICATION
  // ========================

  async createNotification(
    requester: Requester,
    dto: CreateNotificationDTO,
    ip: string,
    userAgent: string
  ): Promise<string> {
    const count = [dto.userId, dto.role, dto.isGlobal].filter(Boolean).length;
    if (count !== 1) {
      throw new Error("Must provide exactly one target (userId | role | isGlobal)");
    }

    if (dto.userId) {
      const setting = await this.repo.createSettingIfNotExists(dto.userId);

      if (!setting.enabled) {
        return ""; 
      }
    }

    const created = await this.repo.createNotification(dto);

    if (created.userId) {
      this.gateway.emitToUser(
        created.userId,
        "notification:new",
        created
      );
    }

    else if (created.role) {
      this.gateway.emitToRole(
        created.role,
        "notification:new",
        created
      );
    }

    else if (created.isGlobal) {
      this.gateway.emitAll(
        "notification:new",
        created
      );
    }
    return created.id;
  }

  async updateNotification(
    requester: Requester,
    id: string,
    dto: UpdateNotificationDTO,
    ip: string,
    userAgent: string
  ): Promise<void> {
    const existing = await this.repo.getNotification(id);
    if (!existing) throw ErrNotificationNotFound;

    await this.repo.updateNotification(id, dto);
  }

  async deleteNotification(
    requester: Requester,
    id: string,
    ip: string,
    userAgent: string
  ): Promise<void> {
    const existing = await this.repo.getNotification(id);
    if (!existing) throw ErrNotificationNotFound;

    await this.repo.deleteNotification(id);
  }

  async getNotification(id: string): Promise<Notification | null> {
    return this.repo.getNotification(id);
  }

  async listNotification(
    cond: NotificationCondDTO,
    paging: PagingDTO
  ): Promise<Paginated<Notification>> {
    return this.repo.listNotification(cond, paging);
  }

  async listNotificationByIds(ids: string[]): Promise<Notification[]> {
    return this.repo.listNotificationByIds(ids);
  }

  // ========================
  // READ
  // ========================

  async markAsRead(
    requester: Requester,
    notificationId: string,
    ip: string,
    userAgent: string
  ): Promise<void> {
    const userId = requester.sub;

    const notification = await this.repo.getNotification(notificationId);
    if (!notification) throw ErrNotificationNotFound;

    // 🔥 check đã đọc chưa
    const existed = await this.repo.getNotificationRead(notificationId, userId);
    if (existed) return;

    await this.repo.insertNotificationRead({
      notificationId,
      userId,
    });
  }

  async markAllAsRead(requester: Requester, userId: string, ip: string, userAgent: string): Promise<void> {
    await this.repo.markAllAsRead(userId);
  }

  async countUnread(userId: string): Promise<number> {
    return this.repo.countUnread(userId);
  }

  async getNotificationRead(
    notificationId: string,
    userId: string
  ) {
    return this.repo.getNotificationRead(notificationId, userId);
  }

  // ========================
  // SETTING
  // ========================

  async updateNotificationSetting(
    requester: Requester,
    userId: string,
    dto: UpdateNotificationSettingDTO,
    ip: string,
    userAgent: string
  ): Promise<void> {
    if (requester.sub !== userId) {
      throw new Error("Permission denied");
    }

    await this.repo.updateNotificationSetting(userId, dto);
  }

  async getNotificationSetting(userId: string): Promise<NotificationSetting | null> {
    return this.repo.getNotificationSetting(userId);
  }
}