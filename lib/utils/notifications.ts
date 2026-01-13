/**
 * Notification Utilities
 */

import { prisma } from '@/lib/db/prisma';

export interface CreateNotificationData {
  userId: string;
  orderId?: string;
  type:
    | 'ORDER_PLACED'
    | 'ORDER_CONFIRMED'
    | 'PAYMENT_CONFIRMED'
    | 'RIDER_ASSIGNED'
    | 'RIDER_ON_THE_WAY'
    | 'ORDER_DELIVERED'
    | 'ORDER_CANCELLED'
    | 'LOW_STOCK'
    | 'PROMOTION';
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Create a notification
 */
export async function createNotification(data: CreateNotificationData) {
  return await prisma.notification.create({
    data: {
      userId: data.userId,
      orderId: data.orderId || null,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || null,
    },
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

