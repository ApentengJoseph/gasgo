'use client';

import { ReactNode } from 'react';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <GlassCard className="p-12 text-center">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-title-md font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-6 max-w-sm">
          {description}
        </p>
        {action && (
          <PrimaryButton onClick={action.onClick}>
            {action.label}
          </PrimaryButton>
        )}
      </div>
    </GlassCard>
  );
}

