'use client';

import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  BarChart3, ArrowLeft, TrendingUp, 
  TrendingDown, DollarSign, Package,
  Users, Clock, Target, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

const analytics = {
  revenue: {
    today: 9245.50,
    week: 65432.75,
    month: 245678.25,
    change: +12.5,
  },
  orders: {
    today: 47,
    week: 312,
    month: 1247,
    change: +8.2,
  },
  deliveryTime: {
    average: 32,
    change: -5.2,
  },
  completionRate: {
    value: 94.5,
    change: +2.1,
  },
  topRiders: [
    { name: 'John Doe', deliveries: 245, earnings: 12450.50 },
    { name: 'Jane Smith', deliveries: 189, earnings: 9875.25 },
    { name: 'Ama Serwah', deliveries: 312, earnings: 15678.00 },
  ],
};

export default function AdminAnalyticsPage() {
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
          <h1 className="text-title-lg font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-sm text-gray-500">Detailed insights and performance metrics</p>
        </div>
      </motion.div>

      {/* Revenue Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-title-md font-bold text-gray-900 mb-1">Revenue Overview</h2>
            <p className="text-sm text-gray-500">Total revenue across all periods</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-safety-green/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-brand-safety-green" />
            <span className="text-sm font-semibold text-brand-safety-green">
              +{analytics.revenue.change}%
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-brand-deep-blue" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">Today</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">GH₵{analytics.revenue.today.toLocaleString()}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-brand-energy-orange" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">This Week</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">GH₵{analytics.revenue.week.toLocaleString()}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-brand-safety-green/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-brand-safety-green" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">This Month</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">GH₵{analytics.revenue.month.toLocaleString()}</p>
          </GlassCard>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-brand-deep-blue" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-brand-safety-green/10 rounded-lg">
              <TrendingUp className="w-3 h-3 text-brand-safety-green" />
              <span className="text-xs font-semibold text-brand-safety-green">
                +{analytics.orders.change}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-2">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.orders.month}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-brand-energy-orange" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-brand-safety-green/10 rounded-lg">
              <TrendingDown className="w-3 h-3 text-brand-safety-green" />
              <span className="text-xs font-semibold text-brand-safety-green">
                {analytics.deliveryTime.change}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-2">Avg. Delivery Time</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.deliveryTime.average} min</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-brand-safety-green/10 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-brand-safety-green" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-brand-safety-green/10 rounded-lg">
              <TrendingUp className="w-3 h-3 text-brand-safety-green" />
              <span className="text-xs font-semibold text-brand-safety-green">
                +{analytics.completionRate.change}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-2">Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.completionRate.value}%</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-brand-corporate-blue/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-corporate-blue" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-2">Active Riders</p>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </GlassCard>
      </motion.div>

      {/* Top Riders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-brand-energy-orange" />
            <h2 className="text-title-md font-bold text-gray-900">Top Performing Riders</h2>
          </div>
          <div className="space-y-4">
            {analytics.topRiders.map((rider, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-deep-blue to-brand-corporate-blue rounded-xl flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{rider.name}</p>
                    <p className="text-sm text-gray-500">{rider.deliveries} deliveries</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-brand-safety-green">
                    GH₵{rider.earnings.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
