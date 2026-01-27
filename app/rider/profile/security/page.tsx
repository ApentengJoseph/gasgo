'use client';

import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RiderProfileSecurityPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 py-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-display-sm font-bold text-gray-900">Security</h1>
      </motion.div>
      <GlassCard className="p-6">
        <p className="text-sm text-gray-600 mb-4">Password and privacy settings.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-deep-blue/20 focus:border-brand-deep-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-deep-blue/20 focus:border-brand-deep-blue"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push('/rider/profile')}
          className="mt-6 w-full px-6 py-3 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 font-semibold rounded-xl shadow-md hover:shadow-lg flex items-center justify-center"
        >
          Update Password
        </button>
      </GlassCard>
    </div>
  );
}
