'use client';

import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  Settings, ArrowLeft, Bell, 
  Shield, User, Globe, 
  CreditCard, Database, Lock, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const settingsCategories = [
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    description: 'Manage notification preferences',
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    icon: Shield,
    description: 'Account security settings',
  },
  {
    id: 'profile',
    title: 'Profile Settings',
    icon: User,
    description: 'Update your admin profile',
  },
  {
    id: 'system',
    title: 'System Settings',
    icon: Database,
    description: 'Configure system preferences',
  },
  {
    id: 'payments',
    title: 'Payment Settings',
    icon: CreditCard,
    description: 'Manage payment methods',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: Globe,
    description: 'Third-party integrations',
  },
];

export default function AdminSettingsPage() {
  const router = useRouter();

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
          <h1 className="text-title-lg font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Configure system settings and preferences</p>
        </div>
      </motion.div>

      {/* Settings Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-3"
      >
        {settingsCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <GlassCard 
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/admin/settings/${category.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue/10 to-brand-deep-blue/5 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-brand-deep-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{category.title}</h3>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h2 className="text-title-md font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/admin/settings/backup')}
              className="w-full px-6 py-4 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Database className="w-5 h-5" />
              <span>Backup Data</span>
            </button>
            <button
              onClick={() => router.push('/admin/settings/logs')}
              className="w-full px-6 py-4 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              <span>View System Logs</span>
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
