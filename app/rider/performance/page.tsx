'use client';

import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { ArrowLeft, Star, TrendingUp, Clock, CheckCircle, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const performanceData = {
  averageRating: 4.8,
  totalDeliveries: 245,
  onTimeRate: 94,
  completionRate: 98,
  totalEarnings: 18450.25,
  ratingsBreakdown: [
    { stars: 5, count: 180, percentage: 73 },
    { stars: 4, count: 45, percentage: 18 },
    { stars: 3, count: 15, percentage: 6 },
    { stars: 2, count: 3, percentage: 1 },
    { stars: 1, count: 2, percentage: 1 },
  ],
};

export default function RiderPerformancePage() {
  const router = useRouter();

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
          Performance Metrics
        </h1>
      </motion.div>

      {/* Overall Rating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-6 bg-gradient-to-br from-amber-400/10 via-white to-orange-500/10 border-amber-200/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-title-md font-bold text-gray-900 mb-2">Overall Rating</h2>
              <div className="flex items-center gap-2">
                <p className="text-4xl font-bold text-gray-900">{performanceData.averageRating}</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.floor(performanceData.averageRating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Based on {performanceData.totalDeliveries} deliveries
              </p>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Award className="w-10 h-10 text-white" />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <GlassCard className="p-4">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-safety-green to-brand-safety-green/70 rounded-xl flex items-center justify-center mb-3 shadow-lg">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900">{performanceData.completionRate}%</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue to-brand-corporate-blue rounded-xl flex items-center justify-center mb-3 shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-gray-500 mb-1">On-Time Rate</p>
          <p className="text-2xl font-bold text-gray-900">{performanceData.onTimeRate}%</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-energy-orange to-brand-energy-orange/70 rounded-xl flex items-center justify-center mb-3 shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Total Deliveries</p>
          <p className="text-2xl font-bold text-gray-900">{performanceData.totalDeliveries}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-900">
            {performanceData.ratingsBreakdown.reduce((sum, r) => sum + r.count, 0)}
          </p>
        </GlassCard>
      </motion.div>

      {/* Ratings Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="p-6">
          <h2 className="text-title-md font-bold text-gray-900 mb-4">Rating Breakdown</h2>
          <div className="space-y-3">
            {performanceData.ratingsBreakdown.map((rating, index) => (
              <div key={rating.stars} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rating.stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="font-semibold text-gray-700">{rating.count}</span>
                  </div>
                  <span className="text-gray-500">{rating.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rating.percentage}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
