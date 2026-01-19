'use client';

import { CheckCircle, Clock, XCircle, Truck, Flame, Home, RefreshCw, UserCheck } from 'lucide-react';

const statusConfig = {
  pending: { 
    color: 'bg-amber-50 text-amber-700 border-amber-200', 
    icon: Clock 
  },
  confirmed: { 
    color: 'bg-brand-deep-blue/10 text-brand-deep-blue border-brand-deep-blue/20', 
    icon: CheckCircle 
  },
  assigned: { 
    color: 'bg-blue-50 text-blue-700 border-blue-200', 
    icon: UserCheck 
  },
  collected: { 
    color: 'bg-purple-50 text-purple-700 border-purple-200', 
    icon: Flame 
  },
  at_station: { 
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200', 
    icon: Flame 
  },
  on_the_way: { 
    color: 'bg-brand-deep-blue/10 text-brand-deep-blue border-brand-deep-blue/20', 
    icon: Truck 
  },
  delivered: { 
    color: 'bg-brand-safety-green/10 text-brand-safety-green border-brand-safety-green/20', 
    icon: Home 
  },
  cancelled: { 
    color: 'bg-red-50 text-red-700 border-red-200', 
    icon: XCircle 
  },
  processing: { 
    color: 'bg-brand-deep-blue/10 text-brand-deep-blue border-brand-deep-blue/20', 
    icon: RefreshCw 
  },
};

export default function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status];
  if (!config) return null;
  
  const Icon = config.icon;
  
  return (
    <div className={`
      ${config.color}
      inline-flex items-center gap-1.5 sm:gap-2
      px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full
      text-xs sm:text-sm font-semibold
      border-2
      whitespace-nowrap
    `}>
      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
      <span className="capitalize truncate">{status.replace('_', ' ')}</span>
    </div>
  );
}

