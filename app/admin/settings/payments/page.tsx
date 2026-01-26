'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  ArrowLeft, CreditCard, Plus, 
  Trash2, Save, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock payment methods
const mockPaymentMethods = [
  {
    id: '1',
    type: 'Mobile Money',
    provider: 'MTN',
    account: '0244 XXX XXXX',
    isDefault: true,
  },
  {
    id: '2',
    type: 'Bank Account',
    provider: 'GCB Bank',
    account: 'XXXX XXXX 1234',
    isDefault: false,
  },
];

export default function PaymentSettingsPage() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const handleSave = () => {
    // Handle save
    console.log('Saving payment methods:', paymentMethods);
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
          <h1 className="text-title-lg font-bold text-gray-900">Payment Settings</h1>
          <p className="text-sm text-gray-500">Manage payment methods and preferences</p>
        </div>
      </motion.div>

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue/10 to-brand-deep-blue/5 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-brand-deep-blue" />
              </div>
              <h2 className="text-title-md font-bold text-gray-900">Payment Methods</h2>
            </div>
            <button
              onClick={() => router.push('/admin/settings/payments/add')}
              className="px-4 py-2 bg-brand-deep-blue text-white hover:bg-brand-corporate-blue active:bg-brand-deep-blue/90 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Add Method</span>
            </button>
          </div>
          <div className="space-y-3">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{method.type}</p>
                      {method.isDefault && (
                        <span className="px-2 py-0.5 bg-brand-safety-green/10 text-brand-safety-green rounded-lg text-xs font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{method.provider}</p>
                    <p className="text-sm text-gray-500">{method.account}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="px-3 py-2 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg text-sm"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <button
          onClick={handleSave}
          className="w-full px-6 py-4 bg-brand-deep-blue text-white hover:bg-brand-corporate-blue active:bg-brand-deep-blue/90 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>Save Changes</span>
        </button>
      </motion.div>
    </div>
  );
}
