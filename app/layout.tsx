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
        {/* Critical inline style to prevent white flash on iOS and show splash screen */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body { 
              background-color: #F9FAFB !important; 
              margin: 0; 
              padding: 0; 
            }
            /* iOS Splash Screen - Show icon centered while loading */
            #ios-splash-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              width: 100vw;
              height: 100vh;
              background-color: #F9FAFB;
              background-image: url('/apple-touch-icon.png');
              background-repeat: no-repeat;
              background-position: center center;
              background-size: 180px 180px;
              z-index: 99999;
              opacity: 1;
              transition: opacity 0.6s ease-out, visibility 0.6s ease-out;
              pointer-events: none;
              visibility: visible;
              -webkit-backface-visibility: hidden;
              backface-visibility: hidden;
              display: block;
            }
            #ios-splash-overlay.hidden {
              opacity: 0 !important;
              visibility: hidden !important;
            }
            /* Ensure splash shows immediately on iOS standalone mode */
            @media (display-mode: standalone) {
              #ios-splash-overlay {
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
              }
            }
            /* Fallback using body::before for older iOS */
            body::before {
              content: '';
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              width: 100vw;
              height: 100vh;
              background-color: #F9FAFB;
              background-image: url('/apple-touch-icon.png');
              background-repeat: no-repeat;
              background-position: center center;
              background-size: 180px 180px;
              z-index: 99998;
              opacity: 1;
              transition: opacity 0.6s ease-out, visibility 0.6s ease-out;
              pointer-events: none;
              visibility: visible;
              -webkit-backface-visibility: hidden;
              backface-visibility: hidden;
            }
            body.loaded::before {
              opacity: 0 !important;
              visibility: hidden !important;
            }
          `
        }} />
        
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Gaso" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* iOS Splash Screens - Different sizes for different devices */}
        {/* iPhone SE (320x568) */}
        <link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" href="/apple-touch-icon.png" />
        {/* iPhone 6/7/8 (375x667) */}
        <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="/apple-touch-icon.png" />
        {/* iPhone 6/7/8 Plus (414x736) */}
        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" href="/apple-touch-icon.png" />
        {/* iPhone X/XS (375x812) */}
        <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" href="/apple-touch-icon.png" />
        {/* iPhone XR (414x896) */}
        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" href="/apple-touch-icon.png" />
        {/* iPhone XS Max (414x896) */}
        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" href="/apple-touch-icon.png" />
        {/* iPhone 12/13 mini (360x780) */}
        <link rel="apple-touch-startup-image" media="(device-width: 360px) and (device-height: 780px) and (-webkit-device-pixel-ratio: 3)" href="/apple-touch-icon.png" />
        {/* iPhone 12/13/14 (390x844) */}
        <link rel="apple-touch-startup-image" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" href="/apple-touch-icon.png" />
        {/* iPhone 12/13/14 Pro Max (428x926) */}
        <link rel="apple-touch-startup-image" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" href="/apple-touch-icon.png" />
        {/* iPhone 14 Plus (428x926) */}
        <link rel="apple-touch-startup-image" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" href="/apple-touch-icon.png" />
        {/* iPhone 15/15 Pro (393x852) */}
        <link rel="apple-touch-startup-image" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" href="/apple-touch-icon.png" />
        {/* iPhone 15 Plus/15 Pro Max (430x932) - iPhone 15 Pro Max */}
        <link rel="apple-touch-startup-image" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" href="/apple-touch-icon.png" />
        {/* iPhone 16/16 Pro (393x852) */}
        <link rel="apple-touch-startup-image" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" href="/apple-touch-icon.png" />
        {/* iPhone 16 Plus/16 Pro Max (430x932) */}
        <link rel="apple-touch-startup-image" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" href="/apple-touch-icon.png" />
        {/* iPhone 17/17 Pro (393x852) */}
        <link rel="apple-touch-startup-image" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" href="/apple-touch-icon.png" />
        {/* iPhone 17 Plus/17 Pro Max (430x932) */}
        <link rel="apple-touch-startup-image" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" href="/apple-touch-icon.png" />
        {/* iPad (768x1024) */}
        <link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" href="/apple-touch-icon.png" />
        {/* iPad Pro 10.5" (834x1112) */}
        <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" href="/apple-touch-icon.png" />
        {/* iPad Pro 11" (834x1194) */}
        <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" href="/apple-touch-icon.png" />
        {/* iPad Pro 12.9" (1024x1366) */}
        <link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" href="/apple-touch-icon.png" />
        {/* Fallback for all other devices */}
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Create and inject splash screen overlay immediately
              (function() {
                var splashOverlay = document.createElement('div');
                splashOverlay.id = 'ios-splash-overlay';
                document.body.appendChild(splashOverlay);
                
                function removeSplash() {
                  var overlay = document.getElementById('ios-splash-overlay');
                  if (overlay) {
                    overlay.classList.add('hidden');
                    setTimeout(function() {
                      if (overlay && overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                      }
                    }, 700);
                  }
                  if (document.body) {
                    document.body.classList.add('loaded');
                  }
                }
                
                // Remove splash when DOM is ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', removeSplash);
                } else {
                  // DOM already loaded, wait a bit for iOS to render
                  setTimeout(removeSplash, 100);
                }
                
                // Also remove on window load (all resources loaded)
                window.addEventListener('load', function() {
                  setTimeout(removeSplash, 300);
                });
                
                // Fallback: remove after 2.5 seconds max
                setTimeout(removeSplash, 2500);
              })();
            `,
          }}
        />
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

