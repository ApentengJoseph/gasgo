'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  ArrowLeft, Flame, MapPin, Phone, 
  Package, Save, X
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock station data - replace with API call
const mockStation = {
  id: '2',
  name: 'SafeGas Depot',
  address: 'Dansoman, Accra',
  phone: '+233 XX XXX XXXX',
  status: 'active' as const,
  inventory: {
    '6kg': 28,
    '12kg': 41,
    '25kg': 22,
  },
  pricing: {
    '6kg': 85.00,
    '12kg': 145.00,
    '25kg': 245.00,
  },
};

export default function EditStationPage() {
  const router = useRouter();
  const params = useParams();
  const stationId = params?.id as string;

  const [station, setStation] = useState(mockStation);
  const [formData, setFormData] = useState({
    name: station.name,
    address: station.address,
    phone: station.phone,
    inventory: { ...station.inventory },
    pricing: { ...station.pricing },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Updating station:', formData);
    router.back();
  };

  const handleInventoryChange = (size: string, value: string) => {
    setFormData({
      ...formData,
      inventory: {
        ...formData.inventory,
        [size]: parseInt(value) || 0,
      },
    });
  };

  const handlePricingChange = (size: string, value: string) => {
    setFormData({
      ...formData,
      pricing: {
        ...formData.pricing,
        [size]: parseFloat(value) || 0,
      },
    });
  };

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
          <h1 className="text-title-lg font-bold text-gray-900">Edit Station</h1>
          <p className="text-sm text-gray-500">Update station information and inventory</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
        {/* Station Info */}
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
              <h2 className="text-title-md font-bold text-gray-900">Station Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Station Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                  required
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Inventory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-brand-safety-green/10 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-brand-safety-green" />
              </div>
              <h2 className="text-title-md font-bold text-gray-900">Inventory</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(formData.inventory).map(([size, count]) => (
                <div key={size} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">{size} Cylinder</p>
                    <p className="text-sm text-gray-500">Current stock: {count} units</p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={count}
                    onChange={(e) => handleInventoryChange(size, e.target.value)}
                    className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent text-center font-semibold"
                  />
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-brand-energy-orange" />
              </div>
              <h2 className="text-title-md font-bold text-gray-900">Pricing</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(formData.pricing).map(([size, price]) => (
                <div key={size} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">{size} Cylinder</p>
                    <p className="text-sm text-gray-500">Current price: GH₵{price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">GH₵</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => handlePricingChange(size, e.target.value)}
                      className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent text-center font-semibold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex gap-3"
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-4 bg-brand-deep-blue text-white hover:bg-brand-corporate-blue active:bg-brand-deep-blue/90 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
        </motion.div>
        </div>
      </form>
    </div>
  );
}
