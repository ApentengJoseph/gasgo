'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import StatusBadge from '@/components/Badges/StatusBadge';
import { 
  Package, ArrowLeft, Search, 
  Flame, MapPin, UserCheck, Truck, 
  DollarSign, Clock, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock orders data
const orders = [
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

const statusFilters = ['all', 'pending', 'assigned', 'on_the_way', 'delivered'] as const;

export default function AdminOrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'assigned' | 'on_the_way' | 'delivered'>('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'assigned' || o.status === 'on_the_way').length,
    completed: orders.filter(o => o.status === 'delivered').length,
  };

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
          <h1 className="text-title-lg font-bold text-gray-900">Manage Orders</h1>
          <p className="text-sm text-gray-500">View and manage all orders</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
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
          </div>
          <p className="text-xs text-gray-500 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-brand-corporate-blue/10 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-brand-corporate-blue" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-brand-safety-green/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-brand-safety-green" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
        </GlassCard>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Filters - Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <GlassCard className="p-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2">
            {statusFilters.map((filter) => (
              <motion.button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  statusFilter === filter
                    ? 'bg-gradient-to-r from-brand-deep-blue to-brand-corporate-blue text-white shadow-lg shadow-brand-deep-blue/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')}
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-3"
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
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
                  <StatusBadge status={order.status} />
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
                      <UserCheck className="w-4 h-4 text-brand-safety-green" />
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
          ))
        ) : (
          <GlassCard className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </GlassCard>
        )}
      </motion.div>
    </div>
  );
}
