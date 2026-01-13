'use client';

import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { BarChart3, Users, Truck, Package, Settings } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-display-sm font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage operations and monitor performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-brand-deep-blue" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Today's Orders</p>
              <p className="text-xl font-bold text-gray-900">47</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-energy-orange/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-brand-energy-orange" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Revenue</p>
              <p className="text-xl font-bold text-gray-900">GH₵9,245</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-safety-green/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-brand-safety-green" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active Riders</p>
              <p className="text-xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <PrimaryButton fullWidth size="lg" variant="secondary">
          <Package className="w-5 h-5" />
          Manage Orders
        </PrimaryButton>
        <PrimaryButton fullWidth size="lg" variant="secondary">
          <Users className="w-5 h-5" />
          Manage Riders
        </PrimaryButton>
        <PrimaryButton fullWidth size="lg" variant="secondary">
          <Truck className="w-5 h-5" />
          Manage Stations
        </PrimaryButton>
        <PrimaryButton fullWidth size="lg" variant="secondary">
          <BarChart3 className="w-5 h-5" />
          View Analytics
        </PrimaryButton>
        <PrimaryButton fullWidth size="lg" variant="secondary">
          <Settings className="w-5 h-5" />
          Settings
        </PrimaryButton>
      </div>
    </div>
  );
}

