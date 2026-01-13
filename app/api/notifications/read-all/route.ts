/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { markAllNotificationsAsRead } from '@/lib/utils/notifications';

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) return auth.error;

    const { user } = auth;

    await markAllNotificationsAsRead(user.userId);

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

