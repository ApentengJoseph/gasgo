'use client';

import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { Package, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminOrdersPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 py-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
        </div>

        <GlassCard className="p-8 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Orders Management
          </h2>
          <p className="text-gray-500 mb-6">
            View, filter, and manage all orders from this page
          </p>
          <PrimaryButton onClick={() => router.push('/admin')}>
            Back to Dashboard
          </PrimaryButton>
        </GlassCard>
      </motion.div>
    </div>
  );
}
