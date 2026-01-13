'use client';

import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import GlassCard from '@/components/Cards/GlassCard';

interface PriceBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasCost: number;
  baseDeliveryFee: number;
  distanceFee: number;
  deliveryFee: number;
  roundtripDistance: number;
  safekeeping: number;
  total: number;
}

export default function PriceBreakdownModal({
  isOpen,
  onClose,
  gasCost,
  baseDeliveryFee,
  distanceFee,
  deliveryFee,
  roundtripDistance,
  safekeeping,
  total,
}: PriceBreakdownModalProps) {
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
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="p-6 bg-white border-2 border-gray-200 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-title-lg font-bold text-gray-900">
                    Price Breakdown
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Breakdown Details */}
                <div className="space-y-4">
                  {/* Gas Cost */}
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <div>
                      <p className="text-gray-900 font-semibold">Gas Cost</p>
                      <p className="text-sm text-gray-500">Station price</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      GH₵{gasCost.toFixed(2)}
                    </p>
                  </div>

                  {/* Delivery Fee Breakdown */}
                  <div className="py-3 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-gray-900 font-semibold">Delivery Fee</p>
                      <p className="text-lg font-bold text-gray-900">
                        GH₵{deliveryFee.toFixed(2)}
                      </p>
                    </div>
                    <div className="pl-4 space-y-2 border-l-2 border-brand-deep-blue/20">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">Base Fee</p>
                        <p className="text-sm font-semibold text-gray-700">
                          GH₵{baseDeliveryFee.toFixed(2)}
                        </p>
                      </div>
                      {roundtripDistance > 0 && (
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">
                            {roundtripDistance.toFixed(1)}km roundtrip × GH₵1.8/km
                          </p>
                          <p className="text-sm font-semibold text-gray-700">
                            GH₵{distanceFee.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Safekeeping */}
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <div>
                      <p className="text-gray-900 font-semibold">Safekeeping</p>
                      <p className="text-sm text-gray-500">Safety & handling</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      GH₵{safekeeping.toFixed(2)}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                    <p className="text-title-md font-bold text-gray-900">Total</p>
                    <p className="text-display-sm font-bold text-brand-deep-blue">
                      GH₵{total.toFixed(2)}
                    </p>
                  </div>

                  {/* Info Note */}
                  <div className="mt-4 p-3 bg-brand-safety-green/10 rounded-lg border border-brand-safety-green/20">
                    <p className="text-sm text-brand-safety-green">
                      ✓ No hidden fees. This is your final price.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

