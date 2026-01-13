/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */

import { NextRequest, NextResponse } from 'next/server';
// import { authenticateRequest } from '@/lib/auth/middleware';
// import { markAllNotificationsAsRead } from '@/lib/utils/notifications';

export async function PATCH(request: NextRequest) {
  // TODO: Implement when backend is ready
  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}
