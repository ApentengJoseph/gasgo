import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';

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

// Dynamically import MobileInstallPrompt with no SSR (needs window object)
const MobileInstallPrompt = dynamic(
  () => import('@/components/PWA/MobileInstallPrompt'),
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
    <html lang="en" className="h-full" style={{ backgroundColor: '#F9FAFB' }}>
      <head>
        {/* Critical inline style to prevent white flash on iOS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body { background-color: #F9FAFB !important; }
            body { margin: 0; padding: 0; }
          `
        }} />
        
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Gaso" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* iOS Splash Screens - Prevents white flash on launch */}
        <link rel="apple-touch-startup-image" href="/apple-touch-icon.png" />
        
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Gaso" />
        <meta name="msapplication-TileColor" content="#0F4C81" />
        <meta name="msapplication-TileImage" content="/web-app-manifest-192x192.png" />
        <meta name="theme-color" content="#0F4C81" />
        <meta name="format-detection" content="telephone=no" />
        <script src="https://js.paystack.co/v1/inline.js" async></script>
      </head>
      <body className={`${inter.className} h-full`} style={{ backgroundColor: '#F9FAFB' }}>
        <GoogleMapsProvider>
          {/* Main Content with safe areas */}
          <main className="min-h-screen pb-20 pt-4 bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="max-w-md mx-auto px-4">
              {children}
            </div>
          </main>
          
          {/* Bottom Navigation - Client only to avoid hydration issues */}
          <BottomNavigation />
          
          {/* Mobile PWA Install Prompt */}
          <MobileInstallPrompt />
        </GoogleMapsProvider>
      </body>
    </html>
  );
}

