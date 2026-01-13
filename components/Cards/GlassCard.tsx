'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  hoverable?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = '',
  intensity = 'medium',
  hoverable = true,
  onClick,
}: GlassCardProps) {
  const intensityMap = {
    light: 'rgba(255, 255, 255, 0.6)',
    medium: 'rgba(255, 255, 255, 0.85)',
    heavy: 'rgba(255, 255, 255, 0.95)',
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverable ? { y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        relative rounded-2xl overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        background: intensityMap[intensity],
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: `
          0 4px 30px rgba(0, 0, 0, 0.1),
          0 0 0 1px rgba(255, 255, 255, 0.1),
          inset 0 0 0 1px rgba(255, 255, 255, 0.05)
        `,
      }}
    >
      {/* Top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </motion.div>
  );
}

