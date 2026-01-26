'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  ArrowLeft, Globe, CheckCircle, 
  XCircle, Save, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock integrations
const mockIntegrations = [
  {
    id: 'google-maps',
    name: 'Google Maps',
    description: 'Location services and mapping',
    enabled: true,
    status: 'connected' as const,
  },
  {
    id: 'payment-gateway',
    name: 'Payment Gateway',
    description: 'Process payments securely',
    enabled: true,
    status: 'connected' as const,
  },
  {
    id: 'sms-service',
    name: 'SMS Service',
    description: 'Send SMS notifications',
    enabled: false,
    status: 'disconnected' as const,
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Track and analyze data',
    enabled: false,
    status: 'disconnected' as const,
  },
];

export default function IntegrationsSettingsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState(mockIntegrations);

  const handleToggle = (id: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === id
          ? { ...integration, enabled: !integration.enabled }
          : integration
      )
    );
  };

  const handleSave = () => {
    // Handle save
    console.log('Saving integrations:', integrations);
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
          <h1 className="text-title-lg font-bold text-gray-900">Integrations</h1>
          <p className="text-sm text-gray-500">Manage third-party service integrations</p>
        </div>
      </motion.div>

      {/* Integrations List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-3"
      >
        {integrations.map((integration, index) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue/10 to-brand-deep-blue/5 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-brand-deep-blue" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                      {integration.status === 'connected' ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-safety-green/10 rounded-lg">
                          <CheckCircle className="w-3 h-3 text-brand-safety-green" />
                          <span className="text-xs font-semibold text-brand-safety-green">Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-lg">
                          <XCircle className="w-3 h-3 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-400">Disconnected</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(integration.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      integration.enabled ? 'bg-brand-deep-blue' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        integration.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  {integration.status === 'connected' && (
                    <button className="p-2 text-brand-deep-blue hover:bg-brand-deep-blue/10 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
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
