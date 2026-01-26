'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  Users, ArrowLeft, Search, 
  UserCheck, Truck, Award, 
  MapPin, Phone, CheckCircle, XCircle, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock riders data
const riders = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+233 XX XXX XXXX',
    status: 'online' as const,
    totalDeliveries: 245,
    rating: 4.8,
    earnings: 12450.50,
    location: 'East Legon, Accra',
    activeOrders: 2,
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+233 XX XXX XXXX',
    status: 'online' as const,
    totalDeliveries: 189,
    rating: 4.9,
    earnings: 9875.25,
    location: 'Dansoman, Accra',
    activeOrders: 1,
  },
  {
    id: '3',
    name: 'Kwame Asante',
    phone: '+233 XX XXX XXXX',
    status: 'offline' as const,
    totalDeliveries: 156,
    rating: 4.7,
    earnings: 8234.75,
    location: 'Tema, Accra',
    activeOrders: 0,
  },
];

export default function AdminRidersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRiders = riders.filter(rider =>
    rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rider.phone.includes(searchQuery) ||
    rider.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: riders.length,
    online: riders.filter(r => r.status === 'online').length,
    offline: riders.filter(r => r.status === 'offline').length,
    active: riders.filter(r => r.activeOrders > 0).length,
  };

  return (
    <div className="space-y-6 py-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-title-lg font-bold text-gray-900">Manage Riders</h1>
            <p className="text-sm text-gray-500">View and manage delivery riders</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/admin/riders/new')}
          className="px-4 py-2 bg-brand-deep-blue text-white hover:bg-brand-corporate-blue active:bg-brand-deep-blue/90 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg text-sm"
        >
          <Plus className="w-4 h-4" />
        </button>
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
              <Users className="w-5 h-5 text-brand-deep-blue" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Total Riders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-brand-safety-green/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-brand-safety-green" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Online</p>
          <p className="text-2xl font-bold text-gray-900">{stats.online}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-gray-300/10 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Offline</p>
          <p className="text-2xl font-bold text-gray-900">{stats.offline}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-brand-energy-orange" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
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
              placeholder="Search riders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Riders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-3"
      >
        {filteredRiders.map((rider, index) => (
          <motion.div
            key={rider.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
          >
            <GlassCard 
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/admin/riders/${rider.id}`)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue to-brand-corporate-blue rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {rider.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    rider.status === 'online' ? 'bg-brand-safety-green' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{rider.name}</h3>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-energy-orange/10 rounded-lg">
                      <Award className="w-3 h-3 text-brand-energy-orange" />
                      <span className="text-xs font-semibold text-brand-energy-orange">{rider.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="truncate">{rider.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{rider.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Deliveries</p>
                  <p className="text-lg font-bold text-gray-900">{rider.totalDeliveries}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Earnings</p>
                  <p className="text-lg font-bold text-brand-safety-green">GH₵{rider.earnings.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Active</p>
                  <p className="text-lg font-bold text-brand-energy-orange">{rider.activeOrders}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
