'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { ArrowLeft, Bell, Globe, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
          Settings
        </h1>
      </div>

      {/* Notification Settings */}
      <GlassCard className="p-6">
        <h2 className="text-title-md font-bold text-gray-900 mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-brand-energy-orange" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive order updates</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications ? 'bg-brand-deep-blue' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-gray-600" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">Dark Mode</p>
                <p className="text-sm text-gray-500">Switch theme</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-brand-deep-blue' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Language */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-brand-deep-blue" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Language</p>
            <p className="text-sm text-gray-500">English (US)</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

