'use client';

import { ReactNode, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  hoverable?: boolean;
  onClick?: () => void;
  noPadding?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({
  children,
  className = '',
  intensity = 'medium',
  hoverable = true,
  onClick,
  noPadding = false,
}, ref) => {
  const Tag = onClick ? motion.div : motion.div;

  return (
    <Tag
      ref={ref}
      initial={false}
      animate={{ opacity: 1 }}
      whileHover={hoverable && onClick ? { y: -1 } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
      onClick={onClick}
      className={`
        card
        ${onClick ? 'card-interactive' : ''}
        ${className}
      `}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      {children}
    </Tag>
  );
});

GlassCard.displayName = 'GlassCard';
export default GlassCard;
