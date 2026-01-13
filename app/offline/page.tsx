'use client';

import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { motion } from 'framer-motion';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check if we're online
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="flex justify-center mb-6"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-brand-deep-blue to-brand-corporate-blue rounded-full flex items-center justify-center">
              <WifiOff className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <h1 className="text-display-sm font-bold text-gray-900 mb-3">
            You&apos;re Offline
          </h1>

          <p className="text-gray-600 mb-6">
            {isOnline
              ? 'We\'re checking your connection...'
              : 'It looks like you\'re not connected to the internet. Please check your connection and try again.'}
          </p>

          {isOnline ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <PrimaryButton
                fullWidth
                onClick={handleRefresh}
                className="mb-4"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Refresh Page</span>
              </PrimaryButton>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Tip:</strong> Some features may still work offline thanks to our service worker!
                </p>
              </div>

              <PrimaryButton
                fullWidth
                onClick={handleRefresh}
                disabled={!isOnline}
                className="mt-4"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </PrimaryButton>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}

