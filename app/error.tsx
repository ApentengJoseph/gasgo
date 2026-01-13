'use client';

import { useEffect } from 'react';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import GlassCard from '@/components/Cards/GlassCard';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <GlassCard className="p-8 text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-status-error mx-auto mb-6" />
        <h2 className="text-display-md font-bold text-gray-900 mb-3">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-6">
          We're sorry, but an unexpected error occurred. Please try again.
        </p>
        <PrimaryButton onClick={() => reset()} className="mx-auto">
          <RefreshCw className="w-5 h-5" />
          <span>Try again</span>
        </PrimaryButton>
      </GlassCard>
    </div>
  );
}

