'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  ArrowLeft, UserCheck, Phone, Mail, 
  MapPin, Award, Truck, DollarSign,
  TrendingUp, Clock, CheckCircle, XCircle,
  Calendar, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock rider data - replace with API call
const mockRider = {
  id: '2',
  name: 'Jane Smith',
  phone: '+233 XX XXX XXXX',
  email: 'jane@example.com',
  status: 'online' as const,
  totalDeliveries: 189,
  rating: 4.9,
  totalEarnings: 9875.25,
  location: 'Dansoman, Accra',
  activeOrders: 1,
  joinedDate: '2023-06-15',
  completedOrders: [
    { id: 'GAS12348', date: '2024-01-16', amount: 45.50, status: 'delivered' },
    { id: 'GAS12347', date: '2024-01-15', amount: 35.00, status: 'delivered' },
    { id: 'GAS12346', date: '2024-01-14', amount: 65.00, status: 'delivered' },
  ],
  stats: {
    todayDeliveries: 5,
    todayEarnings: 245.50,
    weekDeliveries: 32,
    weekEarnings: 1245.75,
    monthDeliveries: 145,
    monthEarnings: 5234.50,
  },
};

export default function RiderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const riderId = params?.id as string;

  const [rider] = useState(mockRider);

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
          <h1 className="text-title-lg font-bold text-gray-900">Rider Details</h1>
          <p className="text-sm text-gray-500">View rider information and performance</p>
        </div>
      </motion.div>

      {/* Rider Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-deep-blue to-brand-corporate-blue rounded-2xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {rider.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                rider.status === 'online' ? 'bg-brand-safety-green' : 'bg-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-title-md font-bold text-gray-900">{rider.name}</h2>
                <div className="flex items-center gap-1 px-2 py-1 bg-brand-energy-orange/10 rounded-lg">
                  <Award className="w-4 h-4 text-brand-energy-orange" />
                  <span className="text-sm font-semibold text-brand-energy-orange">{rider.rating}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{rider.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{rider.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{rider.location}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{rider.totalDeliveries}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold text-brand-safety-green">GH₵{rider.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-brand-deep-blue" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Today</p>
          <p className="text-xl font-bold text-gray-900">{rider.stats.todayDeliveries} deliveries</p>
          <p className="text-sm font-semibold text-brand-safety-green">GH₵{rider.stats.todayEarnings.toFixed(2)}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-brand-energy-orange" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">This Week</p>
          <p className="text-xl font-bold text-gray-900">{rider.stats.weekDeliveries} deliveries</p>
          <p className="text-sm font-semibold text-brand-safety-green">GH₵{rider.stats.weekEarnings.toFixed(2)}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-brand-safety-green/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-brand-safety-green" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">This Month</p>
          <p className="text-xl font-bold text-gray-900">{rider.stats.monthDeliveries} deliveries</p>
          <p className="text-sm font-semibold text-brand-safety-green">GH₵{rider.stats.monthEarnings.toFixed(2)}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-brand-corporate-blue/10 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-brand-corporate-blue" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Active Orders</p>
          <p className="text-2xl font-bold text-brand-energy-orange">{rider.activeOrders}</p>
        </GlassCard>
      </motion.div>

      {/* Recent Deliveries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h2 className="text-title-md font-bold text-gray-900 mb-4">Recent Deliveries</h2>
        <div className="space-y-3">
          {rider.completedOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-safety-green/10 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-brand-safety-green" />
                    <span className="text-sm font-semibold text-gray-900 capitalize">{order.status}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">Earnings</p>
                  <p className="text-lg font-bold text-brand-safety-green">GH₵{order.amount.toFixed(2)}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
