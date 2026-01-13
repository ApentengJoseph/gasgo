'use client';

import { X, MapPin, Flame, Clock, CheckCircle, Star, Truck } from 'lucide-react';
import GlassCard from '@/components/Cards/GlassCard';
import StarRating from '@/components/Rating/StarRating';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    date: string;
    status: string;
    size: string;
    total: number;
    station: string;
    rating?: number;
    deliveryAddress?: string;
    paymentMethod?: string;
    riderName?: string;
    riderPhone?: string;
  };
}

export default function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-4 bottom-4 top-auto z-50 max-h-[85vh] overflow-y-auto"
          >
            <GlassCard className="p-6 bg-white border-2 border-gray-200">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-title-lg font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Order Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="text-lg font-bold text-gray-900">#{order.id}</p>
                  </div>
                  <div className="px-3 py-1.5 bg-brand-deep-blue/10 text-brand-deep-blue rounded-full text-sm font-semibold">
                    {order.status === 'delivered' ? 'Delivered' : 'Active'}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Flame className="w-5 h-5 text-brand-energy-orange" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Gas Type</p>
                      <p className="font-semibold text-gray-900">{order.size} Cylinder</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-brand-deep-blue" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Station</p>
                      <p className="font-semibold text-gray-900">{order.station}</p>
                    </div>
                  </div>

                  {order.deliveryAddress && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-brand-safety-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-brand-safety-green" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Delivery Address</p>
                        <p className="font-semibold text-gray-900">{order.deliveryAddress}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(order.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {order.paymentMethod && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-brand-safety-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-brand-safety-green" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-semibold text-gray-900">{order.paymentMethod}</p>
                      </div>
                    </div>
                  )}

                  {order.riderName && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Truck className="w-5 h-5 text-brand-deep-blue" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Rider</p>
                        <p className="font-semibold text-gray-900">{order.riderName}</p>
                        {order.riderPhone && (
                          <p className="text-sm text-gray-600">{order.riderPhone}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {order.rating && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Your Rating</p>
                        <StarRating rating={order.rating} readonly size="sm" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-gray-900">Total Amount</p>
                    <p className="text-2xl font-bold text-brand-deep-blue">
                      GH₵{order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

