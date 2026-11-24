'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, Truck, Package, TrendingUp,
  DollarSign, Clock, MapPin, Flame, CheckCircle,
  RefreshCw, Calendar, Zap, X, Search, UserCheck,
  Loader2, AlertTriangle, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from '@/components/Cards/GlassCard';
import StatusBadge from '@/components/Badges/StatusBadge';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { createClient } from '@/lib/supabase/client';
import type { Order, Profile, OrderStatus } from '@/lib/types/database';

type Tab = 'overview' | 'orders' | 'riders';

const ORDER_STATUS_FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Progress', value: 'on_the_way' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

interface DayStats {
  orders: number;
  revenue: number;
  pendingOrders: number;
  activeRiders: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Profile[]>([]);
  const [stats, setStats] = useState<DayStats>({ orders: 0, revenue: 0, pendingOrders: 0, activeRiders: 0 });
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [selectedRider, setSelectedRider] = useState<string | null>(null);
  const [assigningRider, setAssigningRider] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);

  // ─── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth/login'); return; }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!prof || prof.role !== 'admin') { router.replace('/'); return; }
      setProfile(prof);
      setLoading(false);
    };
    check();
  }, [supabase, router]);

  // ─── Load data ─────────────────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    const query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    const { data } = await query;
    if (data) setOrders(data);
  }, [supabase]);

  const loadRiders = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'rider')
      .eq('is_active', true)
      .order('is_online', { ascending: false });
    if (data) setRiders(data);
  }, [supabase]);

  const loadStats = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayOrders } = await supabase
      .from('orders')
      .select('total, status')
      .gte('created_at', today.toISOString());

    const { data: activeRidersData } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'rider')
      .eq('is_online', true);

    const ordersToday = todayOrders || [];
    setStats({
      orders: ordersToday.length,
      revenue: ordersToday.filter((o) => o.status === 'delivered').reduce((s, o) => s + Number(o.total), 0),
      pendingOrders: ordersToday.filter((o) => ['pending', 'confirmed'].includes(o.status)).length,
      activeRiders: activeRidersData?.length || 0,
    });
  }, [supabase]);

  const loadAll = useCallback(async () => {
    await Promise.all([loadOrders(), loadRiders(), loadStats()]);
  }, [loadOrders, loadRiders, loadStats]);

  useEffect(() => { if (!loading) loadAll(); }, [loading, loadAll]);

  // ─── Realtime subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    const channel = supabase
      .channel('admin-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadOrders();
        loadStats();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `role=eq.rider` }, () => {
        loadRiders();
        loadStats();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loading, supabase, loadOrders, loadRiders, loadStats]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAll();
    setIsRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  // ─── Assign rider ──────────────────────────────────────────────────────────
  const handleAssignRider = async () => {
    if (!assigningOrder || !selectedRider) return;
    setAssigningRider(true);
    const { error } = await supabase
      .from('orders')
      .update({
        rider_id: selectedRider,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      })
      .eq('id', assigningOrder.id);

    if (error) {
      toast.error('Failed to assign rider');
    } else {
      toast.success('Rider assigned successfully!');
      setAssigningOrder(null);
      setSelectedRider(null);
      await loadOrders();
    }
    setAssigningRider(false);
  };

  // ─── Cancel order ──────────────────────────────────────────────────────────
  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrder(orderId);
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: 'Cancelled by admin',
      })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to cancel order');
    } else {
      toast.success('Order cancelled');
      await loadOrders();
    }
    setCancellingOrder(null);
  };

  // ─── Filter orders ─────────────────────────────────────────────────────────
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch = !searchQuery
      || o.order_number.toLowerCase().includes(searchQuery.toLowerCase())
      || o.delivery_address.toLowerCase().includes(searchQuery.toLowerCase())
      || o.station_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-brand-deep-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 py-5 pb-28">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <GlassCard className="p-5 bg-gradient-to-br from-brand-deep-blue/5 to-brand-energy-orange/5 border-brand-deep-blue/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue to-brand-corporate-blue rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Operations control centre</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString('en-GH', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Live · All systems operational</span>
          </div>
        </div>
      </GlassCard>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
        {(['overview', 'orders', 'riders'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Overview tab ─────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<Package className="w-5 h-5 text-white" />} color="from-brand-deep-blue to-brand-corporate-blue"
              label="Today's Orders" value={stats.orders.toString()} />
            <StatCard icon={<DollarSign className="w-5 h-5 text-white" />} color="from-emerald-500 to-emerald-600"
              label="Revenue" value={`GH₵${stats.revenue.toFixed(0)}`} />
            <StatCard icon={<Clock className="w-5 h-5 text-white" />} color="from-amber-400 to-orange-500"
              label="Pending" value={stats.pendingOrders.toString()} />
            <StatCard icon={<Users className="w-5 h-5 text-white" />} color="from-purple-500 to-purple-600"
              label="Active Riders" value={stats.activeRiders.toString()} />
          </div>

          {/* Recent orders */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">Recent Orders</h2>
              <button onClick={() => setTab('orders')} className="text-xs text-brand-deep-blue font-semibold">View all</button>
            </div>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  riders={riders}
                  onAssign={setAssigningOrder}
                  onCancel={handleCancelOrder}
                  isCancelling={cancellingOrder === order.id}
                />
              ))}
              {orders.length === 0 && (
                <GlassCard className="p-8 text-center">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No orders yet</p>
                </GlassCard>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Orders tab ───────────────────────────────────────────────────────── */}
      {tab === 'orders' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order #, address, station…"
              className="input-field pl-10"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {ORDER_STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  statusFilter === f.value
                    ? 'bg-brand-deep-blue text-white border-brand-deep-blue'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-deep-blue/30'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</p>

          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                riders={riders}
                onAssign={setAssigningOrder}
                onCancel={handleCancelOrder}
                isCancelling={cancellingOrder === order.id}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Riders tab ───────────────────────────────────────────────────────── */}
      {tab === 'riders' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <p className="text-xs text-gray-500">{riders.length} registered riders · {stats.activeRiders} online</p>
          {riders.map((rider) => (
            <GlassCard key={rider.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-deep-blue to-brand-energy-orange flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{(rider.name || 'R').charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{rider.name || 'Unnamed Rider'}</p>
                    <p className="text-xs text-gray-500">{rider.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    rider.is_online ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${rider.is_online ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {rider.is_online ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
          {riders.length === 0 && (
            <GlassCard className="p-8 text-center">
              <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No riders registered yet</p>
            </GlassCard>
          )}
        </motion.div>
      )}

      {/* ── Assign Rider Modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {assigningOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 flex items-end"
            onClick={() => setAssigningOrder(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl p-6 max-h-[75vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Assign Rider</h3>
                  <p className="text-xs text-gray-500">Order #{assigningOrder.order_number}</p>
                </div>
                <button onClick={() => setAssigningOrder(null)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-2 mb-5">
                {riders
                  .filter((r) => r.is_online)
                  .map((rider) => (
                    <button
                      key={rider.id}
                      onClick={() => setSelectedRider(rider.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                        selectedRider === rider.id
                          ? 'border-brand-deep-blue bg-brand-deep-blue/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-deep-blue to-brand-energy-orange flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{(rider.name || 'R').charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 text-sm">{rider.name || 'Rider'}</p>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <p className="text-xs text-emerald-600">Online</p>
                          </div>
                        </div>
                      </div>
                      {selectedRider === rider.id && <UserCheck className="w-5 h-5 text-brand-deep-blue" />}
                    </button>
                  ))}
                {riders.filter((r) => r.is_online).length === 0 && (
                  <div className="text-center py-6">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No riders online</p>
                  </div>
                )}
              </div>

              <PrimaryButton
                fullWidth
                size="lg"
                onClick={handleAssignRider}
                loading={assigningRider}
                disabled={!selectedRider || assigningRider}
              >
                <UserCheck className="w-5 h-5" />
                Assign Rider
              </PrimaryButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon, color, label, value }: { icon: React.ReactNode; color: string; label: string; value: string }) {
  return (
    <GlassCard className="p-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-md`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </GlassCard>
  );
}

function OrderRow({
  order, riders, onAssign, onCancel, isCancelling,
}: {
  order: Order;
  riders: Profile[];
  onAssign: (o: Order) => void;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}) {
  const assignedRider = riders.find((r) => r.id === order.rider_id);
  const canAssign = ['confirmed'].includes(order.status) && !order.rider_id;
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-brand-energy-orange" />
            <span className="font-bold text-gray-900 text-sm">#{order.order_number}</span>
          </div>
          <p className="text-xs text-gray-500">{order.cylinder_name} · {order.station_name}</p>
        </div>
        <StatusBadge status={order.status as any} />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">{order.delivery_address}</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400">Total</p>
          <p className="font-bold text-gray-900 text-sm">GH₵{order.total.toFixed(2)}</p>
        </div>

        <div className="flex items-center gap-2">
          {assignedRider && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">{assignedRider.name || 'Rider'}</span>
            </div>
          )}
          {canAssign && (
            <PrimaryButton size="sm" onClick={() => onAssign(order)}>
              Assign Rider
            </PrimaryButton>
          )}
          {canCancel && (
            <button
              onClick={() => onCancel(order.id)}
              disabled={isCancelling}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
            >
              {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
