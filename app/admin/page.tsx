'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import StatusBadge from '@/components/Badges/StatusBadge';
import { 
  BarChart3, Users, Truck, Package, Settings, 
  TrendingUp, TrendingDown, DollarSign, Clock, 
  MapPin, Flame, AlertCircle, CheckCircle, 
  Activity, Bell, ArrowRight, Eye, Edit, 
  Plus, Filter, Search, Download, RefreshCw,
  Home, UserCheck, Calendar, Target, Zap,
  Award, Shield, ArrowUpRight, ArrowDownRight, MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data - replace with API calls
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
  {
    id: 'GAS12348',
    status: 'delivered' as const,
    customerName: 'Efua Adjei',
    location: 'Labone, Accra',
    station: 'GasPro Station',
    size: '12kg',
    amount: 145.00,
    rider: 'John Doe',
    time: '2 hours ago',
  },
];

const recentActivity = [
  { type: 'order', message: 'New order #GAS12345 placed', time: '2 mins ago', icon: Package },
  { type: 'rider', message: 'Rider John Doe completed delivery', time: '15 mins ago', icon: CheckCircle },
  { type: 'station', message: 'Station inventory updated', time: '1 hour ago', icon: Truck },
  { type: 'alert', message: 'Low stock alert: 6kg cylinders', time: '2 hours ago', icon: AlertCircle },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = {
    todayOrders: { value: 47, change: +12, trend: 'up' },
    revenue: { value: 9245, change: +8.5, trend: 'up' },
    activeRiders: { value: 12, change: +2, trend: 'up' },
    pendingOrders: { value: 8, change: -3, trend: 'down' },
    totalStations: { value: 15, change: 0, trend: 'neutral' },
    completionRate: { value: 94.5, change: +2.1, trend: 'up' },
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50 pb-24">
      <div className="space-y-6 py-6 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Welcome Header - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <GlassCard className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-brand-deep-blue/15 via-white/95 to-brand-energy-orange/10 border-brand-deep-blue/30 shadow-2xl">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-deep-blue rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-energy-orange rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 sm:gap-6 flex-1">
                  <motion.div 
                    className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-deep-blue via-brand-corporate-blue to-brand-energy-orange rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-brand-deep-blue to-brand-corporate-blue bg-clip-text text-transparent">
                        Admin Dashboard
                      </h1>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="w-2 h-2 bg-brand-safety-green rounded-full"
                      />
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 font-medium">
                      Manage operations and monitor performance in real-time
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-brand-safety-green font-semibold">
                        <Zap className="w-4 h-4" />
                        <span>All Systems Operational</span>
                      </div>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm bg-white/90 hover:bg-white border border-gray-200/50 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 backdrop-blur-sm"
                >
                  <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden xs:inline">Refresh Data</span>
                </motion.button>
              </div>
              
              {/* Enhanced Quick Stats Row */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-gray-200/50">
                <motion.div 
                  className="text-center p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/50 hover:bg-white/70 transition-all cursor-pointer"
                  whileHover={{ y: -2 }}
                >
                  <p className="text-xs text-gray-500 mb-1.5 font-medium">This Week</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">312</p>
                  <div className="flex items-center justify-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-brand-safety-green" />
                    <p className="text-xs font-semibold text-brand-safety-green">+18%</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="text-center p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/50 hover:bg-white/70 transition-all cursor-pointer"
                  whileHover={{ y: -2 }}
                >
                  <p className="text-xs text-gray-500 mb-1.5 font-medium">This Month</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">1,247</p>
                  <div className="flex items-center justify-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-brand-safety-green" />
                    <p className="text-xs font-semibold text-brand-safety-green">+24%</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="text-center p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/50 hover:bg-white/70 transition-all cursor-pointer"
                  whileHover={{ y: -2 }}
                >
                  <p className="text-xs text-gray-500 mb-1.5 font-medium">Avg. Rating</p>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">4.8</p>
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-brand-energy-orange fill-brand-energy-orange" />
                  </div>
                  <p className="text-xs text-gray-500">Excellent</p>
                </motion.div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Main Stats Grid - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {/* Today's Orders - Enhanced */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <GlassCard className="relative overflow-hidden p-5 sm:p-6 hover:shadow-2xl transition-all cursor-pointer group border-brand-deep-blue/20">
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-deep-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <motion.div 
                    className="relative w-14 h-14 bg-gradient-to-br from-brand-deep-blue via-brand-corporate-blue to-brand-deep-blue rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <Package className="w-7 h-7 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl" />
                  </motion.div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${stats.todayOrders.trend === 'up' ? 'bg-brand-safety-green/10' : 'bg-red-50'}`}>
                    {stats.todayOrders.trend === 'up' ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-brand-safety-green" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={`text-xs font-bold ${stats.todayOrders.trend === 'up' ? 'text-brand-safety-green' : 'text-red-500'}`}>
                      {stats.todayOrders.trend === 'up' ? '+' : ''}{stats.todayOrders.change}%
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 font-medium">Today&apos;s Orders</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.todayOrders.value}</p>
                </div>
                {/* Mini progress bar */}
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-brand-deep-blue to-brand-corporate-blue rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Revenue - Enhanced */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <GlassCard className="relative overflow-hidden p-5 sm:p-6 hover:shadow-2xl transition-all cursor-pointer group border-brand-energy-orange/20">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-energy-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <motion.div 
                    className="relative w-14 h-14 bg-gradient-to-br from-brand-energy-orange via-orange-500 to-brand-energy-orange rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <DollarSign className="w-7 h-7 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl" />
                  </motion.div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${stats.revenue.trend === 'up' ? 'bg-brand-safety-green/10' : 'bg-red-50'}`}>
                    {stats.revenue.trend === 'up' ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-brand-safety-green" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={`text-xs font-bold ${stats.revenue.trend === 'up' ? 'text-brand-safety-green' : 'text-red-500'}`}>
                      {stats.revenue.trend === 'up' ? '+' : ''}{stats.revenue.change}%
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 font-medium">Today&apos;s Revenue</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">GH₵{stats.revenue.value.toLocaleString()}</p>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-brand-energy-orange to-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '82%' }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Active Riders - Enhanced */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="col-span-2 lg:col-span-1"
          >
            <GlassCard className="relative overflow-hidden p-5 sm:p-6 hover:shadow-2xl transition-all cursor-pointer group border-brand-safety-green/20">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-safety-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <motion.div 
                    className="relative w-14 h-14 bg-gradient-to-br from-brand-safety-green via-green-600 to-brand-safety-green rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <Users className="w-7 h-7 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl" />
                  </motion.div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${stats.activeRiders.trend === 'up' ? 'bg-brand-safety-green/10' : 'bg-red-50'}`}>
                    {stats.activeRiders.trend === 'up' ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-brand-safety-green" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={`text-xs font-bold ${stats.activeRiders.trend === 'up' ? 'text-brand-safety-green' : 'text-red-500'}`}>
                      {stats.activeRiders.trend === 'up' ? '+' : ''}{stats.activeRiders.change}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 font-medium">Active Riders</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.activeRiders.value}</p>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-brand-safety-green to-green-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '80%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Pending Orders - Enhanced */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <GlassCard className="relative overflow-hidden p-5 sm:p-6 hover:shadow-2xl transition-all cursor-pointer group border-amber-400/20">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <motion.div 
                    className="relative w-14 h-14 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <Clock className="w-7 h-7 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl" />
                  </motion.div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${stats.pendingOrders.trend === 'down' ? 'bg-brand-safety-green/10' : 'bg-red-50'}`}>
                    {stats.pendingOrders.trend === 'down' ? (
                      <ArrowDownRight className="w-3.5 h-3.5 text-brand-safety-green" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={`text-xs font-bold ${stats.pendingOrders.trend === 'down' ? 'text-brand-safety-green' : 'text-red-500'}`}>
                      {stats.pendingOrders.change > 0 ? '+' : ''}{stats.pendingOrders.change}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 font-medium">Pending Orders</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.pendingOrders.value}</p>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '17%' }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Completion Rate - Enhanced */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <GlassCard className="relative overflow-hidden p-5 sm:p-6 hover:shadow-2xl transition-all cursor-pointer group border-purple-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <motion.div 
                    className="relative w-14 h-14 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <Target className="w-7 h-7 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl" />
                  </motion.div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${stats.completionRate.trend === 'up' ? 'bg-brand-safety-green/10' : 'bg-red-50'}`}>
                    {stats.completionRate.trend === 'up' ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-brand-safety-green" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={`text-xs font-bold ${stats.completionRate.trend === 'up' ? 'text-brand-safety-green' : 'text-red-500'}`}>
                      {stats.completionRate.trend === 'up' ? '+' : ''}{stats.completionRate.change}%
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 font-medium">Completion Rate</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.completionRate.value}%</p>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.completionRate.value}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Recent Orders Section - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-gradient-to-b from-brand-deep-blue to-brand-corporate-blue rounded-full" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Recent Orders
                </h2>
              </div>
              <p className="text-sm text-gray-500 ml-3">Latest order activity and status updates</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/admin/orders')}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/90 hover:bg-white border border-gray-200/50 transition-all shadow-md hover:shadow-lg backdrop-blur-sm"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden xs:inline">View All</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </motion.button>
          </div>
        
          <div className="space-y-3 sm:space-y-4">
            {recentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 100 }}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <GlassCard 
                    className="relative overflow-hidden p-5 sm:p-6 hover:shadow-2xl transition-all border-brand-deep-blue/20 cursor-pointer group"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    {/* Left border accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      order.status === 'delivered' ? 'bg-brand-safety-green' :
                      order.status === 'on_the_way' ? 'bg-brand-corporate-blue' :
                      order.status === 'assigned' ? 'bg-brand-energy-orange' :
                      'bg-amber-400'
                    }`} />
                    
                    {/* Hover gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-deep-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-brand-energy-orange/20 to-brand-energy-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Flame className="w-5 h-5 text-brand-energy-orange" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate mb-1">
                                Order #{order.id}
                              </h3>
                              <p className="text-xs text-gray-500">{order.time}</p>
                            </div>
                          </div>
                          <div className="space-y-2.5 ml-12">
                            <div className="flex items-center gap-2.5 text-sm text-gray-700">
                              <div className="w-8 h-8 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <UserCheck className="w-4 h-4 text-brand-deep-blue" />
                              </div>
                              <span className="truncate font-medium">{order.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm text-gray-600">
                              <div className="w-8 h-8 bg-brand-corporate-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-4 h-4 text-brand-corporate-blue" />
                              </div>
                              <span className="truncate">{order.location}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm text-gray-600">
                              <div className="w-8 h-8 bg-brand-energy-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Truck className="w-4 h-4 text-brand-energy-orange" />
                              </div>
                              <span className="truncate">{order.station}</span>
                              <span className="text-gray-400">•</span>
                              <span className="font-semibold">{order.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3 ml-4">
                          <StatusBadge status={order.status} />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/orders/${order.id}`);
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 mt-4">
                        <div className="flex items-baseline gap-2">
                          <p className="text-xs text-gray-500 font-medium">Amount</p>
                          <p className="text-lg sm:text-xl font-bold text-gray-900">GH₵{order.amount.toFixed(2)}</p>
                        </div>
                        {order.rider ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-safety-green/10 rounded-lg">
                            <UserCheck className="w-4 h-4 text-brand-safety-green" />
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Rider</p>
                              <p className="text-sm font-semibold text-gray-900">{order.rider}</p>
                            </div>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/orders/${order.id}/assign`);
                            }}
                            className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-brand-deep-blue to-brand-corporate-blue text-white rounded-lg hover:shadow-lg transition-all"
                          >
                            Assign Rider
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions & Recent Activity - Enhanced */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Quick Actions - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 bg-gradient-to-b from-brand-deep-blue to-brand-corporate-blue rounded-full" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Quick Actions
              </h2>
            </div>
            <div className="space-y-3">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GlassCard className="p-1 bg-gradient-to-br from-brand-deep-blue/10 via-brand-deep-blue/5 to-transparent border-brand-deep-blue/30 shadow-lg">
                  <PrimaryButton 
                    fullWidth 
                    size="lg"
                    onClick={() => router.push('/admin/orders')}
                    className="justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                      <span className="font-semibold">Manage Orders</span>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                  </PrimaryButton>
                </GlassCard>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GlassCard className="p-1 border-brand-safety-green/20 hover:border-brand-safety-green/40 transition-colors">
                  <PrimaryButton 
                    fullWidth 
                    size="lg" 
                    variant="secondary"
                    onClick={() => router.push('/admin/riders')}
                    className="justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-safety-green/10 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-brand-safety-green" />
                      </div>
                      <span className="font-semibold">Manage Riders</span>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                  </PrimaryButton>
                </GlassCard>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GlassCard className="p-1 border-brand-energy-orange/20 hover:border-brand-energy-orange/40 transition-colors">
                  <PrimaryButton 
                    fullWidth 
                    size="lg" 
                    variant="secondary"
                    onClick={() => router.push('/admin/stations')}
                    className="justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-xl flex items-center justify-center">
                        <Truck className="w-5 h-5 text-brand-energy-orange" />
                      </div>
                      <span className="font-semibold">Manage Stations</span>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                  </PrimaryButton>
                </GlassCard>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GlassCard className="p-1 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                  <PrimaryButton 
                    fullWidth 
                    size="lg" 
                    variant="secondary"
                    onClick={() => router.push('/admin/analytics')}
                    className="justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="font-semibold">View Analytics</span>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                  </PrimaryButton>
                </GlassCard>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GlassCard className="p-1 border-gray-300/50 hover:border-gray-400/50 transition-colors">
                  <PrimaryButton 
                    fullWidth 
                    size="lg" 
                    variant="secondary"
                    onClick={() => router.push('/admin/settings')}
                    className="justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Settings className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-semibold">Settings</span>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                  </PrimaryButton>
                </GlassCard>
              </motion.div>
            </div>
          </motion.div>

          {/* Recent Activity - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-brand-deep-blue to-brand-corporate-blue rounded-full" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Recent Activity
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/admin/activity')}
                className="text-sm text-brand-deep-blue font-semibold hover:text-brand-corporate-blue transition-colors flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
            <GlassCard className="p-5 sm:p-6 shadow-lg">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 100 }}
                      className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0 border-gray-200/50 hover:bg-gray-50/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                    >
                      <motion.div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                          activity.type === 'alert' 
                            ? 'bg-gradient-to-br from-red-50 to-red-100 text-red-600 border border-red-200' 
                            : activity.type === 'order'
                            ? 'bg-gradient-to-br from-brand-deep-blue/10 to-brand-deep-blue/5 text-brand-deep-blue border border-brand-deep-blue/20'
                            : activity.type === 'rider'
                            ? 'bg-gradient-to-br from-brand-safety-green/10 to-brand-safety-green/5 text-brand-safety-green border border-brand-safety-green/20'
                            : 'bg-gradient-to-br from-brand-energy-orange/10 to-brand-energy-orange/5 text-brand-energy-orange border border-brand-energy-orange/20'
                        }`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Icon className="w-6 h-6" />
                      </motion.div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-sm sm:text-base font-semibold text-gray-900 mb-1.5 leading-snug">
                          {activity.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <p className="text-xs text-gray-500 font-medium">{activity.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Performance Metrics Preview - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-gradient-to-b from-brand-deep-blue to-brand-corporate-blue rounded-full" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Performance Overview
                </h2>
              </div>
              <p className="text-sm text-gray-500 ml-3">Key metrics and insights at a glance</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/admin/analytics')}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/90 hover:bg-white border border-gray-200/50 transition-all shadow-md hover:shadow-lg backdrop-blur-sm"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden xs:inline">Full Report</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </motion.button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <GlassCard className="relative overflow-hidden p-5 hover:shadow-xl transition-all border-brand-deep-blue/20">
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-deep-blue/5 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-brand-deep-blue" />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-brand-safety-green/10 rounded-lg">
                      <ArrowUpRight className="w-3 h-3 text-brand-safety-green" />
                      <span className="text-xs text-brand-safety-green font-bold">+5.2%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Avg. Delivery Time</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">32 min</p>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-brand-deep-blue to-brand-corporate-blue rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1, delay: 0.8 }}
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <GlassCard className="relative overflow-hidden p-5 hover:shadow-xl transition-all border-brand-safety-green/20">
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-safety-green/5 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-brand-safety-green/10 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-brand-safety-green" />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-brand-safety-green/10 rounded-lg">
                      <ArrowUpRight className="w-3 h-3 text-brand-safety-green" />
                      <span className="text-xs text-brand-safety-green font-bold">+2.1%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Success Rate</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">98.5%</p>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-brand-safety-green to-green-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '98.5%' }}
                      transition={{ duration: 1, delay: 0.9 }}
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <GlassCard className="relative overflow-hidden p-5 hover:shadow-xl transition-all border-brand-energy-orange/20">
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-energy-orange/5 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-brand-energy-orange" />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-brand-safety-green/10 rounded-lg">
                      <ArrowUpRight className="w-3 h-3 text-brand-safety-green" />
                      <span className="text-xs text-brand-safety-green font-bold">+3</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">New Riders</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">This Week</p>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-brand-energy-orange to-orange-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '60%' }}
                      transition={{ duration: 1, delay: 1.0 }}
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <GlassCard className="relative overflow-hidden p-5 hover:shadow-xl transition-all border-purple-500/20">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                      <Home className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                      <Shield className="w-3 h-3 text-gray-600" />
                      <span className="text-xs text-gray-600 font-bold">Stable</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Active Stations</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{stats.totalStations.value}</p>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, delay: 1.1 }}
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

