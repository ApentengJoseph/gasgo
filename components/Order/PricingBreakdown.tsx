'use client';

import { useState } from 'react';
import GlassCard from '@/components/Cards/GlassCard';
import { Info } from 'lucide-react';
import PriceBreakdownModal from '@/components/Modals/PriceBreakdownModal';

interface PricingBreakdownProps {
  gasCost: number;
  deliveryFee: number;
  safekeeping: number;
  distance?: number;
  isRoundtrip?: boolean;
  baseDeliveryFee?: number;
  distanceFee?: number;
}

export default function PricingBreakdown({
  gasCost,
  deliveryFee,
  safekeeping,
  distance,
  isRoundtrip = false,
  baseDeliveryFee = 10,
  distanceFee = 0,
}: PricingBreakdownProps) {
  const subtotal = gasCost + deliveryFee + safekeeping;
  const total = subtotal;
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-title-md font-bold text-gray-900">
            Price Breakdown
          </h3>
          <button
            onClick={() => setShowModal(true)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Info className="w-5 h-5 text-gray-400 hover:text-brand-deep-blue transition-colors" />
          </button>
        </div>

      <div className="space-y-3">
        {/* Gas Cost */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-900 font-medium">Gas Cost</p>
            <p className="text-sm text-gray-500">Station price</p>
          </div>
          <p className="text-lg font-semibold text-gray-900">GH₵{gasCost.toFixed(2)}</p>
        </div>

        {/* Delivery Fee */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-900 font-medium">Delivery Fee</p>
          </div>
          <p className="text-lg font-semibold text-gray-900">GH₵{deliveryFee.toFixed(2)}</p>
        </div>

        {/* Safekeeping */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-900 font-medium">Safekeeping</p>
            <p className="text-sm text-gray-500">Safety & handling</p>
          </div>
          <p className="text-lg font-semibold text-gray-900">GH₵{safekeeping.toFixed(2)}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-3" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <p className="text-title-md font-bold text-gray-900">Total</p>
          <p className="text-display-sm font-bold text-brand-deep-blue">
            GH₵{total.toFixed(2)}
          </p>
        </div>

        {/* Transparency Note */}
        <div className="mt-4 p-3 bg-brand-safety-green/10 rounded-lg">
          <p className="text-sm text-brand-safety-green">
            ✓ No hidden fees. This is your final price.
          </p>
        </div>
      </div>
    </GlassCard>

    {/* Price Breakdown Modal */}
    <PriceBreakdownModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      gasCost={gasCost}
      baseDeliveryFee={baseDeliveryFee}
      distanceFee={distanceFee || (distance ? distance * 1.8 : 0)}
      deliveryFee={deliveryFee}
      roundtripDistance={distance || 0}
      safekeeping={safekeeping}
      total={total}
    />
    </>
  );
}

