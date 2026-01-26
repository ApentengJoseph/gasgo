'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  ArrowLeft, Database, Server, 
  Globe, Clock, Save, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SystemSettingsPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    timezone: 'Africa/Accra',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle save
    console.log('Saving system settings:', formData);
    router.back();
  };

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
          <h1 className="text-title-lg font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500">Configure system preferences and defaults</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue/10 to-brand-deep-blue/5 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-brand-deep-blue" />
              </div>
              <h2 className="text-title-md font-bold text-gray-900">General Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                >
                  <option value="Africa/Accra">Africa/Accra (GMT)</option>
                  <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Date Format</label>
                <select
                  value={formData.dateFormat}
                  onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Time Format</label>
                <select
                  value={formData.timeFormat}
                  onChange={(e) => setFormData({ ...formData, timeFormat: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                >
                  <option value="24h">24 Hour</option>
                  <option value="12h">12 Hour (AM/PM)</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Maintenance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-energy-orange/10 to-brand-energy-orange/5 rounded-xl flex items-center justify-center">
                <Server className="w-6 h-6 text-brand-energy-orange" />
              </div>
              <h2 className="text-title-md font-bold text-gray-900">Maintenance</h2>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Maintenance Mode</p>
                <p className="text-sm text-gray-500">Put the system in maintenance mode</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, maintenanceMode: !formData.maintenanceMode })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.maintenanceMode ? 'bg-brand-energy-orange' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.maintenanceMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Backup Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-safety-green/10 to-brand-safety-green/5 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-brand-safety-green" />
              </div>
              <h2 className="text-title-md font-bold text-gray-900">Backup Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Auto Backup</p>
                  <p className="text-sm text-gray-500">Automatically backup system data</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, autoBackup: !formData.autoBackup })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.autoBackup ? 'bg-brand-safety-green' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      formData.autoBackup ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              {formData.autoBackup && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Backup Frequency</label>
                  <select
                    value={formData.backupFrequency}
                    onChange={(e) => setFormData({ ...formData, backupFrequency: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <button
            type="submit"
            className="w-full px-6 py-4 bg-brand-deep-blue text-white hover:bg-brand-corporate-blue active:bg-brand-deep-blue/90 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
        </motion.div>
      </form>
    </div>
  );
}
