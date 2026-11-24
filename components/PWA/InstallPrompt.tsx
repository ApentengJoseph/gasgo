'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA] Already installed, skipping prompt');
      return;
    }

    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service Worker not supported');
      return;
    }

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      console.log('[PWA] beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    console.log('[PWA] Listening for beforeinstallprompt event');

    // Also check if we can determine installability
    const checkInstallability = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('[PWA] Service Workers registered:', registrations.length);
        
        // Check manifest
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
          console.log('[PWA] Manifest link found:', manifestLink.getAttribute('href'));
        } else {
          console.warn('[PWA] Manifest link not found');
        }
      } catch (error) {
        console.error('[PWA] Error checking installability:', error);
      }
    };

    // Small delay to ensure service worker is registered
    setTimeout(checkInstallability, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Install GasRefill App
              </h3>
              <p className="text-sm text-gray-600">
                Add to home screen for faster access
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-brand-deep-blue text-white rounded-lg font-medium text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Install
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

