'use client';

import { CheckCircle2, Clock, XCircle, Bike, Flame, Home, RefreshCw, UserCheck, MapPin, Package } from 'lucide-react';

type Tone = 'waiting' | 'active' | 'done' | 'cancelled';

const config: Record<string, { label: string; tone: Tone; icon: typeof Clock }> = {
  pending:       { label: 'Awaiting payment', tone: 'waiting',   icon: Clock },
  confirmed:     { label: 'Confirmed',        tone: 'active',    icon: CheckCircle2 },
  assigned:      { label: 'Rider coming',     tone: 'active',    icon: UserCheck },
  collected:     { label: 'Picked up',        tone: 'active',    icon: Package },
  at_station:    { label: 'Refilling',        tone: 'active',    icon: Flame },
  on_the_way:    { label: 'Bringing it back', tone: 'active',    icon: Bike },
  arriving:      { label: 'Arriving',         tone: 'active',    icon: MapPin },
  arriving_soon: { label: 'Arriving',         tone: 'active',    icon: MapPin },
  delivered:     { label: 'Delivered',        tone: 'done',      icon: Home },
  cancelled:     { label: 'Cancelled',        tone: 'cancelled', icon: XCircle },
  processing:    { label: 'Processing',       tone: 'active',    icon: RefreshCw },
};

const tones: Record<Tone, string> = {
  waiting:   'bg-[#FEF3DC] text-[#B45309]',
  active:    'bg-flame-soft text-flame-deep',
  done:      'bg-[#E8F6EC] text-[#15803D]',
  cancelled: 'bg-[#FDECEC] text-[#DC2626]',
};

export default function StatusBadge({ status }: { status: string }) {
  const c = config[status];
  if (!c) return null;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.75rem] font-semibold ${tones[c.tone]}`}>
      <Icon className="w-3.5 h-3.5" />
      {c.label}
    </span>
  );
}

export function statusLabel(status: string) {
  return config[status]?.label ?? status;
}
