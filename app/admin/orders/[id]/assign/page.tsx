'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  ArrowLeft, UserCheck, Search, 
  CheckCircle, Phone, MapPin, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock riders data - replace with API call
const availableRiders = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+233 XX XXX XXXX',
    location: 'East Legon, Accra',
    rating: 4.8,
    activeOrders: 1,
    status: 'online' as const,
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+233 XX XXX XXXX',
    location: 'Dansoman, Accra',
    rating: 4.9,
    activeOrders: 0,
    status: 'online' as const,
  },
  {
    id: '3',
    name: 'Kwame Asante',
    phone: '+233 XX XXX XXXX',
    location: 'Tema, Accra',
    rating: 4.7,
    activeOrders: 2,
    status: 'online' as const,
  },
];

// Mock order data - replace with API call
const mockOrder = {
  id: 'GAS12347',
  customerName: 'Kojo Asante',
  location: 'Tema, Accra',
  station: 'Energy Plus',
  size: '25kg',
  amount: 245.00,
};

export default function AssignRiderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRider, setSelectedRider] = useState<string | null>(null);

  const filteredRiders = availableRiders.filter(rider =>
    rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rider.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = () => {
    if (selectedRider) {
      // Handle assignment
      console.log('Assigning rider:', selectedRider, 'to order:', orderId);
      router.push('/admin/orders');
    }
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
          <h1 className="text-title-lg font-bold text-gray-900">Assign Rider</h1>
          <p className="text-sm text-gray-500">Select a rider for this order</p>
        </div>
      </motion.div>

      {/* Order Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <h2 className="text-title-md font-bold text-gray-900 mb-4">Order Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Order ID</p>
              <p className="font-semibold text-gray-900">#{mockOrder.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Customer</p>
              <p className="font-semibold text-gray-900">{mockOrder.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="font-semibold text-gray-900">{mockOrder.location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Size</p>
              <p className="font-semibold text-gray-900">{mockOrder.size}</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search riders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Available Riders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h2 className="text-title-md font-bold text-gray-900 mb-4">Available Riders</h2>
        <div className="space-y-3">
          {filteredRiders.map((rider, index) => (
            <motion.div
              key={rider.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <GlassCard 
                className={`p-4 cursor-pointer transition-all ${
                  selectedRider === rider.id 
                    ? 'ring-2 ring-brand-deep-blue bg-brand-deep-blue/5' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedRider(rider.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue to-brand-corporate-blue rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {rider.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      rider.status === 'online' ? 'bg-brand-safety-green' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{rider.name}</h3>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-energy-orange/10 rounded-lg">
                        <Award className="w-3 h-3 text-brand-energy-orange" />
                        <span className="text-xs font-semibold text-brand-energy-orange">{rider.rating}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="truncate">{rider.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{rider.location}</span>
                      </div>
                    </div>
                  </div>
                  {selectedRider === rider.id && (
                    <div className="w-6 h-6 bg-brand-deep-blue rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      {selectedRider && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex gap-3"
        >
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="flex-1 px-6 py-4 bg-brand-deep-blue text-white hover:bg-brand-corporate-blue active:bg-brand-deep-blue/90 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <UserCheck className="w-5 h-5" />
            <span>Assign Rider</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
