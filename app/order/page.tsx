'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import PricingBreakdown from '@/components/Order/PricingBreakdown';
import { MapPin, Home, Plus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGuestOrder } from '@/lib/store/guestOrder';
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

// Mock saved addresses with coordinates (using Koforidua area coordinates)
const savedAddresses = [
  {
    id: '1',
    label: 'Home',
    address: '123 East Legon Street, Accra',
    location: { lat: 6.0850, lng: -0.2550 }, // Koforidua area coordinates
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    address: '456 Osu Road, Accra',
    location: { lat: 6.0950, lng: -0.2600 }, // Koforidua area coordinates
    isDefault: false,
  },
];

export default function OrderPage() {
  const router = useRouter();
  const guestOrder = useGuestOrder();
  const { order, updateAddress, updateInstructions, isOrderValid } = guestOrder;

  const defaultAddress = savedAddresses.find(a => a.isDefault);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(
    defaultAddress?.id || null
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState(order.deliveryInstructions || '');
  
  // Initialize delivery location if default address exists
  useEffect(() => {
    if (defaultAddress && !order.deliveryLocation) {
      updateAddress(defaultAddress.address, defaultAddress.location);
    }
  }, []); // Run once on mount
  
  // Update instructions when state changes
  useEffect(() => {
    updateInstructions(deliveryInstructions);
  }, [deliveryInstructions, updateInstructions]);

  // Auto-select address if one is already in guest order
  useEffect(() => {
    if (order.deliveryAddress) {
      // Check if address matches any saved address
      const matchingAddress = savedAddresses.find(a => a.address === order.deliveryAddress);
      if (matchingAddress) {
        setSelectedAddress(matchingAddress.id);
        // Update location if not set
        if (!order.deliveryLocation && matchingAddress.location) {
          updateAddress(matchingAddress.address, matchingAddress.location);
        }
      } else {
        // Address is new, it's already saved in guest order, so we can proceed
        // Just ensure it's set
        setSelectedAddress('new'); // Mark as new address
      }
    }
  }, [order.deliveryAddress]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if no station or cylinder selected
  useEffect(() => {
    if (!order.stationId || !order.cylinderSize) {
      router.push('/stations');
    }
  }, [order.stationId, order.cylinderSize, router]);

  // Pricing calculation with actual distance
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

  const handleContinue = () => {
    // If address is already in guest order (from add address page), use it
    if (order.deliveryAddress && !selectedAddress) {
      // Address already saved from add page, just update instructions
      updateInstructions(deliveryInstructions);
      router.push('/checkout');
      return;
    }

    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    // Save address and instructions to guest order
    const address = savedAddresses.find(a => a.id === selectedAddress);
    if (address) {
      updateAddress(address.address, address.location);
    }
    updateInstructions(deliveryInstructions);

    // Navigate to checkout (where auth will be triggered)
    router.push('/checkout');
  };

  if (!order.stationId || !order.cylinderSize) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please select a station and size first</p>
          <PrimaryButton onClick={() => router.push('/stations')}>
            Select Station
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-display-sm font-bold text-gray-900 mb-2">
          Delivery Address
        </h1>
        <p className="text-gray-600">
          Where should we deliver your {order.cylinderName}?
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 bg-status-error/10 border border-status-error/20"
        >
          <div className="flex items-center gap-2 text-status-error">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Saved Addresses */}
      <div className="space-y-3">
        {/* Show newly added address if it exists and doesn't match saved addresses */}
        {order.deliveryAddress && !savedAddresses.find(a => a.address === order.deliveryAddress) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0 }}
          >
            <GlassCard
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                !selectedAddress && order.deliveryAddress
                  ? 'ring-2 ring-brand-deep-blue shadow-lg'
                  : ''
              }`}
              onClick={() => {
                setSelectedAddress(null); // Mark as using new address
                setError(null);
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5
                  ${!selectedAddress && order.deliveryAddress
                    ? 'border-brand-deep-blue bg-brand-deep-blue'
                    : 'border-gray-300'
                  }
                `}>
                  {!selectedAddress && order.deliveryAddress && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">New Address</span>
                    <span className="text-xs bg-brand-safety-green/10 text-brand-safety-green px-2 py-0.5 rounded">
                      Just Added
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {savedAddresses.map((address, index) => (
          <motion.div
            key={address.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                selectedAddress === address.id
                  ? 'ring-2 ring-brand-deep-blue shadow-lg'
                  : ''
              }`}
              onClick={() => {
                setSelectedAddress(address.id);
                setError(null);
                // Update address in guest order immediately with coordinates
                updateAddress(address.address, address.location);
              }}
            >
            <div className="flex items-start gap-3">
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5
                ${selectedAddress === address.id
                  ? 'border-brand-deep-blue bg-brand-deep-blue'
                  : 'border-gray-300'
                }
              `}>
                {selectedAddress === address.id && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {address.label === 'Home' ? (
                    <Home className="w-4 h-4 text-gray-400" />
                  ) : (
                    <MapPin className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="font-semibold text-gray-900">{address.label}</span>
                  {address.isDefault && (
                    <span className="text-xs bg-brand-deep-blue/10 text-brand-deep-blue px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{address.address}</p>
              </div>
            </div>
            </GlassCard>
          </motion.div>
        ))}

        {/* Add New Address */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: savedAddresses.length * 0.1 }}
        >
          <GlassCard 
            className="p-4 cursor-pointer border-2 border-dashed border-gray-300 hover:border-brand-deep-blue hover:bg-brand-deep-blue/5 transition-all"
            onClick={() => router.push('/profile/addresses/add?returnTo=/order')}
          >
            <div className="flex items-center gap-3 text-gray-600">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add New Address</span>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Delivery Instructions */}
      <GlassCard className="p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Delivery Instructions (Optional)
        </label>
        <textarea
          value={deliveryInstructions}
          onChange={(e) => setDeliveryInstructions(e.target.value)}
          placeholder="e.g., Leave at gate, Call when arrived..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent resize-none"
          rows={3}
        />
      </GlassCard>

      {/* Pricing Breakdown */}
      <PricingBreakdown
        gasCost={order.estimatedPrice || 0}
        deliveryFee={deliveryFee}
        safekeeping={safekeeping}
        distance={roundtripDistance}
        isRoundtrip={true}
        baseDeliveryFee={pricingBreakdown.baseDeliveryFee}
        distanceFee={pricingBreakdown.distanceFee}
      />

      {/* Info Message */}
      <GlassCard className="p-4 bg-brand-deep-blue/5 border-brand-deep-blue/10">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">💡 No signup needed yet!</span> You'll create an account or sign in at checkout.
        </p>
      </GlassCard>

      {/* Continue to Checkout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PrimaryButton
          fullWidth
          size="lg"
          onClick={handleContinue}
          disabled={(!selectedAddress && !order.deliveryAddress) || loading}
          loading={loading}
        >
          Continue to Checkout - GH₵{((order.estimatedPrice || 0) + deliveryFee + safekeeping).toFixed(2)}
        </PrimaryButton>
      </motion.div>
    </div>
  );
}

