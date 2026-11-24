'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, DollarSign, Clock, MapPin, Star, CheckCircle,
  Flame, Power, TrendingUp, Navigation, Phone, AlertTriangle,
  ChevronRight, Loader2, X, Bell, Package,
  Navigation2, CreditCard, ShoppingBag, LucideIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import StatusBadge from '@/components/Badges/StatusBadge';
import { createClient } from '@/lib/supabase/client';
import { notifyOrderStatusChange } from '@/lib/utils/notifications';
import type { Order, Profile, OrderStatus } from '@/lib/types/database';

type OrderWithDistance = Order & { distanceKm?: number };

// Next status for each rider action
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  assigned:   'collected',   // picked up the empty cylinder at the customer's home
  collected:  'at_station',  // at the station, refilling
  at_station: 'on_the_way',  // refilled, bringing it back
  on_the_way: 'arriving',
  arriving:   'delivered',
};

const STATUS_ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  assigned:   'Picked up empty cylinder',
  collected:  'Arrived at station',
  at_station: 'Refilled · heading back',
  on_the_way: 'Mark Arriving Soon',
  arriving:   'Confirm Delivery',
};

const STATUS_ICONS: Partial<Record<OrderStatus, LucideIcon>> = {
  assigned:   Navigation2,
  at_station: Flame,
  collected:  Package,
  on_the_way: Truck,
  arriving:   MapPin,
  delivered:  CheckCircle,
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function RiderDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeOrders, setActiveOrders] = useState<OrderWithDistance[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDistance | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [acceptingOrder, setAcceptingOrder] = useState<string | null>(null);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState(false);

  const geoWatchRef = useRef<number | null>(null);
  const broadcastIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevHeadingRef = useRef<number>(0);
  const prevPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const todayStats = {
    earnings: activeOrders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + o.total * 0.15, 0), // Rider gets 15%
    completed: activeOrders.filter((o) => o.status === 'delivered').length,
    active: activeOrders.filter((o) => o.status !== 'delivered').length,
  };

  // ─── Load rider profile ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth/login'); return; }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!prof || prof.role !== 'rider') {
        toast.error('Access denied. Rider accounts only.');
        router.replace('/');
        return;
      }
      setProfile(prof);
      setIsOnline(prof.is_online ?? false);
      setLoading(false);
    };
    load();
  }, [supabase, router]);

  // ─── Load rider's active orders ────────────────────────────────────────────
  const loadActiveOrders = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('rider_id', profile.id)
      .not('status', 'in', '("delivered","cancelled")')
      .order('created_at', { ascending: false });
    if (data) setActiveOrders(data);
  }, [profile, supabase]);

  // ─── Load available (confirmed, unassigned) orders ─────────────────────────
  const loadPendingOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'confirmed')
      .is('rider_id', null)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setPendingOrders(data);
  }, [supabase]);

  useEffect(() => {
    if (!profile) return;
    loadActiveOrders();
    loadPendingOrders();
  }, [profile, loadActiveOrders, loadPendingOrders]);

  // ─── Supabase Realtime: watch for new confirmed orders ─────────────────────
  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel('rider-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new as Order;
        if (newOrder.status === 'confirmed' && !newOrder.rider_id && isOnline) {
          setPendingOrders((prev) => [newOrder, ...prev]);
          toast('📦 New order available!', { icon: '🛵', duration: 6000 });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `rider_id=eq.${profile.id}` }, (payload) => {
        const updated = payload.new as Order;
        setActiveOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile, supabase, isOnline]);

  // ─── Geolocation: watch & broadcast position ───────────────────────────────
  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }

    geoWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = { lat: latitude, lng: longitude };
        setCurrentPos(newPos);
        setLocationError(false);

        // Calculate heading from previous position
        let heading = prevHeadingRef.current;
        if (prevPosRef.current) {
          const dLng = (longitude - prevPosRef.current.lng) * Math.PI / 180;
          const lat1 = prevPosRef.current.lat * Math.PI / 180;
          const lat2 = latitude * Math.PI / 180;
          const y = Math.sin(dLng) * Math.cos(lat2);
          const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
          heading = ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
          prevHeadingRef.current = heading;
        }
        prevPosRef.current = newPos;
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocationError(true);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  }, []);

  // Broadcast position to all active orders every 5s
  useEffect(() => {
    if (!profile || !isOnline || !currentPos) return;

    const broadcast = async () => {
      if (!currentPos || !profile) return;
      const orderIds = activeOrders
        .filter((o) => ['assigned', 'at_station', 'collected', 'on_the_way', 'arriving'].includes(o.status))
        .map((o) => o.id);

      if (orderIds.length === 0) return;

      await supabase
        .from('orders')
        .update({
          rider_lat: currentPos.lat,
          rider_lng: currentPos.lng,
          rider_heading: prevHeadingRef.current,
        })
        .in('id', orderIds);

      // Also update profile location
      await supabase
        .from('profiles')
        .update({ current_lat: currentPos.lat, current_lng: currentPos.lng })
        .eq('id', profile.id);
    };

    broadcast();
    broadcastIntervalRef.current = setInterval(broadcast, 5000);
    return () => { if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current); };
  }, [profile, isOnline, currentPos, activeOrders, supabase]);

  // ─── Toggle online status ──────────────────────────────────────────────────
  const handleToggleOnline = async () => {
    if (!profile) return;
    setTogglingOnline(true);

    const newOnlineState = !isOnline;

    if (newOnlineState) {
      startLocationTracking();
      toast.success('You are now online and accepting orders');
    } else {
      if (geoWatchRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchRef.current);
        geoWatchRef.current = null;
      }
      if (broadcastIntervalRef.current) {
        clearInterval(broadcastIntervalRef.current);
        broadcastIntervalRef.current = null;
      }
      toast('You are now offline', { icon: '😴' });
    }

    await supabase.from('profiles').update({ is_online: newOnlineState }).eq('id', profile.id);
    setIsOnline(newOnlineState);
    setTogglingOnline(false);
  };

  // ─── Accept an available order ─────────────────────────────────────────────
  const handleAcceptOrder = async (order: Order) => {
    if (!profile) return;
    setAcceptingOrder(order.id);

    const claim = (withContact: boolean) => supabase
      .from('orders')
      .update({
        rider_id: profile.id,
        ...(withContact ? { rider_name: profile.name ?? null, rider_phone: profile.phone ?? null } : {}),
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .is('rider_id', null) // Optimistic lock — prevents double-accept
      .select('id');
    let { data: claimed, error } = await claim(true);
    if (error && (error.code === 'PGRST204' || error.code === '42703')) ({ data: claimed, error } = await claim(false));

    // An update blocked by row-level security returns no error, just no rows
    if (error || !claimed?.length) {
      toast.error('Order was taken by another rider');
    } else {
      toast.success('Order accepted!');
      setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
      await loadActiveOrders();
    }
    setAcceptingOrder(null);
  };

  // ─── Accept a batch of nearby pickups in one go ────────────────────────────
  const handleAcceptBatch = async (batch: Order[]) => {
    for (const o of batch) await handleAcceptOrder(o);
  };

  // ─── Advance order status ──────────────────────────────────────────────────
  const handleAdvanceStatus = async (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdatingStatus(order.id);

    const timestampField = `${next}_at`;
    const { error } = await supabase
      .from('orders')
      .update({
        status: next,
        [timestampField]: new Date().toISOString(),
        ...(next === 'on_the_way' && currentPos ? { rider_lat: currentPos.lat, rider_lng: currentPos.lng } : {}),
      })
      .eq('id', order.id);

    if (error) {
      toast.error('Failed to update order status');
    } else {
      toast.success(`Status updated: ${next.replace(/_/g, ' ')}`);
      // Notify customer
      if (order.user_id) {
        notifyOrderStatusChange(order.user_id, order.id, order.order_number, next).catch(() => {});
      }
      await loadActiveOrders();
      if (next === 'delivered') setSelectedOrder(null);
    }
    setUpdatingStatus(null);
  };

  // ─── Open Google Maps navigation ───────────────────────────────────────────
  const openNavigation = (destLat: number, destLng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (geoWatchRef.current !== null) navigator.geolocation.clearWatch(geoWatchRef.current);
      if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-brand-deep-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 py-5 pb-28">
      {/* ── Header card ──────────────────────────────────────────────────────── */}
      <GlassCard className="p-5 bg-gradient-to-br from-brand-deep-blue/5 to-brand-energy-orange/5 border-brand-deep-blue/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-deep-blue to-brand-energy-orange flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">
                {(profile?.name || 'R').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{profile?.name || 'Rider Dashboard'}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-xs text-gray-500">{isOnline ? 'Online · Accepting orders' : 'Offline'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleToggleOnline}
            disabled={togglingOnline}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
              isOnline
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {togglingOnline ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Power className="w-4 h-4" />
            )}
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Location error warning */}
        {isOnline && locationError && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700">Location unavailable. Customers cannot track you until GPS is enabled.</p>
          </div>
        )}
      </GlassCard>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-4 text-center">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">GH₵{todayStats.earnings.toFixed(0)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Today&apos;s earnings</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Truck className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{todayStats.active}</p>
          <p className="text-xs text-gray-500 mt-0.5">Active</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{todayStats.completed}</p>
          <p className="text-xs text-gray-500 mt-0.5">Completed</p>
        </GlassCard>
      </div>

      {/* ── Active orders ─────────────────────────────────────────────────────── */}
      {activeOrders.filter((o) => o.status !== 'delivered').length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">Active Orders</h2>
          <div className="space-y-3">
            {activeOrders
              .filter((o) => o.status !== 'delivered')
              .map((order) => (
                <ActiveOrderCard
                  key={order.id}
                  order={order}
                  onAdvance={handleAdvanceStatus}
                  onNavigate={openNavigation}
                  isUpdating={updatingStatus === order.id}
                  onSelect={setSelectedOrder}
                />
              ))}
          </div>
        </div>
      )}

      {/* ── Available orders (pending pickup) ────────────────────────────────── */}
      {isOnline && pendingOrders.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-brand-energy-orange" />
            <h2 className="text-base font-bold text-gray-900">Available Orders</h2>
            <span className="px-2 py-0.5 rounded-full bg-brand-energy-orange/10 text-brand-energy-orange text-xs font-bold">{pendingOrders.length}</span>
          </div>
          {nearbyBatches(pendingOrders).map(batch => {
            const cylinders = batch.reduce((n, o) => n + (Number(o.quantity) || 1), 0);
            const area = batch[0].delivery_address.split(',')[0];
            return (
              <div key={batch.map(o => o.id).join()} className="mb-3 rounded-2xl p-4 text-white" style={{ background: 'radial-gradient(60% 80% at 100% 0%, rgba(255,107,0,0.35), transparent 70%), linear-gradient(150deg,#17130F,#2A231C)' }}>
                <p className="text-xs font-bold uppercase tracking-wider text-[#FFB27A]">Nearby pickups · one trip</p>
                <p className="mt-1 text-lg font-bold">{batch.length} homes near {area}</p>
                <p className="text-sm text-white/70">{cylinders} cylinders · within {BATCH_KM} km of each other</p>
                <button
                  onClick={() => handleAcceptBatch(batch)}
                  disabled={!!acceptingOrder}
                  className="mt-3 w-full h-11 rounded-full font-bold text-sm text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(120deg,#FF6B00,#FF8A3D)' }}
                >
                  Accept all {batch.length}
                </button>
              </div>
            );
          })}
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <AvailableOrderCard
                key={order.id}
                order={order}
                onAccept={handleAcceptOrder}
                isAccepting={acceptingOrder === order.id}
                currentPos={currentPos}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────────── */}
      {activeOrders.filter((o) => o.status !== 'delivered').length === 0 && (
        <div className="card p-8 text-center">
          <div className="icon-box icon-box-xl mx-auto mb-4" style={{ background: isOnline ? 'rgba(255,107,0,0.08)' : 'rgba(90,99,114,0.08)', width: 72, height: 72, borderRadius: 22 }}>
            <Truck className="w-8 h-8" style={{ color: isOnline ? '#FF6B00' : '#6B6259' }} />
          </div>
          <h3 className="font-bold text-[1.125rem] mb-1" style={{ color: '#17130F' }}>
            {isOnline ? 'No active orders' : 'You are offline'}
          </h3>
          <p className="text-[0.875rem] mb-5" style={{ color: '#A39789' }}>
            {isOnline
              ? 'New orders will appear here when customers place them.'
              : 'Go online to start accepting deliveries.'}
          </p>
          {!isOnline && (
            <PrimaryButton variant="energy" onClick={handleToggleOnline} loading={togglingOnline}>
              <Power className="w-4 h-4" />
              Go Online
            </PrimaryButton>
          )}
        </div>
      )}

      {/* ── Order detail sheet ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 flex items-end"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Order #{selectedOrder.order_number}</h3>
                <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Item</span><span className="font-semibold">{selectedOrder.cylinder_name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Station</span><span className="font-semibold">{selectedOrder.station_name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Your earning</span><span className="font-bold text-emerald-600">GH₵{(selectedOrder.total * 0.15).toFixed(2)}</span></div>
                <div className="pt-2 border-t">
                  <p className="text-gray-500 mb-1">Delivery address</p>
                  <p className="font-semibold">{selectedOrder.delivery_address}</p>
                </div>
                {(selectedOrder as any).contact_phone && (
                  <div className="flex items-center gap-3 rounded-2xl bg-[#FFF8F0] border border-[#EFE7DE] p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-500 text-xs">Customer</p>
                      <p className="font-semibold truncate">{(selectedOrder as any).contact_name || 'Customer'}</p>
                    </div>
                    <a href={`https://wa.me/${String((selectedOrder as any).contact_phone).replace(/\D/g, '').replace(/^0/, '233')}`} target="_blank" rel="noopener noreferrer"
                      className="h-10 px-3 rounded-full bg-[#E8F6EC] text-[#15803D] font-semibold text-xs inline-flex items-center">WhatsApp</a>
                    <a href={`tel:${(selectedOrder as any).contact_phone}`}
                      className="h-10 px-4 rounded-full bg-[#17130F] text-white font-semibold text-xs inline-flex items-center">Call</a>
                  </div>
                )}
                {selectedOrder.delivery_notes && (
                  <div>
                    <p className="text-gray-500 mb-1">Notes</p>
                    <p className="italic text-gray-700">{selectedOrder.delivery_notes}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <button
                  onClick={() => openNavigation(selectedOrder.delivery_lat, selectedOrder.delivery_lng)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-50 text-orange-700 font-semibold text-sm border border-orange-200"
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </button>
                {NEXT_STATUS[selectedOrder.status] && (
                  <PrimaryButton
                    variant="energy"
                    onClick={() => { handleAdvanceStatus(selectedOrder); setSelectedOrder(null); }}
                    loading={updatingStatus === selectedOrder.id}
                  >
                    {STATUS_ACTION_LABELS[selectedOrder.status] || 'Update'}
                  </PrimaryButton>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Nearby pickups: orders within BATCH_KM of each other can go in one trip ───
const BATCH_KM = 1.2;
function distKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, r = (d: number) => d * Math.PI / 180;
  const x = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
function nearbyBatches(orders: Order[]): Order[][] {
  const left = [...orders];
  const batches: Order[][] = [];
  while (left.length) {
    const seed = left.shift()!;
    const group = [seed];
    for (let i = left.length - 1; i >= 0; i--) {
      const o = left[i];
      if (distKm({ lat: seed.delivery_lat, lng: seed.delivery_lng }, { lat: o.delivery_lat, lng: o.delivery_lng }) <= BATCH_KM) {
        group.push(o); left.splice(i, 1);
      }
    }
    if (group.length > 1) batches.push(group);
  }
  return batches;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ActiveOrderCard({
  order, onAdvance, onNavigate, isUpdating, onSelect,
}: {
  order: OrderWithDistance;
  onAdvance: (o: Order) => void;
  onNavigate: (lat: number, lng: number) => void;
  isUpdating: boolean;
  onSelect: (o: OrderWithDistance) => void;
}) {
  const nextStatus = NEXT_STATUS[order.status];
  const navTarget = order.status === 'assigned' || order.status === 'at_station'
    ? null  // show station coords if we had them
    : { lat: order.delivery_lat, lng: order.delivery_lng };

  return (
    <GlassCard className="p-4 border-brand-deep-blue/10 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {(() => { const I = STATUS_ICONS[order.status] || Package; return <I className="w-4 h-4 text-[#17130F]" />; })()}
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

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mb-3">
        <div>
          <p className="text-xs text-gray-400">Earning</p>
          <p className="font-bold text-emerald-600 text-sm">GH₵{(order.total * 0.15).toFixed(2)}</p>
        </div>
        <button onClick={() => onSelect(order)} className="text-xs text-brand-deep-blue font-semibold flex items-center gap-1">
          View details <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex gap-2">
        {navTarget && (
          <button
            onClick={() => onNavigate(navTarget.lat, navTarget.lng)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-orange-50 text-orange-700 font-semibold text-sm border border-orange-200 active:scale-95 transition-all"
          >
            <Navigation className="w-4 h-4" />
            Navigate
          </button>
        )}
        {nextStatus && (
          <PrimaryButton
            size="sm"
            variant="energy"
            className="flex-1"
            onClick={() => onAdvance(order)}
            loading={isUpdating}
            disabled={isUpdating}
          >
            {STATUS_ACTION_LABELS[order.status] || 'Update Status'}
          </PrimaryButton>
        )}
      </div>
    </GlassCard>
  );
}

function AvailableOrderCard({
  order, onAccept, isAccepting, currentPos,
}: {
  order: Order;
  onAccept: (o: Order) => void;
  isAccepting: boolean;
  currentPos: { lat: number; lng: number } | null;
}) {
  const distKm = currentPos
    ? Math.round(haversineKm(currentPos.lat, currentPos.lng, order.delivery_lat, order.delivery_lng) * 10) / 10
    : null;

  const earning = (order.total * 0.15).toFixed(2);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard className="p-4 border-brand-energy-orange/20 bg-gradient-to-br from-orange-50/50 to-white shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-bold text-gray-900 text-sm">#{order.order_number}</p>
            <p className="text-xs text-gray-500">{order.cylinder_name} · {order.station_name}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-emerald-600">GH₵{earning}</p>
            {distKm !== null && <p className="text-xs text-gray-400">{distKm} km away</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{order.delivery_address}</span>
        </div>
        <PrimaryButton
          fullWidth
          variant="energy"
          size="sm"
          onClick={() => onAccept(order)}
          loading={isAccepting}
          disabled={isAccepting}
        >
          Accept Order
        </PrimaryButton>
      </GlassCard>
    </motion.div>
  );
}
