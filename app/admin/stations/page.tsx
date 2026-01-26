'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  Truck, ArrowLeft, Search, 
  MapPin, Phone, Flame, 
  Package, TrendingUp, Plus, Edit
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock stations data
const stations = [
  {
    id: '1',
    name: 'GasPro Station',
    address: 'East Legon, Accra',
    phone: '+233 XX XXX XXXX',
    status: 'active' as const,
    inventory: {
      '6kg': 45,
      '12kg': 32,
      '25kg': 18,
    },
    totalOrders: 1247,
    revenue: 185450.75,
  },
  {
    id: '2',
    name: 'SafeGas Depot',
    address: 'Dansoman, Accra',
    phone: '+233 XX XXX XXXX',
    status: 'active' as const,
    inventory: {
      '6kg': 28,
      '12kg': 41,
      '25kg': 22,
    },
    totalOrders: 892,
    revenue: 132678.50,
  },
  {
    id: '3',
    name: 'Energy Plus',
    address: 'Tema, Accra',
    phone: '+233 XX XXX XXXX',
    status: 'active' as const,
    inventory: {
      '6kg': 52,
      '12kg': 38,
      '25kg': 15,
    },
    totalOrders: 1567,
    revenue: 234567.25,
  },
];

export default function AdminStationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: stations.length,
    totalInventory: stations.reduce((sum, s) => 
      sum + Object.values(s.inventory).reduce((a, b) => a + b, 0), 0
    ),
    totalRevenue: stations.reduce((sum, s) => sum + s.revenue, 0),
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
            <h1 className="text-title-lg font-bold text-gray-900">Manage Stations</h1>
            <p className="text-sm text-gray-500">View and manage gas stations</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/admin/stations/new')}
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
              <Truck className="w-5 h-5 text-brand-deep-blue" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Total Stations</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-brand-safety-green/10 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-brand-safety-green" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">Total Inventory</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalInventory}</p>
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
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Stations List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-3"
      >
        {filteredStations.map((station, index) => (
          <motion.div
            key={station.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
          >
            <GlassCard 
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/admin/stations/${station.id}`)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-energy-orange to-brand-energy-orange/70 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{station.name}</h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{station.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{station.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4 pt-4 border-t border-gray-200">
                {Object.entries(station.inventory).map(([size, count]) => (
                  <div key={size} className="text-center">
                    <p className="text-xs text-gray-500 mb-1">{size}</p>
                    <p className="text-lg font-bold text-gray-900">{count}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="text-lg font-bold text-brand-safety-green">
                    GH₵{station.revenue.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/stations/${station.id}/edit`);
                  }}
                  className="px-4 py-2 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg text-sm flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden xs:inline">Edit</span>
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
