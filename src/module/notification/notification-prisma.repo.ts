import { INotificationRepository } from "./notification.port";
import {
  Notification,
  NotificationSetting,
  NotificationRead,
} from "./notification.model";
import {
  CreateNotificationDTO,
  UpdateNotificationDTO,
  NotificationCondDTO,
  UpdateNotificationSettingDTO,
} from "./notification.dto";
import { Paginated, PagingDTO, UserRole } from "src/share";
import prisma from "src/share/components/prisma";

export class NotificationPrismaRepository implements INotificationRepository {

  private toNotificationModel(item: any): Notification {
    return {
      id: item.id,
      title: item.title,
      content: item.content,
      userId: item.userId,
      role: item.role,
      isGlobal: item.isGlobal,
      type: item.type,
      refType: item.refType,
      refId: item.refId,

      isRead: item.reads?.length > 0,

      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  // ========================
  // NOTIFICATION
  // ========================

  async getNotification(id: string): Promise<Notification | null> {
    const result = await prisma.notification.findUnique({
      where: { id },
    });

    if (!result) return null;

    return this.toNotificationModel(result);
  }

  async listNotification(
    cond: NotificationCondDTO,
    paging: PagingDTO
  ): Promise<Paginated<Notification>> {
    const { userId, role, type, isGlobal, refType, refId, isRead, fromDate, toDate } = cond;

    const where: any = {
      AND: [],
    };

    where.AND.push({
      OR: [
        userId ? { userId } : undefined,
        role ? { role } : undefined,
        isGlobal !== undefined ? { isGlobal } : undefined,
      ].filter(Boolean),
    });

    if (type) where.AND.push({ type });
    if (refType) where.AND.push({ refType });
    if (refId) where.AND.push({ refId });

    if (fromDate || toDate) {
      where.AND.push({
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      });
    }

    const page = Number(paging.page) || 1;
    const limit = Number(paging.limit) || 10;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    let result = data.map(this.toNotificationModel);

    if (isRead !== undefined) {
      result = result.filter((item) => item.isRead === isRead);
    }
    
    return {
      data: result,
      paging,
      total,
    };
  }

  async listNotificationByIds(ids: string[]): Promise<Notification[]> {
    const data = await prisma.notification.findMany({
      where: { id: { in: ids } },
    });

    return data.map(this.toNotificationModel);
  }

  async createNotification(dto: CreateNotificationDTO): Promise<Notification> {
    const created = await prisma.notification.create({
      data: dto,
    });

    return this.toNotificationModel(created);
  }

  async updateNotification(id: string, dto: UpdateNotificationDTO): Promise<void> {
    await prisma.notification.update({
      where: { id },
      data: dto,
    });
  }

  async deleteNotification(id: string): Promise<void> {
    await prisma.notification.delete({
      where: { id },
    });
  }

  // ========================
  // READ
  // ========================

  async getNotificationRead(
    notificationId: string,
    userId: string
  ): Promise<NotificationRead | null> {
    return prisma.notificationRead.findUnique({
      where: {
        notificationId_userId: {
          notificationId,
          userId,
        },
      },
    });
  }

  async insertNotificationRead(data: {
    notificationId: string;
    userId: string;
  }): Promise<void> {
    await prisma.notificationRead.upsert({
      where: {
        notificationId_userId: data,
      },
      update: {},
      create: data,
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ userId }, { isGlobal: true }],
      },
      select: { id: true },
    });

    await prisma.notificationRead.createMany({
      data: notifications.map((n) => ({
        notificationId: n.id,
        userId,
      })),
      skipDuplicates: true,
    });
  }

  async countUnread(userId: string, role: string): Promise<number> {
    const total = await prisma.notification.count({
      where: {
        AND: [
          { isRead: false },
          {
            OR: [
              { userId: userId },
              ...(role ? [{ role: role as UserRole }] : []),
              { isGlobal: true },
            ],
          },
        ],
      },
    });

    return total;
  }

  // ========================
  // SETTING
  // ========================

  async getNotificationSetting(userId: string): Promise<NotificationSetting | null> {
    const data = await prisma.notificationSetting.findUnique({
      where: { userId },
    });
    
    if (!data) return null;

    return  data;
  }

  async updateNotificationSetting(
    userId: string,
    dto: UpdateNotificationSettingDTO
  ): Promise<void> {
    await prisma.notificationSetting.upsert({
      where: { userId },
      update: {
        enabled: dto.enabled,
      },
      create: {
        userId,
        enabled: dto.enabled,
      },
    });
  }

  async createSettingIfNotExists(userId: string): Promise<NotificationSetting> {
    return prisma.notificationSetting.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        enabled: true,
      },
    });
  }
}