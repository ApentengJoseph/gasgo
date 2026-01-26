'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Download, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock earnings data
const earningsHistory = [
  { id: '1', orderId: 'GAS12345', date: '2024-01-16', amount: 45.50, status: 'completed' },
  { id: '2', orderId: 'GAS12344', date: '2024-01-16', amount: 35.00, status: 'completed' },
  { id: '3', orderId: 'GAS12343', date: '2024-01-15', amount: 65.00, status: 'completed' },
  { id: '4', orderId: 'GAS12342', date: '2024-01-15', amount: 42.50, status: 'completed' },
  { id: '5', orderId: 'GAS12341', date: '2024-01-14', amount: 55.75, status: 'completed' },
];

const earningsSummary = {
  today: 245.50,
  thisWeek: 1245.75,
  thisMonth: 5234.50,
  allTime: 18450.25,
};

export default function RiderEarningsPage() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-display-sm font-bold text-gray-900">
          Earnings History
        </h1>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <GlassCard className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-safety-green to-brand-safety-green/70 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-4 h-4 text-brand-safety-green" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Today</p>
          <p className="text-2xl font-bold text-gray-900">GH₵{earningsSummary.today.toFixed(2)}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue to-brand-corporate-blue rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">This Week</p>
          <p className="text-2xl font-bold text-gray-900">GH₵{earningsSummary.thisWeek.toFixed(2)}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-energy-orange to-brand-energy-orange/70 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">This Month</p>
          <p className="text-2xl font-bold text-gray-900">GH₵{earningsSummary.thisMonth.toFixed(2)}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">All Time</p>
          <p className="text-2xl font-bold text-gray-900">GH₵{earningsSummary.allTime.toFixed(2)}</p>
        </GlassCard>
      </motion.div>

      {/* Filter & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3"
      >
        <GlassCard className="flex-1 p-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {(['today', 'week', 'month', 'all'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                  timeFilter === filter
                    ? 'bg-brand-deep-blue text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </GlassCard>
        <button
          onClick={() => {
            // Handle download
          }}
          className="px-4 py-3 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Earnings History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-title-md font-bold text-gray-900 mb-4">Transaction History</h2>
        <div className="space-y-3">
          {earningsHistory.map((earning, index) => (
            <motion.div
              key={earning.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <GlassCard className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-brand-safety-green/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-brand-safety-green" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Order #{earning.orderId}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(earning.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-brand-safety-green">
                      GH₵{earning.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{earning.status}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
