'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'energy' | 'safety';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function PrimaryButton({
  children,
  onClick,
  loading = false,
  fullWidth = false,
  size = 'md',
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
}: PrimaryButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-brand-deep-blue text-white hover:bg-brand-corporate-blue',
    secondary: 'glass-light text-brand-deep-blue border border-brand-deep-blue/20',
    energy: 'bg-brand-energy-orange text-white hover:opacity-90',
    safety: 'bg-brand-safety-green text-white hover:opacity-90',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      onClick={onClick}
      disabled={loading || disabled}
      type={type}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        relative rounded-xl font-semibold
        shadow-lg hover:shadow-xl
        transition-all duration-200
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        overflow-hidden
        ${className}
      `}
    >
      {/* Animated background shine */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}
      
      {/* Loading spinner */}
      {loading && (
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-5 h-5" />
        </motion.div>
      )}
      
      <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
        {children}
      </span>
    </motion.button>
  );
}

