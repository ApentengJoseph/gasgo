'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  ArrowLeft, Bell, Save, 
  Mail, Smartphone, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotificationsSettingsPage() {
  const router = useRouter();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    riderUpdates: true,
    systemAlerts: true,
    marketingEmails: false,
    weeklyReports: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // Handle save
    console.log('Saving notification settings:', settings);
    router.back();
  };

  const notificationGroups = [
    {
      title: 'Email Notifications',
      icon: Mail,
      settings: [
        { key: 'emailNotifications' as const, label: 'Enable Email Notifications', description: 'Receive notifications via email' },
        { key: 'orderUpdates' as const, label: 'Order Updates', description: 'Get notified about order status changes' },
        { key: 'riderUpdates' as const, label: 'Rider Updates', description: 'Receive updates about rider activities' },
        { key: 'systemAlerts' as const, label: 'System Alerts', description: 'Important system notifications' },
        { key: 'weeklyReports' as const, label: 'Weekly Reports', description: 'Receive weekly performance reports' },
        { key: 'marketingEmails' as const, label: 'Marketing Emails', description: 'Promotional and marketing content' },
      ],
    },
    {
      title: 'Push Notifications',
      icon: Smartphone,
      settings: [
        { key: 'pushNotifications' as const, label: 'Enable Push Notifications', description: 'Receive push notifications on your device' },
        { key: 'orderUpdates' as const, label: 'Order Updates', description: 'Real-time order status updates' },
        { key: 'systemAlerts' as const, label: 'System Alerts', description: 'Critical system alerts' },
      ],
    },
    {
      title: 'SMS Notifications',
      icon: AlertCircle,
      settings: [
        { key: 'smsNotifications' as const, label: 'Enable SMS Notifications', description: 'Receive notifications via SMS' },
        { key: 'systemAlerts' as const, label: 'Critical Alerts Only', description: 'Only receive critical system alerts via SMS' },
      ],
    },
  ];

  return (
    <div className="space-y-6 py-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-title-lg font-bold text-gray-900">Notification Settings</h1>
          <p className="text-sm text-gray-500">Manage your notification preferences</p>
        </div>
      </motion.div>

      {/* Notification Groups */}
      <div className="space-y-6">
        {notificationGroups.map((group, groupIndex) => {
          const Icon = group.icon;
          return (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + groupIndex * 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue/10 to-brand-deep-blue/5 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-brand-deep-blue" />
                  </div>
                  <h2 className="text-title-md font-bold text-gray-900">{group.title}</h2>
                </div>
                <div className="space-y-4">
                  {group.settings.map((setting, index) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">{setting.label}</p>
                        <p className="text-sm text-gray-500">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => handleToggle(setting.key)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings[setting.key] ? 'bg-brand-deep-blue' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings[setting.key] ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <button
          onClick={handleSave}
          className="w-full px-6 py-4 bg-brand-deep-blue text-white hover:bg-brand-corporate-blue active:bg-brand-deep-blue/90 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>Save Changes</span>
        </button>
      </motion.div>
    </div>
  );
}
