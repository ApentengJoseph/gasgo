'use client';

import { Home, Package, Users, Truck, BarChart3, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';

const adminNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin' },
  { id: 'orders', label: 'Orders', icon: Package, path: '/admin/orders' },
  { id: 'riders', label: 'Riders', icon: Users, path: '/admin/riders' },
  { id: 'stations', label: 'Stations', icon: Truck, path: '/admin/stations' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname === '/admin') {
      return 'dashboard';
    }
    if (pathname.startsWith('/admin/orders')) {
      return 'orders';
    }
    if (pathname.startsWith('/admin/riders')) {
      return 'riders';
    }
    if (pathname.startsWith('/admin/stations')) {
      return 'stations';
    }
    if (pathname.startsWith('/admin/analytics')) {
      return 'analytics';
    }
    if (pathname.startsWith('/admin/settings')) {
      return 'settings';
    }
    const matchedItem = adminNavItems.find(item => item.path === pathname);
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
          {adminNavItems.map((item) => (
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
                  className={`w-5 h-5 transition-all duration-300 ${
                    active === item.id 
                      ? 'text-brand-deep-blue' 
                      : 'text-gray-400'
                  }`}
                />
              </div>
              
              {/* Label */}
              <span className={`text-[10px] mt-0.5 transition-all duration-300 ${
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
