'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  ArrowLeft, User, Phone, Mail, 
  MapPin, Save, X
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function NewRiderPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Creating rider:', formData);
    router.push('/admin/riders');
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
          <h1 className="text-title-lg font-bold text-gray-900">Add New Rider</h1>
          <p className="text-sm text-gray-500">Register a new delivery rider</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rider Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-brand-deep-blue to-brand-corporate-blue rounded-xl flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-title-md font-bold text-gray-900">Rider Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                  placeholder="e.g., East Legon, Accra"
                  required
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
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
            <span>Create Rider</span>
          </button>
        </motion.div>
      </form>
    </div>
  );
}
