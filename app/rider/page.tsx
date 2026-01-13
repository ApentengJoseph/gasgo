'use client';

import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { Truck, DollarSign, Clock, MapPin } from 'lucide-react';

export default function RiderDashboard() {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-display-sm font-bold text-gray-900 mb-2">
          Rider Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your deliveries and earnings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-brand-deep-blue" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Today&apos;s Earnings</p>
              <p className="text-lg font-bold text-gray-900">GH₵245.50</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-brand-energy-orange" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active Orders</p>
              <p className="text-lg font-bold text-gray-900">3</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Active Orders */}
      <GlassCard className="p-6">
        <h2 className="text-title-md font-bold text-gray-900 mb-4">
          Active Orders
        </h2>
        <div className="space-y-4">
          {/* Mock order */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">Order #GAS12345</h3>
                <p className="text-sm text-gray-600">12kg cylinder</p>
              </div>
              <span className="px-3 py-1 bg-brand-deep-blue/10 text-brand-deep-blue rounded-full text-sm">
                At Station
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4" />
              <span>East Legon, Accra</span>
            </div>
            <div className="flex gap-2">
              <PrimaryButton size="sm" className="flex-1">
                View Details
              </PrimaryButton>
              <PrimaryButton size="sm" variant="energy" className="flex-1">
                Start Delivery
              </PrimaryButton>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <div className="space-y-3">
        <PrimaryButton fullWidth size="lg">
          <Truck className="w-5 h-5" />
          Accept New Orders
        </PrimaryButton>
        <PrimaryButton fullWidth variant="secondary">
          <Clock className="w-5 h-5" />
          View Earnings History
        </PrimaryButton>
      </div>
    </div>
  );
}

