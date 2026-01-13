'use client';

import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { User, MapPin, Bell, Shield, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="space-y-6 py-6">
      {/* Profile Header */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-deep-blue to-brand-energy-orange rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">KA</span>
          </div>
          <div className="flex-1">
            <h2 className="text-title-md font-bold text-gray-900">Kwame Apenten</h2>
            <p className="text-sm text-gray-600">+233 XX XXX XXXX</p>
            <p className="text-sm text-gray-500">kwame@example.com</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/profile/edit')}
          className="w-full px-6 py-3 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <User className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </GlassCard>

      {/* Menu Items */}
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-4 cursor-pointer hover:shadow-lg transition-all">
            <button 
              onClick={() => router.push('/profile/addresses')}
              className="w-full flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-brand-deep-blue" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">Saved Addresses</p>
                <p className="text-sm text-gray-500">Manage delivery locations</p>
              </div>
            </button>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-4 cursor-pointer hover:shadow-lg transition-all">
            <button 
              onClick={() => router.push('/notifications')}
              className="w-full flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-brand-energy-orange" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">Notifications</p>
                <p className="text-sm text-gray-500">Manage alerts & updates</p>
              </div>
            </button>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-4 cursor-pointer hover:shadow-lg transition-all">
            <button 
              onClick={() => router.push('/profile/security')}
              className="w-full flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-brand-safety-green/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand-safety-green" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">Safety & Privacy</p>
                <p className="text-sm text-gray-500">Security settings</p>
              </div>
            </button>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-4 cursor-pointer hover:shadow-lg transition-all">
            <button 
              onClick={() => router.push('/profile/settings')}
              className="w-full flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">Settings</p>
                <p className="text-sm text-gray-500">App preferences</p>
              </div>
            </button>
          </GlassCard>
        </motion.div>
      </div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('gaso-user-phone');
              localStorage.removeItem('gaso-user-email');
              router.push('/auth/login');
            }
          }}
          className="w-full px-6 py-3 bg-white border-2 border-red-300 text-red-700 hover:bg-red-50 active:bg-red-100 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </motion.div>
    </div>
  );
}

