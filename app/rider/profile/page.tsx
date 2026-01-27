'use client';

import GlassCard from '@/components/Cards/GlassCard';
import { User, Bell, Shield, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function RiderProfilePage() {
  const router = useRouter();

  return (
    <div className="space-y-6 py-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-display-sm font-bold text-gray-900">Rider Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your rider account</p>
      </motion.div>

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
          type="button"
          onClick={() => router.push('/rider/profile/edit')}
          className="w-full px-6 py-3 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <User className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </GlassCard>

      <div className="space-y-3">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="p-4 cursor-pointer hover:shadow-lg transition-all">
            <button
              type="button"
              onClick={() => router.push('/notifications')}
              className="w-full flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-brand-energy-orange" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">Notifications</p>
                <p className="text-sm text-gray-500">Alerts & updates</p>
              </div>
            </button>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="p-4 cursor-pointer hover:shadow-lg transition-all">
            <button
              type="button"
              onClick={() => router.push('/rider/profile/security')}
              className="w-full flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-brand-safety-green/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand-safety-green" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">Security</p>
                <p className="text-sm text-gray-500">Password & privacy</p>
              </div>
            </button>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('gaso-user-phone');
              localStorage.removeItem('gaso-user-email');
              router.push('/');
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
