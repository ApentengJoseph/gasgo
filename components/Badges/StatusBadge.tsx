'use client';

import { CheckCircle, Clock, XCircle, Truck, Gas, Home, RefreshCw } from 'lucide-react';

const statusConfig = {
  pending: { 
    color: 'bg-amber-50 text-amber-700 border-amber-200', 
    icon: Clock 
  },
  confirmed: { 
    color: 'bg-brand-deep-blue/10 text-brand-deep-blue border-brand-deep-blue/20', 
    icon: CheckCircle 
  },
  collected: { 
    color: 'bg-purple-50 text-purple-700 border-purple-200', 
    icon: Gas 
  },
  at_station: { 
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200', 
    icon: Gas 
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
      inline-flex items-center gap-2
      px-3 py-1.5 rounded-full
      text-sm font-semibold
      border-2
    `}>
      <Icon className="w-4 h-4" />
      <span className="capitalize">{status.replace('_', ' ')}</span>
    </div>
  );
}

