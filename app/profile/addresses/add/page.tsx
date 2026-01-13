'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import AddressAutocomplete from '@/components/Address/AddressAutocomplete';
import ServiceAreaModal from '@/components/Address/ServiceAreaModal';
import { ArrowLeft, Home, Briefcase, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useGuestOrder } from '@/lib/store/guestOrder';

export default function AddAddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/order';
  const guestOrder = useGuestOrder();
  const { updateAddress } = guestOrder;
  
  const [addressType, setAddressType] = useState<'home' | 'office' | 'other'>('home');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showServiceAreaModal, setShowServiceAreaModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!address.trim()) {
      setError('Please enter a delivery address');
      return;
    }

    setLoading(true);

    try {
      // Save address and location to guest order
      updateAddress(address, location);
      
      // TODO: Save address to backend/localStorage for future use
      // For now, just simulate save
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Return to order page or specified return path
      router.push(returnTo);
    } catch (err) {
      setError('Failed to save address. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/order" className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-display-sm font-bold text-gray-900">Add New Address</h1>
          <p className="text-gray-600">Enter your delivery address</p>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-status-error/10 border border-status-error/20 rounded-xl"
        >
          <p className="text-sm text-status-error">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Address Type */}
        <GlassCard className="p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Address Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                setAddressType('home');
                setLabel('Home');
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                addressType === 'home'
                  ? 'border-brand-deep-blue bg-brand-deep-blue/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Home className={`w-6 h-6 mx-auto mb-2 ${
                addressType === 'home' ? 'text-brand-deep-blue' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                addressType === 'home' ? 'text-brand-deep-blue' : 'text-gray-600'
              }`}>
                Home
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAddressType('office');
                setLabel('Office');
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                addressType === 'office'
                  ? 'border-brand-deep-blue bg-brand-deep-blue/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Briefcase className={`w-6 h-6 mx-auto mb-2 ${
                addressType === 'office' ? 'text-brand-deep-blue' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                addressType === 'office' ? 'text-brand-deep-blue' : 'text-gray-600'
              }`}>
                Office
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAddressType('other');
                setLabel('');
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                addressType === 'other'
                  ? 'border-brand-deep-blue bg-brand-deep-blue/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MapPin className={`w-6 h-6 mx-auto mb-2 ${
                addressType === 'other' ? 'text-brand-deep-blue' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                addressType === 'other' ? 'text-brand-deep-blue' : 'text-gray-600'
              }`}>
                Other
              </span>
            </button>
          </div>
        </GlassCard>

        {/* Custom Label for Other */}
        {addressType === 'other' && (
          <GlassCard className="p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Label (e.g., &quot;Mom&apos;s House&quot;, &quot;Friend&apos;s Place&quot;)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter label"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
            />
          </GlassCard>
        )}

        {/* Address Input with Google Autocomplete */}
        <GlassCard className="p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Delivery Address
          </label>
          <AddressAutocomplete
            value={address}
            onChange={(addr, loc) => {
              setAddress(addr);
              if (loc) {
                setLocation(loc);
              }
            }}
            placeholder="Start typing your address in Koforidua..."
            error={error || undefined}
            showCurrentLocation={true}
          />
          {location && (
            <p className="text-xs text-gray-500 mt-2">
              📍 Location saved: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          )}
        </GlassCard>

        {/* Save Button */}
        <PrimaryButton
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          disabled={!address.trim()}
        >
          <MapPin className="w-5 h-5" />
          <span>Save Address</span>
        </PrimaryButton>
      </form>
    </div>
  );
}

