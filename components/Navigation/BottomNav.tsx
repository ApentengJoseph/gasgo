'use client';

import { useState, useEffect } from 'react';
import { Home, MapPin, Clock, User, Bell, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useGuestOrder } from '@/lib/store/guestOrder';

const navItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'map', label: 'Map', icon: MapPin, path: '/stations' },
  { id: 'orders', label: 'Orders', icon: Clock, path: '/orders' },
  { id: 'notifications', label: 'Alerts', icon: Bell, path: '/notifications', badge: true },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const guestOrder = useGuestOrder();
  const [hasOrderInProgress, setHasOrderInProgress] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check guest order after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
    // Check order validity after mount (store will auto-hydrate from localStorage)
    const checkOrder = () => {
      try {
        setHasOrderInProgress(guestOrder.isOrderValid());
      } catch (e) {
        setHasOrderInProgress(false);
      }
    };
    
    // Small delay to ensure store is hydrated
    const timer = setTimeout(checkOrder, 100);
    
    return () => clearTimeout(timer);
  }, [guestOrder]);

  // Determine active tab based on pathname
  // Handle /order, /orders, /checkout as orders-related routes
  const getActiveTab = () => {
    if (pathname === '/order' || pathname === '/orders' || pathname === '/checkout' || pathname.startsWith('/orders/')) {
      return 'orders';
    }
    const matchedItem = navItems.find(item => item.path === pathname);
    return matchedItem?.id || 'home';
  };
  
  const active = getActiveTab();

  const handleNavigation = (path: string) => {
    // If clicking on orders and has guest order, go to checkout
    if (path === '/orders' && hasOrderInProgress) {
      router.push('/checkout');
    } else {
      router.push(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Subtle top shadow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="glass-dark mx-4 mb-4 rounded-2xl border border-white/10">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className="relative flex flex-col items-center justify-center p-2"
            >
              {/* Active indicator */}
              {active === item.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/5 rounded-xl"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              
              {/* Icon with badge */}
              <div className="relative">
                <item.icon
                  className={`w-6 h-6 transition-all duration-300 ${
                    active === item.id 
                      ? 'text-brand-deep-blue' 
                      : 'text-gray-400'
                  }`}
                />
                {item.badge && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-energy-orange rounded-full border border-white" />
                )}
                {/* Cart indicator for guest orders (only show after mount) */}
                {mounted && item.id === 'orders' && hasOrderInProgress && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-energy-orange rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </div>
              
              {/* Label with subtle animation */}
              <span className={`text-xs mt-1 transition-all duration-300 ${
                active === item.id 
                  ? 'text-brand-deep-blue font-semibold' 
                  : 'text-gray-500'
              }`}>
                {item.label}
              </span>
              
              {/* Active dot */}
              {active === item.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 w-1 h-1 bg-brand-deep-blue rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

