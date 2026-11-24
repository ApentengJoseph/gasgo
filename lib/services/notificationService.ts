/**
 * Push Notification Service
 * Handles browser push notifications with permission management
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private registration: ServiceWorkerRegistration | null = null;
  private testIntervalId: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.permission = Notification.permission;
      this.initializeServiceWorker();
    }
  }

  /**
   * Initialize service worker for push notifications
   */
  private async initializeServiceWorker(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[Notifications] Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      this.registration = registration;
      console.log('[Notifications] Service Worker ready');
    } catch (error) {
      console.error('[Notifications] Service Worker initialization error:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('[Notifications] Notifications not supported');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    if (this.permission === 'denied') {
      console.log('[Notifications] Permission previously denied');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      console.log('[Notifications] Permission:', permission);
      return permission;
    } catch (error) {
      console.error('[Notifications] Permission request error:', error);
      return 'denied';
    }
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Check if permission is granted
   */
  hasPermission(): boolean {
    return this.permission === 'granted';
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }

  /**
   * Show a notification
   */
  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.isSupported()) {
      console.warn('[Notifications] Notifications not supported');
      return;
    }

    if (this.permission !== 'granted') {
      console.warn('[Notifications] Permission not granted');
      return;
    }

    try {
      // Use service worker if available, otherwise use Notification API directly
      if (this.registration) {
        await this.registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/apple-touch-icon.png',
          badge: options.badge || '/favicon-96x96.png',
          tag: options.tag || 'gaso-notification',
          data: options.data || {},
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false,
          // @ts-ignore - vibrate is supported but not in TypeScript definitions
          vibrate: [200, 100, 200],
        });
      } else {
        // Fallback to direct Notification API
        const notificationOptions: any = {
          body: options.body,
          icon: options.icon || '/apple-touch-icon.png',
          badge: options.badge || '/favicon-96x96.png',
          tag: options.tag || 'gaso-notification',
          data: options.data || {},
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false,
          vibrate: [200, 100, 200],
        };
        new Notification(options.title, notificationOptions);
      }
      console.log('[Notifications] Notification shown:', options.title);
    } catch (error) {
      console.error('[Notifications] Error showing notification:', error);
    }
  }

  /**
   * Start test notifications every 5 minutes
   */
  startTestNotifications(): void {
    if (this.testIntervalId) {
      console.log('[Notifications] Test notifications already running');
      return;
    }

    if (!this.hasPermission()) {
      console.warn('[Notifications] Cannot start test: permission not granted');
      return;
    }

    console.log('[Notifications] Starting test notifications (every 5 minutes)');
    
    // Send first notification immediately
    this.showNotification({
      title: 'GasRefill Test Notification',
      body: 'Push notifications are working! This is a test notification.',
      tag: 'test-notification',
    });

    // Then send every 5 minutes (300000 ms)
    this.testIntervalId = setInterval(() => {
      const now = new Date();
      this.showNotification({
        title: 'GasRefill Test Notification',
        body: `Test notification at ${now.toLocaleTimeString()}. Push notifications are working correctly!`,
        tag: 'test-notification',
      });
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Stop test notifications
   */
  stopTestNotifications(): void {
    if (this.testIntervalId) {
      clearInterval(this.testIntervalId);
      this.testIntervalId = null;
      console.log('[Notifications] Test notifications stopped');
    }
  }

  /**
   * Check if test notifications are running
   */
  isTestRunning(): boolean {
    return this.testIntervalId !== null;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
