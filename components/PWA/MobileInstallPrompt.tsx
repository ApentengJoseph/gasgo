'use client';

import { useState, useEffect } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // For Android Chrome - listen for beforeinstallprompt
    if (isAndroidDevice && 'serviceWorker' in navigator) {
      const handler = (e: Event) => {
        console.log('[PWA] beforeinstallprompt event fired');
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handler);
      console.log('[PWA] Listening for beforeinstallprompt event (Android)');

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    // For iOS Safari - show manual instructions after a delay
    if (isIOSDevice) {
      // Check if user has dismissed before (stored in localStorage)
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        // Only show again after 24 hours
        if (Date.now() - dismissedTime < oneDayAgo) {
          return;
        }
      }

      // Show prompt after user has been on site for a bit
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstall = async () => {
    if (isAndroid && deferredPrompt) {
      // Android Chrome - use native prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS Safari - instructions are already shown in the prompt
      setShowPrompt(false);
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <div 
          className="p-4 flex flex-col gap-3 shadow-2xl border-2 border-brand-deep-blue/20 rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.2)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 text-base sm:text-lg">
                Install GasRefill App
              </h3>
              {isIOS ? (
                <div className="text-xs sm:text-sm text-gray-700 space-y-2">
                  <p>To install this app on your iPhone:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Tap the <Share2 className="w-3.5 h-3.5 inline" /> Share button</li>
                    <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                    <li>Tap &quot;Add&quot; to confirm</li>
                  </ol>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-gray-700">
                  Add to home screen for faster access and offline support
                </p>
              )}
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-gray-500 hover:text-gray-700 flex-shrink-0 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {isAndroid && deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2.5 bg-brand-deep-blue text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-brand-corporate-blue transition-colors active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span className="whitespace-nowrap">Install Now</span>
              </button>
            ) : isIOS ? (
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2.5 bg-brand-deep-blue text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-brand-corporate-blue transition-colors active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span className="whitespace-nowrap">Got it!</span>
              </button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

