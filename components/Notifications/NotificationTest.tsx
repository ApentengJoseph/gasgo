'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, XCircle } from 'lucide-react';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import GlassCard from '@/components/Cards/GlassCard';
import { notificationService } from '@/lib/services/notificationService';

export default function NotificationTest() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported(notificationService.isSupported());
      setPermission(notificationService.getPermission());
    }
  }, []);

  const handleRequestPermission = async () => {
    const newPermission = await notificationService.requestPermission();
    setPermission(newPermission);
    
    if (newPermission === 'granted') {
      // Show a test notification immediately
      await notificationService.showNotification({
        title: 'Notifications Enabled! 🎉',
        body: 'You will now receive push notifications from GasRefill.',
        tag: 'permission-granted',
      });
    }
  };

  const handleStartTest = () => {
    if (permission !== 'granted') {
      alert('Please grant notification permission first');
      return;
    }
    
    notificationService.startTestNotifications();
    setIsTestRunning(true);
  };

  const handleStopTest = () => {
    notificationService.stopTestNotifications();
    setIsTestRunning(false);
  };

  if (!isSupported) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-3 text-gray-600">
          <XCircle className="w-5 h-5" />
          <p className="text-sm">Push notifications are not supported in this browser.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center">
          <Bell className="w-5 h-5 text-brand-deep-blue" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Push Notifications</h3>
          <p className="text-sm text-gray-600">Test notification system</p>
        </div>
      </div>

      {/* Permission Status */}
      <div className="mb-4 p-3 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Permission Status:</span>
          <div className="flex items-center gap-2">
            {permission === 'granted' ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Granted</span>
              </>
            ) : permission === 'denied' ? (
              <>
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600 font-medium">Denied</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 font-medium">Not Set</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {permission !== 'granted' && (
          <PrimaryButton
            fullWidth
            onClick={handleRequestPermission}
            disabled={permission === 'denied'}
          >
            <Bell className="w-4 h-4" />
            <span>{permission === 'denied' ? 'Permission Denied' : 'Enable Notifications'}</span>
          </PrimaryButton>
        )}

        {permission === 'granted' && (
          <>
            {!isTestRunning ? (
              <PrimaryButton
                fullWidth
                onClick={handleStartTest}
                variant="primary"
              >
                <Bell className="w-4 h-4" />
                <span>Start Test (Every 5 min)</span>
              </PrimaryButton>
            ) : (
              <PrimaryButton
                fullWidth
                onClick={handleStopTest}
                variant="secondary"
                className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
              >
                <BellOff className="w-4 h-4" />
                <span>Stop Test</span>
              </PrimaryButton>
            )}
            
            {isTestRunning && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-green-700 text-center">
                  ✓ Test notifications are running. You&apos;ll receive a notification every 5 minutes.
                </p>
              </div>
            )}
          </>
        )}

        {permission === 'denied' && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 text-center">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
