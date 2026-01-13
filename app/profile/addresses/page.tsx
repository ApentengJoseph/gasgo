'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { ArrowLeft, Home, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const savedAddresses = [
  {
    id: '1',
    label: 'Home',
    address: '123 East Legon Street, Accra',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    address: '456 Osu Road, Accra',
    isDefault: false,
  },
];

export default function AddressesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-display-sm font-bold text-gray-900">
          Saved Addresses
        </h1>
      </div>

      {/* Address List */}
      <div className="space-y-3">
        {savedAddresses.map((address, index) => (
          <motion.div
            key={address.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {address.label === 'Home' ? (
                    <Home className="w-5 h-5 text-brand-deep-blue" />
                  ) : (
                    <MapPin className="w-5 h-5 text-brand-deep-blue" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{address.label}</span>
                    {address.isDefault && (
                      <span className="text-xs bg-brand-deep-blue/10 text-brand-deep-blue px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{address.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => router.push(`/profile/addresses/edit?id=${address.id}`)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Edit address"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${address.label}"?`)) {
                        // TODO: Delete address from backend
                        console.log('Delete address:', address.id);
                        // For now, just show a message
                        alert('Address deleted (this is a demo)');
                      }
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete address"
                  >
                    <Trash2 className="w-4 h-4 text-status-error" />
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Add New Address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: savedAddresses.length * 0.1 }}
      >
        <GlassCard 
          className="p-4 cursor-pointer border-2 border-dashed border-gray-300 hover:border-brand-deep-blue hover:bg-brand-deep-blue/5 transition-all"
          onClick={() => router.push('/profile/addresses/add')}
        >
          <div className="flex items-center gap-3 text-gray-600">
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add New Address</span>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

