'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import StatusBadge from '@/components/Badges/StatusBadge';
import { 
  ArrowLeft, Flame, MapPin, Phone, 
  User, Truck, DollarSign, Clock,
  Calendar, Package
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock order data - replace with API call
const mockOrder = {
  id: 'GAS12347',
  status: 'pending' as const,
  customerName: 'Kojo Asante',
  customerPhone: '+233 XX XXX XXXX',
  customerLocation: 'Tema, Accra',
  stationName: 'Energy Plus',
  stationAddress: '123 Main Street, Tema',
  size: '25kg',
  amount: 245.00,
  rider: null,
  createdAt: '2024-01-16T09:30:00',
  deliveryInstructions: 'Call when you arrive',
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [order] = useState(mockOrder);

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
          <h1 className="text-title-lg font-bold text-gray-900">Order Details</h1>
          <p className="text-sm text-gray-500">View order information</p>
        </div>
        <StatusBadge status={order.status} />
      </motion.div>

      {/* Order Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-energy-orange to-brand-energy-orange/70 rounded-xl flex items-center justify-center">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-title-md font-bold text-gray-900">Order #{order.id}</h2>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-brand-energy-orange" />
                <div>
                  <p className="text-xs text-gray-500">Cylinder Size</p>
                  <p className="font-semibold text-gray-900">{order.size}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-lg font-bold text-brand-safety-green">GH₵{order.amount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Customer Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue/10 to-brand-deep-blue/5 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-brand-deep-blue" />
            </div>
            <h2 className="text-title-md font-bold text-gray-900">Customer</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Name</p>
              <p className="font-semibold text-gray-900">{order.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Phone</p>
              <a href={`tel:${order.customerPhone}`} className="font-semibold text-brand-deep-blue hover:underline">
                {order.customerPhone}
              </a>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Delivery Address</p>
              <p className="font-semibold text-gray-900">{order.customerLocation}</p>
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
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-energy-orange/10 to-brand-energy-orange/5 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-brand-energy-orange" />
            </div>
            <h2 className="text-title-md font-bold text-gray-900">Station</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Station Name</p>
              <p className="font-semibold text-gray-900">{order.stationName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Address</p>
              <p className="font-semibold text-gray-900">{order.stationAddress}</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Rider Info */}
      {order.rider ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-safety-green/10 to-brand-safety-green/5 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-brand-safety-green" />
              </div>
              <h2 className="text-title-md font-bold text-gray-900">Assigned Rider</h2>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{order.rider}</p>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <button
            onClick={() => router.push(`/admin/orders/${order.id}/assign`)}
            className="w-full px-6 py-4 bg-brand-deep-blue text-white hover:bg-brand-corporate-blue active:bg-brand-deep-blue/90 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            <span>Assign Rider</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
