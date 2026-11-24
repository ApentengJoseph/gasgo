'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Installed app updates: after each deploy a new service worker is published.
 * We check for it whenever the app comes back to the foreground; when it takes
 * over, we offer a one-tap refresh so customers get the new version.
 */
export default function UpdatePrompt() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const hadController = !!navigator.serviceWorker.controller;
    const onChange = () => {
      if (!hadController) return; // first install, nothing to refresh
      toast((t) => (
        <span className="flex items-center gap-3">
          A new version of GasRefill is ready.
          <button
            onClick={() => { toast.dismiss(t.id); window.location.reload(); }}
            className="h-8 px-3 rounded-full bg-[#17130F] text-white text-[0.8125rem] font-semibold"
          >
            Refresh
          </button>
        </span>
      ), { duration: 15000, id: 'sw-update' });
    };
    navigator.serviceWorker.addEventListener('controllerchange', onChange);
    const check = () => {
      if (document.visibilityState === 'visible') navigator.serviceWorker.getRegistration().then(r => r?.update()).catch(() => {});
    };
    document.addEventListener('visibilitychange', check);
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onChange);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);
  return null;
}
