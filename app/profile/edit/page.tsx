'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { ArrowLeft, User, Phone, Mail, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('Kwame Apenten');
  const [phone, setPhone] = useState('+233 XX XXX XXXX');
  const [email, setEmail] = useState('kwame@example.com');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // TODO: Save profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push('/profile');
  };

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
          Edit Profile
        </h1>
      </div>

      <GlassCard className="p-6">
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-brand-deep-blue to-brand-energy-orange rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-3xl font-bold">KA</span>
            </div>
            <button className="text-sm text-brand-deep-blue font-medium">
              Change Photo
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <PrimaryButton
            fullWidth
            size="lg"
            onClick={handleSave}
            loading={loading}
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </PrimaryButton>
        </div>
      </GlassCard>
    </div>
  );
}

