'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import PricingBreakdown from '@/components/Order/PricingBreakdown';
import ContextualAuthModal from '@/components/Auth/ContextualAuthModal';
import { useGuestOrder } from '@/lib/store/guestOrder';
import { CheckCircle, MapPin, Flame, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import PaymentMethodModal from '@/components/Payment/PaymentMethodModal';
import { calculateTotalPrice } from '@/lib/utils/pricing';
import { calculateDistance } from '@/lib/utils/pricing';

// Station coordinates data - should match stations page
const STATIONS_DATA = [
  { id: '1', latitude: 6.098813, longitude: -0.27765 },
  { id: '2', latitude: 6.109447, longitude: -0.292065 },
  { id: '3', latitude: 6.1076519, longitude: -0.2799717 },
  { id: '4', latitude: 6.105526, longitude: -0.277021 },
  { id: '5', latitude: 6.117014, longitude: -0.251796 },
  { id: '6', latitude: 6.11364, longitude: -0.249552 },
  { id: '7', latitude: 6.104499, longitude: -0.250154 },
  { id: '8', latitude: 6.0754564, longitude: -0.2499899 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const guestOrder = useGuestOrder();
  const { order, isOrderValid } = guestOrder;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if user is authenticated (client-side only)
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isLoggedIn');
      setIsAuthenticated(authStatus === 'true');
    }
  }, []);

  // Listen for auth changes (when modal closes after successful auth)
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const authStatus = localStorage.getItem('isLoggedIn');
        setIsAuthenticated(authStatus === 'true');
      }
    };

    // Check auth periodically (when modal might have updated it)
    const interval = setInterval(checkAuth, 500);
    return () => clearInterval(interval);
  }, [showAuthModal]);

  // Redirect if order is not valid (client-side only)
  useEffect(() => {
    if (mounted && !isOrderValid()) {
      router.push('/stations');
    }
  }, [mounted, isOrderValid, router]);

  // Calculate pricing with actual distance
  const gasCost = order.estimatedPrice || 0;
  const safekeeping = 5;
  
  // Calculate distance from station to delivery location (roundtrip)
  let roundtripDistance = 0;
  if (order.stationId && order.deliveryLocation) {
    const station = STATIONS_DATA.find(s => s.id === order.stationId);
    if (station) {
      const oneWayDistance = calculateDistance(
        station.latitude,
        station.longitude,
        order.deliveryLocation.lat,
        order.deliveryLocation.lng
      );
      roundtripDistance = oneWayDistance * 2; // Roundtrip distance
    }
  }
  
  // Calculate pricing using roundtrip distance (base fee 10, rate 1.8/km)
  const pricingBreakdown = calculateTotalPrice(gasCost, roundtripDistance);
  const deliveryFee = pricingBreakdown.deliveryFee;
  const total = pricingBreakdown.total;

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const handlePlaceOrder = () => {
    // Check if already authenticated
    if (isAuthenticated) {
      // Show payment method selection modal
      setShowPaymentModal(true);
    } else {
      // Show auth modal
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    // After auth, update state and close modal
    setIsAuthenticated(true);
    setShowAuthModal(false);
    // Refresh auth status from localStorage
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isLoggedIn');
      setIsAuthenticated(authStatus === 'true');
    }
    // Show payment modal after successful auth
    setTimeout(() => {
      setShowPaymentModal(true);
    }, 300);
  };

  const handlePaymentSuccess = (method: string, reference?: string) => {
    setShowPaymentModal(false);
    // TODO: Save order to backend with payment method
    // For now, just navigate to orders page
    router.push('/orders');
  };

  const generateOrderId = () => {
    return `GAS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  if (!mounted || !isOrderValid()) {
    return null; // Will redirect or still loading
  }

  return (
    <div className="space-y-6 py-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-safety-green flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">Review Order</span>
        </div>
        <div className="flex-1 h-1 bg-gray-200 mx-4">
          <div className={`h-full bg-brand-deep-blue ${isAuthenticated ? 'w-full' : 'w-4/5'}`} />
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAuthenticated ? 'bg-brand-safety-green' : 'bg-brand-deep-blue'}`}>
          {isAuthenticated ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : (
            <span className="text-white text-sm font-bold">2</span>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {isAuthenticated ? 'Pay' : 'Sign In & Pay'}
        </span>
      </div>

      {/* Order Summary */}
      <GlassCard className="p-6">
        <h2 className="text-title-md font-bold text-gray-900 mb-4">Order Summary</h2>
        
        <div className="space-y-4">
          {/* Station */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Station</p>
              <p className="font-semibold text-gray-900">{order.stationName}</p>
            </div>
          </div>

          {/* Cylinder */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-brand-energy-orange" />
              <div>
                <p className="text-sm text-gray-600">Cylinder</p>
                <p className="font-semibold text-gray-900">{order.cylinderName}</p>
              </div>
            </div>
            <p className="font-bold text-brand-deep-blue">GH₵{gasCost.toFixed(2)}</p>
          </div>

          {/* Delivery Address */}
          <div className="flex items-start justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Delivery Address</p>
                <p className="font-semibold text-gray-900">{order.deliveryAddress}</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          {order.deliveryInstructions && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Delivery Instructions</p>
              <p className="text-sm text-gray-900">{order.deliveryInstructions}</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Pricing Breakdown */}
      <PricingBreakdown
        gasCost={gasCost}
        deliveryFee={deliveryFee}
        safekeeping={safekeeping}
        distance={roundtripDistance}
        isRoundtrip={true}
        baseDeliveryFee={pricingBreakdown.baseDeliveryFee}
        distanceFee={pricingBreakdown.distanceFee}
      />

      {/* Total */}
      <GlassCard className="p-6 bg-gradient-to-br from-brand-deep-blue/5 to-brand-corporate-blue/5 border-brand-deep-blue/20">
        <div className="flex items-center justify-between">
          <span className="text-title-md font-bold text-gray-900">Total</span>
          <span className="text-display-sm font-bold text-brand-deep-blue">
            GH₵{total.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Price locked for 24 hours
        </p>
      </GlassCard>

      {/* Place Order Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-4"
      >
        <PrimaryButton
          fullWidth
          size="lg"
          onClick={handlePlaceOrder}
          loading={loading}
          className="shadow-xl"
        >
          <span>{isAuthenticated ? 'Place Order' : 'Sign In & Place Order'}</span>
        </PrimaryButton>
        
        {!isAuthenticated && (
          <p className="text-xs text-center text-gray-500 mt-3">
            Your order is saved! Sign in to complete payment.
          </p>
        )}
      </motion.div>

      {/* Auth Modal */}
      {showAuthModal && (
        <ContextualAuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          context={`To place your order for ${order.cylinderName} at ${order.stationName}`}
          orderSummary={{
            total,
            items: order.cylinderName || '',
          }}
        />
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          total={total}
          orderId={generateOrderId()}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

