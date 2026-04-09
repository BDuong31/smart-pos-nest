import { z } from 'zod';
import { 
  NotificationSchema, 
  NotificationReadSchema, 
  NotificationSettingSchema, 
  NotificationType 
} from './notification.model';
import { UserRole } from 'src/share/interface';

// ============================
// 1. CREATE NOTIFICATION
// ============================

export const NotificationCreateDTOSchema = NotificationSchema.pick({
  title: true,
  content: true,
  userId: true,
  role: true,
  isGlobal: true,
  type: true,
  refType: true,
  refId: true,
})
.partial({
  userId: true,
  role: true,
  isGlobal: true,
  refType: true,
  refId: true,
})
.refine(
  (data) => {
    const count = [data.userId, data.role, data.isGlobal].filter(Boolean).length;
    return count === 1; 
  },
  {
    message: 'Must provide exactly one target (userId | role | isGlobal)',
  }
);

export type CreateNotificationDTO = z.infer<typeof NotificationCreateDTOSchema>;


// ============================
// 2. UPDATE NOTIFICATION
// ============================

export const NotificationUpdateDTOSchema = NotificationSchema.pick({
  title: true,
  content: true,
  userId: true,
  role: true,
  isGlobal: true,
  type: true,
  refType: true,
  refId: true,
}).partial();

export type UpdateNotificationDTO = z.infer<typeof NotificationUpdateDTOSchema>;


// ============================
// 3. FILTER / QUERY NOTIFICATION
// ============================

export const NotificationCondDTOSchema = z.object({
  userId: z.string().uuid().optional(),
  role: z.nativeEnum(UserRole).optional(),
  type: z.nativeEnum(NotificationType).optional(),
  isGlobal: z.boolean().optional(),

  refType: z.string().max(50).optional(),
  refId: z.string().uuid().optional(),

  isRead: z.boolean().optional(), // 🔥 filter unread

  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export type NotificationCondDTO = z.infer<typeof NotificationCondDTOSchema>;


// ============================
// 4. PAGING
// ============================

export const PagingDTOSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type PagingDTO = z.infer<typeof PagingDTOSchema>;


// ============================
// 5. MARK AS READ
// ============================

export const MarkAsReadDTOSchema = z.object({
  notificationId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type MarkAsReadDTO = z.infer<typeof MarkAsReadDTOSchema>;


// ============================
// 6. MARK ALL AS READ
// ============================

export const MarkAllAsReadDTOSchema = z.object({
  userId: z.string().uuid(),
});

export type MarkAllAsReadDTO = z.infer<typeof MarkAllAsReadDTOSchema>;


// ============================
// 7. NOTIFICATION SETTING
// ============================

export const UpdateNotificationSettingDTOSchema = z.object({
  userId: z.string().uuid(),
  enabled: z.boolean(),
});

export type UpdateNotificationSettingDTO = z.infer<typeof UpdateNotificationSettingDTOSchema>;


// ============================
// 8. GET UNREAD COUNT
// ============================

export const UnreadCountDTOSchema = z.object({
  userId: z.string().uuid(),
});

export type UnreadCountDTO = z.infer<typeof UnreadCountDTOSchema>;