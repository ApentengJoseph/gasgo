'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import StatusBadge from '@/components/Badges/StatusBadge';
import MapView from '@/components/Map/MapView';
import { ArrowLeft, MapPin, Phone, Clock, Flame, User, DollarSign, Navigation, Copy, Check, ExternalLink, Route, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock order data - replace with API call
const mockOrder = {
  id: 'GAS12345',
  status: 'at_station' as const,
  size: '12kg',
  customerName: 'Kwame Mensah',
  customerPhone: '+233 XX XXX XXXX',
  customerLocation: 'East Legon, Accra',
  customerLat: 5.6037,
  customerLng: -0.1870,
  stationName: 'GasPro Station',
  stationAddress: '123 Main Street, Koforidua',
  stationLat: 6.0833,
  stationLng: -0.2500,
  earnings: 45.50,
  createdAt: '2024-01-16T10:30:00',
  deliveryInstructions: 'Leave at gate, call when you arrive',
};

export default function RiderOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [order] = useState(mockOrder); // Replace with API call
  const [copiedAddress, setCopiedAddress] = useState<'station' | 'customer' | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Fallback to station location
          setCurrentLocation({
            lat: order.stationLat,
            lng: order.stationLng,
          });
        }
      );
    }
  }, [order.stationLat, order.stationLng]);

  const copyToClipboard = async (text: string, type: 'station' | 'customer') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openInGoogleMaps = (lat: number, lng: number, label: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(label)}`;
    window.open(url, '_blank');
  };

  const openDirections = (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
    const url = `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`;
    window.open(url, '_blank');
  };

  const getStatusAction = (status: string) => {
    switch (status) {
      case 'assigned':
        return { 
          label: 'Start Journey to Station', 
          variant: 'energy' as const, 
          action: () => {
            if (currentLocation) {
              openDirections(currentLocation.lat, currentLocation.lng, order.stationLat, order.stationLng);
            }
          }
        };
      case 'at_station':
        return { label: 'Collect Cylinder', variant: 'energy' as const, action: () => {} };
      case 'collected':
        return { 
          label: 'Start Delivery', 
          variant: 'energy' as const, 
          action: () => {
            openDirections(order.stationLat, order.stationLng, order.customerLat, order.customerLng);
          }
        };
      case 'on_the_way':
        return { 
          label: 'View Route', 
          variant: 'secondary' as const, 
          action: () => {
            if (currentLocation) {
              openDirections(currentLocation.lat, currentLocation.lng, order.customerLat, order.customerLng);
            }
          }
        };
      case 'arriving_soon':
        return { label: 'Mark as Arrived', variant: 'energy' as const, action: () => {} };
      default:
        return { label: 'View Details', variant: 'secondary' as const, action: () => {} };
    }
  };

  const action = getStatusAction(order.status);

  // Determine which location to show based on status
  const getCurrentDestination = () => {
    if (order.status === 'assigned' || order.status === 'at_station') {
      return {
        lat: order.stationLat,
        lng: order.stationLng,
        label: order.stationName,
        address: order.stationAddress,
      };
    }
    return {
      lat: order.customerLat,
      lng: order.customerLng,
      label: order.customerLocation,
      address: order.customerLocation,
    };
  };

  const destination = getCurrentDestination();

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-display-sm font-bold text-gray-900">Order Details</h1>
          <p className="text-sm text-gray-500">#{orderId}</p>
        </div>
        <StatusBadge status={order.status} />
      </motion.div>

      {/* Order Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-6 bg-gradient-to-br from-brand-deep-blue/5 via-white to-brand-energy-orange/5 border-brand-deep-blue/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-energy-orange to-brand-energy-orange/70 rounded-xl flex items-center justify-center shadow-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-title-md font-bold text-gray-900">{order.size} Cylinder</h2>
              <p className="text-sm text-gray-600">{order.stationName}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Earnings</span>
              <span className="text-xl font-bold text-brand-safety-green">GH₵{order.earnings.toFixed(2)}</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Customer Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-brand-deep-blue" />
            </div>
            <h2 className="text-title-md font-bold text-gray-900">Customer</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <a 
                href={`tel:${order.customerPhone}`}
                className="hover:text-brand-deep-blue transition-colors"
              >
                {order.customerPhone}
              </a>
            </div>
            {order.deliveryInstructions && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Delivery Instructions</p>
                <p className="text-sm text-gray-700">{order.deliveryInstructions}</p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Map with Directions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-brand-deep-blue/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center">
                  <Map className="w-5 h-5 text-brand-deep-blue" />
                </div>
                <div>
                  <h2 className="text-title-sm font-bold text-gray-900">
                    {order.status === 'assigned' || order.status === 'at_station' 
                      ? 'Route to Station' 
                      : 'Route to Customer'}
                  </h2>
                  <p className="text-xs text-gray-500">{destination.label}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMap(!showMap)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {showMap ? (
                  <MapPin className="w-5 h-5 text-gray-600" />
                ) : (
                  <Map className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showMap && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="h-64 sm:h-80">
                  <MapView
                    center={destination}
                    markers={[
                      {
                        id: 'station',
                        position: { lat: order.stationLat, lng: order.stationLng },
                        label: order.stationName,
                      },
                      {
                        id: 'customer',
                        position: { lat: order.customerLat, lng: order.customerLng },
                        label: order.customerName,
                      },
                    ]}
                    zoom={13}
                    height="100%"
                    className="rounded-b-2xl"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Actions */}
          <div className="p-4 space-y-2 border-t border-gray-200/50">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (currentLocation) {
                    openDirections(
                      currentLocation.lat,
                      currentLocation.lng,
                      destination.lat,
                      destination.lng
                    );
                  } else {
                    openInGoogleMaps(destination.lat, destination.lng, destination.label);
                  }
                }}
                className="flex-1 px-4 py-3 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span className="hidden xs:inline">Get Directions</span>
                <span className="xs:hidden">Directions</span>
              </button>
              <button
                onClick={() => {
                  const addressText = `${destination.label}\n${destination.address}`;
                  copyToClipboard(addressText, order.status === 'assigned' || order.status === 'at_station' ? 'station' : 'customer');
                }}
                className="flex-1 px-4 py-3 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {copiedAddress === (order.status === 'assigned' || order.status === 'at_station' ? 'station' : 'customer') ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="hidden xs:inline">Copied!</span>
                    <span className="xs:hidden">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="hidden xs:inline">Copy Address</span>
                    <span className="xs:hidden">Copy</span>
                  </>
                )}
              </button>
            </div>
            <button
              onClick={() => openInGoogleMaps(destination.lat, destination.lng, destination.label)}
              className="w-full px-4 py-3 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden xs:inline">Open in Google Maps</span>
              <span className="xs:hidden">Open Maps</span>
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Station Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-brand-energy-orange" />
              </div>
              <h2 className="text-title-md font-bold text-gray-900">Station</h2>
            </div>
            <button
              onClick={() => {
                const stationText = `${order.stationName}\n${order.stationAddress}`;
                copyToClipboard(stationText, 'station');
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {copiedAddress === 'station' ? (
                <Check className="w-4 h-4 text-brand-safety-green" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{order.stationName}</p>
              <p className="text-sm text-gray-600 mt-1">{order.stationAddress}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (currentLocation) {
                    openDirections(currentLocation.lat, currentLocation.lng, order.stationLat, order.stationLng);
                  } else {
                    openInGoogleMaps(order.stationLat, order.stationLng, order.stationName);
                  }
                }}
                className="flex-1 px-4 py-3 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Navigate
              </button>
              <button
                onClick={() => openInGoogleMaps(order.stationLat, order.stationLng, order.stationName)}
                className="flex-1 px-4 py-3 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Maps
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Customer Location - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-brand-deep-blue" />
              </div>
              <h2 className="text-title-md font-bold text-gray-900">Delivery Address</h2>
            </div>
            <button
              onClick={() => {
                const customerText = `${order.customerName}\n${order.customerLocation}`;
                copyToClipboard(customerText, 'customer');
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {copiedAddress === 'customer' ? (
                <Check className="w-4 h-4 text-brand-safety-green" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
              <p className="text-sm text-gray-600 mt-1">{order.customerLocation}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (currentLocation) {
                    openDirections(currentLocation.lat, currentLocation.lng, order.customerLat, order.customerLng);
                  } else {
                    openInGoogleMaps(order.customerLat, order.customerLng, order.customerLocation);
                  }
                }}
                className="flex-1 px-4 py-3 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Navigate
              </button>
              <button
                onClick={() => openInGoogleMaps(order.customerLat, order.customerLng, order.customerLocation)}
                className="flex-1 px-4 py-3 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Maps
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <button
          onClick={action.action}
          className="w-full px-6 py-3 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          {action.label}
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              window.location.href = `tel:${order.customerPhone}`;
            }}
            className="w-full px-4 py-3 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden xs:inline">Call</span>
          </button>
          <button
            onClick={() => {
              window.location.href = `sms:${order.customerPhone}`;
            }}
            className="w-full px-4 py-3 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            <span className="hidden xs:inline">Message</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
