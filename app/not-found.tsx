import Link from 'next/link';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import GlassCard from '@/components/Cards/GlassCard';
import { Frown } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <GlassCard className="p-8 text-center max-w-md">
        <Frown className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        <h2 className="text-display-md font-bold text-gray-900 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          Could not find the requested resource.
        </p>
        <Link href="/" passHref>
          <PrimaryButton className="mx-auto">
            <span>Return Home</span>
          </PrimaryButton>
        </Link>
      </GlassCard>
    </div>
  );
}

