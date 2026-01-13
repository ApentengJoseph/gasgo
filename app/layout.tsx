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
        {/* Critical inline style to prevent black/white flash on iOS and show splash screen immediately */}
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              margin: 0;
              padding: 0;
            }
            html { 
              background-color: #F9FAFB !important; 
              margin: 0; 
              padding: 0; 
              height: 100%;
            }
            body { 
              background-color: #F9FAFB !important; 
              margin: 0; 
              padding: 0; 
              min-height: 100vh;
              height: 100%;
              overflow-x: hidden;
            }
            /* Prevent black screen on iOS - ensure background is always visible */
            html, body, #__next, main {
              background-color: #F9FAFB !important;
            }
            /* iOS Splash Screen - Show immediately, no delay */
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
              transition: opacity 0.8s ease-out, visibility 0.8s ease-out;
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
            /* Fallback using body::before for immediate display */
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
              transition: opacity 0.8s ease-out, visibility 0.8s ease-out;
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
        {/* iOS Splash Screen Overlay - Injected immediately in HTML */}
        <div id="ios-splash-overlay"></div>
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent black screen - set background immediately
              (function() {
                // Set background color immediately before body loads
                if (document.documentElement) {
                  document.documentElement.style.backgroundColor = '#F9FAFB';
                }
                
                // Ensure splash overlay exists (it's already in HTML, but double-check)
                function ensureSplash() {
                  if (!document.getElementById('ios-splash-overlay')) {
                    var splashOverlay = document.createElement('div');
                    splashOverlay.id = 'ios-splash-overlay';
                    if (document.body) {
                      document.body.insertBefore(splashOverlay, document.body.firstChild);
                    } else {
                      // Insert into head temporarily, move to body later
                      document.head.appendChild(splashOverlay);
                      document.addEventListener('DOMContentLoaded', function() {
                        if (document.body && splashOverlay.parentNode === document.head) {
                          document.body.insertBefore(splashOverlay, document.body.firstChild);
                        }
                      });
                    }
                  }
                }
                
                // Ensure splash exists immediately
                ensureSplash();
                
                // Also ensure when body is available
                if (document.body) {
                  ensureSplash();
                } else {
                  document.addEventListener('DOMContentLoaded', ensureSplash);
                }
                
                function removeSplash() {
                  var overlay = document.getElementById('ios-splash-overlay');
                  if (overlay) {
                    overlay.classList.add('hidden');
                    setTimeout(function() {
                      if (overlay && overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                      }
                    }, 900);
                  }
                  if (document.body) {
                    document.body.classList.add('loaded');
                  }
                }
                
                // Remove splash after content is loaded, but keep it visible longer
                // Wait for both DOM and window load, then add extra delay for better UX
                var removed = false;
                function tryRemoveSplash() {
                  if (removed) return;
                  removed = true;
                  
                  // Wait 1.5 seconds after everything is loaded to keep splash visible
                  setTimeout(removeSplash, 1500);
                }
                
                // Remove splash when DOM is ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() {
                    // Wait for window load, then add delay
                    if (document.readyState === 'complete') {
                      tryRemoveSplash();
                    } else {
                      window.addEventListener('load', tryRemoveSplash);
                    }
                  });
                } else {
                  // DOM already loaded
                  if (document.readyState === 'complete') {
                    tryRemoveSplash();
                  } else {
                    window.addEventListener('load', tryRemoveSplash);
                  }
                }
                
                // Fallback: remove after 4 seconds max (keeps splash visible longer)
                setTimeout(function() {
                  if (!removed) {
                    removed = true;
                    removeSplash();
                  }
                }, 4000);
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

