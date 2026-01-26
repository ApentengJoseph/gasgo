'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  ArrowLeft, User, Mail, Phone, 
  MapPin, Save, Camera
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileSettingsPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+233 XX XXX XXXX',
    location: 'Accra, Ghana',
    bio: 'System Administrator',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle save
    console.log('Saving profile:', formData);
    router.back();
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
          <h1 className="text-title-lg font-bold text-gray-900">Profile Settings</h1>
          <p className="text-sm text-gray-500">Update your admin profile information</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue/10 to-brand-deep-blue/5 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-brand-deep-blue" />
              </div>
              <h2 className="text-title-md font-bold text-gray-900">Profile Picture</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-deep-blue to-brand-corporate-blue rounded-2xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">AU</span>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Change Photo</span>
              </button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue/10 to-brand-deep-blue/5 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-brand-deep-blue" />
              </div>
              <h2 className="text-title-md font-bold text-gray-900">Personal Information</h2>
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
                <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent resize-none"
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <button
            type="submit"
            className="w-full px-6 py-4 bg-brand-deep-blue text-white hover:bg-brand-corporate-blue active:bg-brand-deep-blue/90 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
        </motion.div>
      </form>
    </div>
  );
}
