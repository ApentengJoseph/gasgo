'use client';

import { useState, useEffect } from 'react';

export default function StatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* iOS Status Bar Spacer */}
      <div className="fixed top-0 left-0 right-0 h-safe-top bg-gradient-to-b from-black/20 to-transparent z-50" />
      
      {/* Battery/Time Mock for PWA */}
      <div className="fixed top-safe-top left-0 right-0 h-12 glass-dark z-40 flex items-center justify-between px-4">
        <div className="text-white text-sm font-medium">
          {time || '--:--'}
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 bg-white rounded-full" />
          <div className="w-4 h-2 bg-white/50 rounded-full" />
          <div className="w-4 h-2 bg-white/30 rounded-full" />
        </div>
      </div>
    </>
  );
}

