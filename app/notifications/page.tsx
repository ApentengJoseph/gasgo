'use client';

import { useState } from 'react';
import GlassCard from '@/components/Cards/GlassCard';
import EmptyState from '@/components/Empty/EmptyState';
import NotificationDetailsModal from '@/components/Modals/NotificationDetailsModal';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock notifications
const notifications: Array<{
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}> = [
  {
    id: '1',
    type: 'success',
    title: 'Order Delivered',
    message: 'Your 12kg gas cylinder has been delivered successfully',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Rider On The Way',
    message: 'Kwame Boateng is on the way to your location. ETA: 15 minutes',
    time: '5 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Payment Confirmed',
    message: 'Your payment of GH₵193.75 has been confirmed',
    time: '1 day ago',
    read: true,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Low Stock Alert',
    message: 'Your preferred station is running low on 12kg cylinders',
    time: '2 days ago',
    read: true,
  },
];

const iconMap = {
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'text-brand-safety-green',
  warning: 'text-brand-energy-orange',
  info: 'text-brand-deep-blue',
};

export default function NotificationsPage() {
  const [selectedNotification, setSelectedNotification] = useState<typeof notifications[0] | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-display-sm font-bold text-gray-900 mb-2">
          Notifications
        </h1>
        <p className="text-gray-600">
          Stay updated on your orders and account
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((notification, index) => {
          const Icon = iconMap[notification.type as keyof typeof iconMap];
          const color = colorMap[notification.type as keyof typeof colorMap];

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard
                className={`p-4 cursor-pointer hover:shadow-lg transition-all active:scale-95 ${
                  !notification.read ? 'ring-2 ring-brand-deep-blue/20' : ''
                }`}
                onClick={() => {
                  setSelectedNotification(notification);
                  setShowNotificationModal(true);
                }}
              >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${color.replace('text-', 'bg-')}/10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-brand-deep-blue rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500">{notification.time}</p>
                </div>
              </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! We'll notify you when there's something new."
        />
      )}

      {/* Notification Details Modal */}
      {selectedNotification && (
        <NotificationDetailsModal
          isOpen={showNotificationModal}
          onClose={() => {
            setShowNotificationModal(false);
            setSelectedNotification(null);
          }}
          notification={selectedNotification}
        />
      )}
    </div>
  );
}

