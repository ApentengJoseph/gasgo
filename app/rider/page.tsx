'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import StatusBadge from '@/components/Badges/StatusBadge';
import { Truck, DollarSign, Clock, MapPin, Star, CheckCircle, Flame, ArrowRight, Power, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data - replace with API calls
const activeOrders = [
  {
    id: 'GAS12345',
    status: 'at_station' as const,
    size: '12kg',
    customerName: 'Kwame Mensah',
    customerLocation: 'East Legon, Accra',
    stationName: 'GasPro Station',
    earnings: 45.50,
    createdAt: '2024-01-16T10:30:00',
  },
  {
    id: 'GAS12346',
    status: 'on_the_way' as const,
    size: '6kg',
    customerName: 'Ama Serwah',
    customerLocation: 'Dansoman, Accra',
    stationName: 'SafeGas Depot',
    earnings: 35.00,
    createdAt: '2024-01-16T09:15:00',
  },
  {
    id: 'GAS12347',
    status: 'assigned' as const,
    size: '25kg',
    customerName: 'Kojo Asante',
    customerLocation: 'Tema, Accra',
    stationName: 'Energy Plus',
    earnings: 65.00,
    createdAt: '2024-01-16T11:00:00',
  },
];

export default function RiderDashboard() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  const stats = {
    todayEarnings: 245.50,
    activeOrders: activeOrders.length,
    completedToday: 8,
    averageRating: 4.8,
  };

  const getStatusAction = (status: string) => {
    switch (status) {
      case 'assigned':
        return { label: 'Start Journey', variant: 'energy' as const };
      case 'at_station':
        return { label: 'Collect Cylinder', variant: 'energy' as const };
      case 'collected':
        return { label: 'Start Delivery', variant: 'energy' as const };
      case 'on_the_way':
        return { label: 'View Route', variant: 'secondary' as const };
      case 'arriving_soon':
        return { label: 'Arrive', variant: 'energy' as const };
      default:
        return { label: 'View Details', variant: 'secondary' as const };
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* Welcome Header with Online Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard className="p-6 bg-gradient-to-br from-brand-deep-blue/5 via-white to-brand-energy-orange/5 border-brand-deep-blue/20 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-deep-blue to-brand-energy-orange rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-title-lg font-bold text-gray-900 mb-1">
                  Rider Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your deliveries and earnings
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm
                transition-all duration-200 shadow-md hover:shadow-lg
                ${isOnline
                  ? 'bg-brand-safety-green/10 text-brand-safety-green border-2 border-brand-safety-green/30 hover:bg-brand-safety-green/20'
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
                }
              `}
            >
              <Power className={`w-4 h-4 ${isOnline ? 'text-brand-safety-green' : 'text-gray-500'}`} />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <GlassCard className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-safety-green to-brand-safety-green/70 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-4 h-4 text-brand-safety-green" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Today&apos;s Earnings</p>
          <p className="text-2xl font-bold text-gray-900">GH₵{stats.todayEarnings.toFixed(2)}</p>
        </GlassCard>

        <GlassCard className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-energy-orange to-brand-energy-orange/70 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            {stats.activeOrders > 0 && (
              <div className="w-6 h-6 bg-brand-energy-orange/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-brand-energy-orange">{stats.activeOrders}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-1">Active Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
        </GlassCard>

        <GlassCard className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue to-brand-corporate-blue rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Completed Today</p>
          <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
        </GlassCard>

        <GlassCard className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Star className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Average Rating</p>
          <div className="flex items-center gap-1">
            <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
        </GlassCard>
      </motion.div>

      {/* Active Orders */}
      {activeOrders.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-title-md font-bold text-gray-900">
              Active Orders
            </h2>
            <span className="text-sm text-gray-500">{activeOrders.length} orders</span>
          </div>
          <div className="space-y-4">
            {activeOrders.map((order, index) => {
              const action = getStatusAction(order.status);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <GlassCard className="p-5 hover:shadow-lg transition-all border-brand-deep-blue/10 cursor-pointer"
                    onClick={() => router.push(`/rider/orders/${order.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Flame className="w-5 h-5 text-brand-energy-orange" />
                          <h3 className="text-title-sm font-bold text-gray-900">
                            Order #{order.id}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {order.size} cylinder • {order.stationName}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{order.customerLocation}</span>
                        </div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500">Customer</p>
                        <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Earnings</p>
                        <p className="text-sm font-bold text-brand-safety-green">GH₵{order.earnings.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <PrimaryButton 
                        size="sm" 
                        variant="secondary" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/rider/orders/${order.id}`);
                        }}
                      >
                        View Details
                      </PrimaryButton>
                      <PrimaryButton 
                        size="sm" 
                        variant={action.variant}
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle action based on status
                          router.push(`/rider/orders/${order.id}`);
                        }}
                      >
                        {action.label}
                      </PrimaryButton>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <GlassCard className="p-8 text-center">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-title-sm font-semibold text-gray-900 mb-2">
              No Active Orders
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              You don&apos;t have any active orders at the moment
            </p>
            <PrimaryButton
              variant="secondary"
              onClick={() => setIsOnline(true)}
            >
              Go Online to Accept Orders
            </PrimaryButton>
          </GlassCard>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-3"
      >
        <GlassCard className="p-4 bg-gradient-to-br from-brand-deep-blue/5 to-transparent border-brand-deep-blue/20">
          <PrimaryButton 
            fullWidth 
            size="lg"
            onClick={() => router.push('/rider/earnings')}
          >
            <DollarSign className="w-5 h-5" />
            View Earnings History
          </PrimaryButton>
        </GlassCard>

        <PrimaryButton 
          fullWidth 
          variant="secondary"
          onClick={() => router.push('/rider/performance')}
        >
          <TrendingUp className="w-5 h-5" />
          Performance Metrics
        </PrimaryButton>
      </motion.div>
    </div>
  );
}
