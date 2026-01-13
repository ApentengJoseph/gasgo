import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';
import PWAInstallPrompt from '@/components/PWA/InstallPrompt';
import { Suspense } from 'react';

// Dynamically import BottomNavigation with no SSR to prevent hydration issues
const BottomNavigation = dynamic(
  () => import('@/components/Navigation/BottomNav'),
  { ssr: false }
);

// Dynamically import GoogleMapsProvider with no SSR to prevent hydration issues
const GoogleMapsProvider = dynamic(
  () => import('@/contexts/GoogleMapsContext').then((mod) => ({ default: mod.GoogleMapsProvider })),
  { ssr: false }
);

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gaso - Professional Gas Delivery',
  description: 'On-demand gas delivery service with transparent pricing and live tracking',
  themeColor: '#0F4C81',
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gaso',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Gaso" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Gaso" />
        <meta name="msapplication-TileColor" content="#0F4C81" />
        <meta name="msapplication-TileImage" content="/icon-144x144.png" />
        <script src="https://js.paystack.co/v1/inline.js" async></script>
      </head>
      <body className={`${inter.className} h-full bg-gradient-to-b from-gray-50 to-gray-100`}>
        <GoogleMapsProvider>
          {/* Main Content with safe areas */}
          <main className="min-h-screen pb-20 pt-4">
            <div className="max-w-md mx-auto px-4">
              {children}
            </div>
          </main>
          
          {/* Bottom Navigation - Client only to avoid hydration issues */}
          <BottomNavigation />
          
          {/* PWA Install Prompt */}
          <Suspense fallback={null}>
            <PWAInstallPrompt />
          </Suspense>
        </GoogleMapsProvider>
      </body>
    </html>
  );
}

