'use client';

import { Home, Package, DollarSign, TrendingUp, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';

const riderNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/rider' },
  { id: 'orders', label: 'Orders', icon: Package, path: '/rider' }, // Orders shown on dashboard
  { id: 'earnings', label: 'Earnings', icon: DollarSign, path: '/rider/earnings' },
  { id: 'performance', label: 'Stats', icon: TrendingUp, path: '/rider/performance' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export default function RiderNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname === '/rider') {
      return 'dashboard';
    }
    if (pathname.startsWith('/rider/orders')) {
      return 'orders';
    }
    if (pathname.startsWith('/rider/earnings')) {
      return 'earnings';
    }
    if (pathname.startsWith('/rider/performance')) {
      return 'performance';
    }
    if (pathname.startsWith('/profile')) {
      return 'profile';
    }
    const matchedItem = riderNavItems.find(item => item.path === pathname);
    return matchedItem?.id || 'dashboard';
  };
  
  const active = getActiveTab();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Subtle top shadow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="glass-dark mx-4 mb-4 rounded-2xl border border-white/10">
        <div className="flex justify-around items-center h-16 px-2">
          {riderNavItems.map((item) => (
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
              
              {/* Icon */}
              <div className="relative">
                <item.icon
                  className={`w-6 h-6 transition-all duration-300 ${
                    active === item.id 
                      ? 'text-brand-safety-green' 
                      : 'text-gray-400'
                  }`}
                />
              </div>
              
              {/* Label */}
              <span className={`text-xs mt-1 transition-all duration-300 ${
                active === item.id 
                  ? 'text-brand-safety-green font-semibold' 
                  : 'text-gray-500'
              }`}>
                {item.label}
              </span>
              
              {/* Active dot */}
              {active === item.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 w-1 h-1 bg-brand-safety-green rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
