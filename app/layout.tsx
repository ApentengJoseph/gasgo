import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/bricolage-grotesque/opsz.css';
import './globals.css';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import AppShell from '@/components/Layout/AppShell';

const BottomNavigation = dynamic(() => import('@/components/Navigation/BottomNav'), { ssr: false });
const MobileInstallPrompt = dynamic(() => import('@/components/PWA/MobileInstallPrompt'), { ssr: false });
const UpdatePrompt = dynamic(() => import('@/components/PWA/UpdatePrompt'), { ssr: false });

export const metadata: Metadata = {
  title: 'GasRefill — Cooking gas refill delivery in Koforidua',
  description:
    'Stop carrying your cylinder to the station. Book a gas refill in Koforidua, compare station prices, pay with Mobile Money and track your rider live.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'GasRefill' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#17130F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-startup-image" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="GasRefill" />
        <meta name="msapplication-TileColor" content="#17130F" />
        <meta name="msapplication-TileImage" content="/web-app-manifest-192x192.png" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body suppressHydrationWarning className="h-full">
        {/* Splash only shows when launched as an installed app (see globals.css) */}
        <div id="ios-splash-overlay" suppressHydrationWarning />
        <Script id="splash-remover" strategy="afterInteractive">{`
          (function () {
            function hide() {
              var o = document.getElementById('ios-splash-overlay');
              if (!o) return;
              o.classList.add('hidden');
              setTimeout(function () { o.parentNode && o.parentNode.removeChild(o); }, 700);
            }
            if (document.readyState === 'complete') setTimeout(hide, 300);
            else window.addEventListener('load', function () { setTimeout(hide, 300); });
          })();
        `}</Script>

        <AuthProvider>
            <AppShell>{children}</AppShell>
            <BottomNavigation />
            <MobileInstallPrompt />
            <UpdatePrompt />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '999px',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#17130F',
                  boxShadow: '0 18px 40px -16px rgba(23,19,15,0.3)',
                  border: '1px solid #EFE7DE',
                  padding: '10px 16px',
                },
                success: { iconTheme: { primary: '#15803D', secondary: '#fff' } },
                error: { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
              }}
            />
        </AuthProvider>
      </body>
    </html>
  );
}
