'use client';

import { useState } from 'react';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import StatusBadge from '@/components/Badges/StatusBadge';
import EmptyState from '@/components/Empty/EmptyState';
import OrderDetailsModal from '@/components/Modals/OrderDetailsModal';
import { useRouter } from 'next/navigation';
import { Clock, Flame, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGuestOrder } from '@/lib/store/guestOrder';

// Mock order history with active orders
const orders = [
  {
    id: 'GAS12346',
    date: '2024-01-16',
    status: 'on_the_way' as const,
    size: '12kg',
    total: 193.75,
    station: 'GasPro Station',
    stationId: '1',
  },
  {
    id: 'GAS12345',
    date: '2024-01-15',
    status: 'delivered' as const,
    size: '12kg',
    total: 193.75,
    station: 'GasPro Station',
    stationId: '1',
    rating: 5,
  },
  {
    id: 'GAS12344',
    date: '2024-01-10',
    status: 'delivered' as const,
    size: '6kg',
    total: 95.50,
    station: 'SafeGas Depot',
    stationId: '2',
    rating: 4,
  },
  {
    id: 'GAS12343',
    date: '2024-01-05',
    status: 'delivered' as const,
    size: '25kg',
    total: 385.00,
    station: 'Energy Plus',
    stationId: '3',
    rating: 5,
  },
];

export default function OrdersPage() {
  const router = useRouter();
  const guestOrder = useGuestOrder();
  const { isOrderValid, clearOrder } = guestOrder;
  const hasOrderInProgress = isOrderValid();
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Separate active and completed orders
  const activeOrders = orders.filter(o => o.status !== 'delivered');
  const completedOrders = orders.filter(o => o.status === 'delivered');

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-bold text-gray-900 mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">
            Track active orders and view history
          </p>
        </div>
        <PrimaryButton
          size="sm"
          onClick={() => {
            clearOrder();
            router.push('/stations');
          }}
          className="whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">New Order</span>
          <span className="xs:hidden">New</span>
        </PrimaryButton>
      </div>

      {/* Guest Order in Progress */}
      {hasOrderInProgress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6 border-brand-energy-orange/20 bg-gradient-to-br from-brand-energy-orange/5 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Order in Progress</h3>
                <p className="text-sm text-gray-600">
                  Complete checkout to place your order
                </p>
              </div>
              <StatusBadge status="pending" />
            </div>
            <PrimaryButton
              fullWidth
              onClick={() => router.push('/checkout')}
            >
              Continue to Checkout
            </PrimaryButton>
          </GlassCard>
        </motion.div>
      )}

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div>
          <h2 className="text-title-md font-bold text-gray-900 mb-4">Active Orders</h2>
          <div className="space-y-4">
            {activeOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-brand-deep-blue/10"
                  onClick={() => router.push(`/orders/tracking?orderId=${order.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-brand-energy-orange" />
                        <h3 className="text-title-sm font-bold text-gray-900">
                          Order #{order.id}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {order.size} cylinder • {order.station}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Tracking live</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-lg font-bold text-brand-deep-blue">
                        GH₵{order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <div>
          <h2 className="text-title-md font-bold text-gray-900 mb-4">Order History</h2>
          <div className="space-y-4">
            {completedOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow active:scale-95"
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowOrderModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-brand-energy-orange" />
                        <h3 className="text-title-sm font-bold text-gray-900">
                          Order #{order.id}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {order.size} cylinder • {order.station}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Delivered</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-lg font-bold text-brand-deep-blue">
                        GH₵{order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeOrders.length === 0 && completedOrders.length === 0 && !hasOrderInProgress && (
        <EmptyState
          icon={Flame}
          title="No orders yet"
          description="Start by placing your first gas order. It's quick and easy!"
          action={{
            label: 'Order Gas Now',
            onClick: () => {
              clearOrder();
              router.push('/stations');
            },
          }}
        />
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          order={{
            ...selectedOrder,
            deliveryAddress: '123 East Legon Street, Accra',
            paymentMethod: 'Mobile Money',
            riderName: 'Kwame Boateng',
            riderPhone: '+233 24 123 4567',
          }}
        />
      )}
    </div>
  );
}

