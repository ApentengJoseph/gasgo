'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** primary/energy = flame gradient (the main action), secondary/ghost/outline = quiet, dark = ink */
  variant?: 'primary' | 'secondary' | 'energy' | 'safety' | 'ghost' | 'outline' | 'dark';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const sizes = {
  sm: 'h-10 px-4 text-[0.875rem] gap-1.5',
  md: 'h-12 px-5 text-[0.9375rem] gap-2',
  lg: 'h-14 px-6 text-[1rem] gap-2',
};

const variants: Record<NonNullable<PrimaryButtonProps['variant']>, string> = {
  primary:   'btn-primary',
  energy:    'btn-primary',
  dark:      'bg-ink text-white font-bold hover:bg-ink-soft',
  safety:    'bg-[#15803D] text-white font-bold hover:bg-[#126B33]',
  secondary: 'bg-white text-ink font-semibold border border-line hover:border-[#E0D4C6] hover:bg-cream',
  ghost:     'bg-cream text-ink font-semibold border border-line hover:bg-cream-deep',
  outline:   'bg-transparent text-ink font-semibold border-[1.5px] border-ink hover:bg-cream',
};

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
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      type={type}
      className={`relative rounded-full flex items-center justify-center select-none whitespace-nowrap
        transition-all duration-200 active:scale-[0.98]
        disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100
        ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : 'inline-flex'} ${className}`}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-80' : ''}`}>{children}</span>
    </button>
  );
}
