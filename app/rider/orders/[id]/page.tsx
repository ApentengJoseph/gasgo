'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import StatusBadge from '@/components/Badges/StatusBadge';
import { ArrowLeft, MapPin, Phone, Clock, Flame, User, DollarSign, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock order data - replace with API call
const mockOrder = {
  id: 'GAS12345',
  status: 'at_station' as const,
  size: '12kg',
  customerName: 'Kwame Mensah',
  customerPhone: '+233 XX XXX XXXX',
  customerLocation: 'East Legon, Accra',
  stationName: 'GasPro Station',
  stationAddress: '123 Main Street, Koforidua',
  earnings: 45.50,
  createdAt: '2024-01-16T10:30:00',
  deliveryInstructions: 'Leave at gate, call when you arrive',
};

export default function RiderOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [order] = useState(mockOrder); // Replace with API call

  const getStatusAction = (status: string) => {
    switch (status) {
      case 'assigned':
        return { label: 'Start Journey to Station', variant: 'energy' as const, action: () => {} };
      case 'at_station':
        return { label: 'Collect Cylinder', variant: 'energy' as const, action: () => {} };
      case 'collected':
        return { label: 'Start Delivery', variant: 'energy' as const, action: () => {} };
      case 'on_the_way':
        return { label: 'View Route', variant: 'secondary' as const, action: () => {} };
      case 'arriving_soon':
        return { label: 'Mark as Arrived', variant: 'energy' as const, action: () => {} };
      default:
        return { label: 'View Details', variant: 'secondary' as const, action: () => {} };
    }
  };

  const action = getStatusAction(order.status);

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
        <div className="flex-1">
          <h1 className="text-display-sm font-bold text-gray-900">Order Details</h1>
          <p className="text-sm text-gray-500">#{orderId}</p>
        </div>
        <StatusBadge status={order.status} />
      </motion.div>

      {/* Order Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-6 bg-gradient-to-br from-brand-deep-blue/5 via-white to-brand-energy-orange/5 border-brand-deep-blue/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-energy-orange to-brand-energy-orange/70 rounded-xl flex items-center justify-center shadow-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-title-md font-bold text-gray-900">{order.size} Cylinder</h2>
              <p className="text-sm text-gray-600">{order.stationName}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Earnings</span>
              <span className="text-xl font-bold text-brand-safety-green">GH₵{order.earnings.toFixed(2)}</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Customer Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-brand-deep-blue" />
            </div>
            <h2 className="text-title-md font-bold text-gray-900">Customer</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{order.customerPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{order.customerLocation}</span>
            </div>
            {order.deliveryInstructions && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Delivery Instructions</p>
                <p className="text-sm text-gray-700">{order.deliveryInstructions}</p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Station Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-brand-energy-orange" />
            </div>
            <h2 className="text-title-md font-bold text-gray-900">Station</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{order.stationName}</p>
              <p className="text-sm text-gray-600 mt-1">{order.stationAddress}</p>
            </div>
            <PrimaryButton variant="secondary" size="sm" className="w-full">
              <Navigation className="w-4 h-4" />
              Navigate to Station
            </PrimaryButton>
          </div>
        </GlassCard>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <PrimaryButton
          fullWidth
          size="lg"
          variant={action.variant}
          onClick={action.action}
        >
          {action.label}
        </PrimaryButton>
        <PrimaryButton
          fullWidth
          variant="secondary"
          onClick={() => {
            window.location.href = `tel:${order.customerPhone}`;
          }}
        >
          <Phone className="w-5 h-5" />
          Call Customer
        </PrimaryButton>
      </motion.div>
    </div>
  );
}
