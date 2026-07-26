import { prisma } from "@/lib/prisma";

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}

export class NotificationService {
  static async getAll(userId: string, unreadOnly = false) {
    const where: { userId: string; isRead?: boolean } = { userId };
    if (unreadOnly) where.isRead = false;
    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  static async create(data: CreateNotificationInput) {
    return prisma.notification.create({ data });
  }

  static async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  static async delete(id: string) {
    return prisma.notification.delete({ where: { id } });
  }

  static async bulkCreate(notifications: CreateNotificationInput[]) {
    return prisma.notification.createMany({ data: notifications });
  }
}
