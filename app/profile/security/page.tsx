'use client';

import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { ArrowLeft, Shield, Lock, Key, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SecurityPage() {
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
          Safety & Privacy
        </h1>
      </div>

      {/* Security Options */}
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-4 cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-safety-green/10 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-brand-safety-green" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Change Password</p>
                <p className="text-sm text-gray-500">Update your account password</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-4 cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-brand-deep-blue" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-4 cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-brand-energy-orange" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Privacy Settings</p>
                <p className="text-sm text-gray-500">Manage your data and privacy</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Safety Info */}
      <GlassCard className="p-6 bg-brand-safety-green/5 border-brand-safety-green/20">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-brand-safety-green flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Your Safety Matters</h3>
            <p className="text-sm text-gray-600">
              We take your privacy and security seriously. All your data is encrypted and protected.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

