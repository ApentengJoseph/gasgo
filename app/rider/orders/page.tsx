'use client';

import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import StatusBadge from '@/components/Badges/StatusBadge';
import { Truck, MapPin, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const activeOrders = [
  { id: 'GAS12345', status: 'at_station' as const, size: '12kg', customerName: 'Kwame Mensah', customerLocation: 'East Legon, Accra', stationName: 'GasPro Station', earnings: 45.50, createdAt: '2024-01-16T10:30:00' },
  { id: 'GAS12346', status: 'on_the_way' as const, size: '6kg', customerName: 'Ama Serwah', customerLocation: 'Dansoman, Accra', stationName: 'SafeGas Depot', earnings: 35.00, createdAt: '2024-01-16T09:15:00' },
  { id: 'GAS12347', status: 'assigned' as const, size: '25kg', customerName: 'Kojo Asante', customerLocation: 'Tema, Accra', stationName: 'Energy Plus', earnings: 65.00, createdAt: '2024-01-16T11:00:00' },
];

function getStatusAction(status: string) {
  switch (status) {
    case 'assigned': return { label: 'Start Journey', variant: 'energy' as const };
    case 'at_station': return { label: 'Collect Cylinder', variant: 'energy' as const };
    case 'collected': return { label: 'Start Delivery', variant: 'energy' as const };
    case 'on_the_way': return { label: 'View Route', variant: 'secondary' as const };
    case 'arriving_soon': return { label: 'Arrive', variant: 'energy' as const };
    default: return { label: 'View Details', variant: 'secondary' as const };
  }
}

export default function RiderOrdersPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 py-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-display-sm font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Active and recent deliveries</p>
      </motion.div>

      {activeOrders.length > 0 ? (
        <div className="space-y-4">
          {activeOrders.map((order, index) => {
            const action = getStatusAction(order.status);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard
                  className="p-5 hover:shadow-lg transition-all border-brand-deep-blue/10 cursor-pointer"
                  onClick={() => router.push(`/rider/orders/${order.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-brand-energy-orange" />
                        <h3 className="text-title-sm font-bold text-gray-900">Order #{order.id}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {order.size} cylinder • {order.stationName}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{order.customerLocation}</span>
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Earnings</p>
                      <p className="text-sm font-bold text-brand-safety-green">GH₵{order.earnings.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); router.push(`/rider/orders/${order.id}`); }}
                      className="flex-1 px-4 py-3 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      View Details
                    </button>
                    <PrimaryButton
                      size="sm"
                      variant={action.variant}
                      className="flex-1"
                      onClick={(e) => { e.stopPropagation(); router.push(`/rider/orders/${order.id}`); }}
                    >
                      {action.label}
                    </PrimaryButton>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-8 text-center">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-title-sm font-semibold text-gray-900 mb-2">No Active Orders</h3>
            <p className="text-sm text-gray-500 mb-4">You don&apos;t have any orders right now.</p>
            <PrimaryButton variant="secondary" onClick={() => router.push('/rider')}>
              Back to Dashboard
            </PrimaryButton>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
