'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import NotificationTest from '@/components/Notifications/NotificationTest';

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-display-sm font-bold text-gray-900">
          Notifications
        </h1>
      </div>

      {/* Notification Test Component */}
      <NotificationTest />

      {/* Info Card */}
      <GlassCard className="p-6">
        <h3 className="font-semibold text-gray-900 mb-3">About Push Notifications</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            Push notifications keep you updated about your gas orders, delivery status, and special offers.
          </p>
          <p>
            You can test the notification system using the controls above. Test notifications will be sent every 5 minutes.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Note: Notifications work best when the app is installed as a PWA. Make sure to install the app for the best experience.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
