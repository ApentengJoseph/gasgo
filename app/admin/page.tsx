'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  BarChart3, Users, Truck, Package, Settings, 
  TrendingUp, DollarSign, Clock, 
  MapPin, Flame, CheckCircle, 
  Activity, ArrowRight, RefreshCw,
  Calendar, Zap, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data
const recentOrders = [
  {
    id: 'GAS12345',
    status: 'assigned' as const,
    customerName: 'Kwame Mensah',
    location: 'East Legon, Accra',
    station: 'GasPro Station',
    size: '12kg',
    amount: 145.00,
    rider: 'John Doe',
    time: '2 mins ago',
  },
  {
    id: 'GAS12346',
    status: 'on_the_way' as const,
    customerName: 'Ama Serwah',
    location: 'Dansoman, Accra',
    station: 'SafeGas Depot',
    size: '6kg',
    amount: 85.00,
    rider: 'Jane Smith',
    time: '15 mins ago',
  },
  {
    id: 'GAS12347',
    status: 'pending' as const,
    customerName: 'Kojo Asante',
    location: 'Tema, Accra',
    station: 'Energy Plus',
    size: '25kg',
    amount: 245.00,
    rider: null,
    time: '1 hour ago',
  },
];

const stats = {
  todayOrders: { value: 47, change: +12, trend: 'up' },
  revenue: { value: 9245, change: +8.5, trend: 'up' },
  activeRiders: { value: 12, change: +2, trend: 'up' },
  pendingOrders: { value: 8, change: -3, trend: 'down' },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6 py-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard className="p-6 bg-gradient-to-br from-brand-deep-blue/5 via-white to-brand-energy-orange/5 border-brand-deep-blue/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 bg-gradient-to-br from-brand-deep-blue to-brand-corporate-blue rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-title-lg font-bold text-gray-900 mb-1">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Manage operations and monitor performance
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-safety-green">
              <Zap className="w-4 h-4" />
              <span className="font-semibold">All Systems Operational</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-brand-deep-blue" />
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-safety-green/10 rounded-lg">
              <TrendingUp className="w-3 h-3 text-brand-safety-green" />
              <span className="text-xs font-semibold text-brand-safety-green">+{stats.todayOrders.change}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Today&apos;s Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.todayOrders.value}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-brand-energy-orange" />
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-safety-green/10 rounded-lg">
              <TrendingUp className="w-3 h-3 text-brand-safety-green" />
              <span className="text-xs font-semibold text-brand-safety-green">+{stats.revenue.change}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Today&apos;s Revenue</p>
          <p className="text-xl font-bold text-gray-900">GH₵{stats.revenue.value.toLocaleString()}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-brand-safety-green/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-safety-green" />
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-safety-green/10 rounded-lg">
              <TrendingUp className="w-3 h-3 text-brand-safety-green" />
              <span className="text-xs font-semibold text-brand-safety-green">+{stats.activeRiders.change}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Active Riders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.activeRiders.value}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-safety-green/10 rounded-lg">
              <span className="text-xs font-semibold text-brand-safety-green">{stats.pendingOrders.change}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Pending Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders.value}</p>
        </GlassCard>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-title-md font-bold text-gray-900">Recent Orders</h2>
          <button
            onClick={() => router.push('/admin/orders')}
            className="px-4 py-2 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {recentOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <GlassCard 
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/admin/orders/${order.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Flame className="w-5 h-5 text-brand-energy-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate mb-1">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500 truncate">{order.customerName}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{order.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{order.station}</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-semibold">{order.size}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-lg font-bold text-gray-900">GH₵{order.amount.toFixed(2)}</p>
                  </div>
                  {order.rider ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-safety-green/10 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-brand-safety-green" />
                      <span className="text-sm font-semibold text-gray-900">{order.rider}</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/orders/${order.id}/assign`);
                      }}
                      className="px-4 py-2 bg-brand-deep-blue text-white hover:bg-brand-corporate-blue active:bg-brand-deep-blue/90 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg text-sm"
                    >
                      Assign Rider
                    </button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
