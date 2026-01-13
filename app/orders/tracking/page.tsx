'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import StatusBadge from '@/components/Badges/StatusBadge';
import RatingModal from '@/components/Rating/RatingModal';
import StarRating from '@/components/Rating/StarRating';
import { Truck, Phone, MessageSquare, Shield, CheckCircle, Star, Loader2, MapPin } from 'lucide-react';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import LiveTrackingMap from '@/components/Map/LiveTrackingMap';
import { motion } from 'framer-motion';
import { calculateDeliveryETA, formatDuration, DeliveryRoute } from '@/lib/utils/delivery';

const orderSteps = [
  { id: 1, label: 'Order Placed', time: '10:30 AM', completed: true },
  { id: 2, label: 'Payment Confirmed', time: '10:31 AM', completed: true },
  { id: 3, label: 'Rider Assigned', time: '10:35 AM', completed: true },
  { id: 4, label: 'At Station', time: '10:45 AM', completed: true },
  { id: 5, label: 'On the way', time: '11:00 AM', completed: true, current: true },
  { id: 6, label: 'Arriving Soon', time: '11:15 AM', completed: false },
  { id: 7, label: 'Delivered', time: '', completed: false },
  { id: 8, label: 'Confirmed', time: '', completed: false },
];

export default function TrackingPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'GAS12345';
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [deliveryRoute, setDeliveryRoute] = useState<DeliveryRoute | null>(null);
  const [calculatingETA, setCalculatingETA] = useState(true);
  const [riderPosition, setRiderPosition] = useState({ lat: 6.0850, lng: -0.2520 });
  const riderPositionRef = useRef(riderPosition);
  
  // Keep ref in sync with state
  useEffect(() => {
    riderPositionRef.current = riderPosition;
  }, [riderPosition]);
  
  // Mock order data - in production, fetch from API
  const orderData = {
    id: orderId,
    status: orderId === 'GAS12345' ? 'delivered' : 'on_the_way',
    stationName: 'GasPro Station',
    stationId: '1',
    rating: orderId === 'GAS12345' ? 5 : null,
    size: '12kg',
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    // In production, save to backend
    console.log('Rating submitted:', { rating, comment, orderId, stationId: orderData.stationId });
    // Show success message
    alert('Thank you for your feedback!');
  };

  // Koforidua coordinates for tracking
  const stationPosition = { lat: 6.0920, lng: -0.2580 }; // GasPro Station
  const destinationPosition = { lat: 6.0833, lng: -0.2500 }; // Customer location

  // Calculate real-time ETA using Google Maps API
  // Only calculate on mount and periodically, not on every position change
  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const calculateETA = async () => {
      if (!isMounted) return;
      
      setCalculatingETA(true);
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
                     process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || 
                     '';

      try {
        // Wait a bit for Google Maps to load if needed
        let attempts = 0;
        const maxAttempts = 10;
        
        const waitForGoogleMaps = (): Promise<boolean> => {
          return new Promise((resolve) => {
            const check = () => {
              if (!isMounted) {
                resolve(false);
                return;
              }
              if (typeof window !== 'undefined' && (window as any).google) {
                resolve(true);
              } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(check, 500);
              } else {
                resolve(false);
              }
            };
            check();
          });
        };

        const hasGoogleMaps = await waitForGoogleMaps();
        // Get current rider position from ref (always up-to-date)
        const currentRiderPos = riderPositionRef.current;
        const route = await calculateDeliveryETA(
          currentRiderPos,
          stationPosition,
          destinationPosition,
          hasGoogleMaps && apiKey ? apiKey : ''
        );
        
        if (isMounted) {
          setDeliveryRoute(route);
        }
      } catch (error) {
        console.error('Error calculating ETA:', error);
        if (isMounted) {
          // Use fallback
          const currentRiderPos = riderPositionRef.current;
          const route = await calculateDeliveryETA(
            currentRiderPos,
            stationPosition,
            destinationPosition,
            ''
          );
          setDeliveryRoute(route);
        }
      } finally {
        if (isMounted) {
          setCalculatingETA(false);
        }
      }
    };

    // Initial calculation
    calculateETA();

    // Recalculate ETA every 30 seconds (not on every position change to avoid infinite loop)
    intervalId = setInterval(() => {
      calculateETA();
    }, 30000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount, then use interval for updates (riderPosition is captured in closure)

  return (
    <div className="space-y-6 py-6">
      {/* Map Container with Live Tracking - Uber/Bolt Style */}
      <div className="relative">
        <LiveTrackingMap
          stationPosition={stationPosition}
          riderPosition={riderPosition}
          destinationPosition={destinationPosition}
          height="400px"
          onRiderPositionChange={(newPosition) => {
            // Update ref for ETA calculation without causing re-renders
            riderPositionRef.current = newPosition;
            // Only update state occasionally to avoid infinite loops
            setRiderPosition(prev => {
              // Only update if position changed significantly (more than 50 meters)
              const latDiff = Math.abs(newPosition.lat - prev.lat);
              const lngDiff = Math.abs(newPosition.lng - prev.lng);
              if (latDiff > 0.0005 || lngDiff > 0.0005) {
                return newPosition;
              }
              return prev;
            });
          }}
        />
        
        {/* ETA Overlay - Real-time calculation */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <GlassCard className="p-4 bg-white/95 backdrop-blur-sm border border-white/20">
            {calculatingETA ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 text-brand-deep-blue animate-spin" />
                <p className="text-sm text-gray-600">Calculating ETA...</p>
              </div>
            ) : deliveryRoute ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-deep-blue" />
                    <div>
                      <p className="text-xs text-gray-500">Estimated Arrival</p>
                      <p className="text-lg font-bold text-brand-deep-blue">
                        {formatDuration(deliveryRoute.total.duration)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Distance</p>
                    <p className="text-lg font-bold text-gray-900">
                      {deliveryRoute.total.distance} km
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200/50">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Rider → Station: {deliveryRoute.riderToStation.distance} km ({formatDuration(deliveryRoute.riderToStation.duration)})</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Station → You: {deliveryRoute.stationToCustomer.distance} km ({formatDuration(deliveryRoute.stationToCustomer.duration)})
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600">Unable to calculate ETA</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Order Details */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-title-md font-bold text-gray-900">Order #{orderId}</h2>
            <p className="text-gray-500">{orderData.size} Gas Cylinder</p>
            {orderData.rating && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={orderData.rating} readonly size="sm" />
                <span className="text-sm text-gray-600">Your rating</span>
              </div>
            )}
          </div>
          <StatusBadge status={orderData.status as any} />
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {orderSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${step.completed
                  ? 'bg-brand-deep-blue text-white'
                  : step.current
                  ? 'bg-brand-deep-blue/20 text-brand-deep-blue border-2 border-brand-deep-blue'
                  : 'bg-gray-200 text-gray-400'
                }
              `}>
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">{step.id}</span>
                )}
              </div>
              <div className="flex-1 pt-2">
                <div className="flex items-center justify-between">
                  <p className={`font-medium ${
                    step.completed || step.current
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  {step.time && (
                    <span className="text-sm text-gray-500">{step.time}</span>
                  )}
                </div>
                {step.current && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-brand-deep-blue rounded-full animate-pulse" />
                    <span className="text-sm text-brand-deep-blue">In progress</span>
                  </div>
                )}
              </div>
              {index < orderSteps.length - 1 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: step.completed ? 32 : 0 }}
                  className={`
                    absolute left-5 w-0.5 mt-10
                    ${step.completed ? 'bg-brand-deep-blue' : 'bg-gray-200'}
                  `}
                />
              )}
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Rider Contact */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue to-brand-energy-orange rounded-full flex items-center justify-center">
              <span className="text-white font-bold">KB</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Kwame Boateng</h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-brand-safety-green rounded-full animate-pulse" />
                <span className="text-sm text-gray-500">Online • 4.9 ★</span>
              </div>
            </div>
          </div>
          <Shield className="w-6 h-6 text-brand-safety-green" />
        </div>

        <div className="flex gap-3">
          <PrimaryButton
            variant="secondary"
            className="flex-1 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10"
            onClick={() => window.location.href = 'tel:+233XXXXXXXXX'}
          >
            <Phone className="w-5 h-5" />
            Call
          </PrimaryButton>
          <PrimaryButton
            variant="secondary"
            className="flex-1 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10"
            onClick={() => window.location.href = 'sms:+233XXXXXXXXX'}
          >
            <MessageSquare className="w-5 h-5" />
            Message
          </PrimaryButton>
        </div>
      </GlassCard>

      {/* Order Summary */}
      <GlassCard className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Gas Cost</span>
            <span className="font-medium">GH₵180.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium">GH₵8.75</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Safekeeping</span>
            <span className="font-medium">GH₵5.00</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-brand-deep-blue">GH₵193.75</span>
          </div>
        </div>
      </GlassCard>

      {/* Rate Station - Show for delivered orders without rating */}
      {orderData.status === 'delivered' && !orderData.rating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6 bg-gradient-to-br from-brand-energy-orange/5 to-brand-deep-blue/5 border-brand-energy-orange/20">
            <div className="text-center mb-4">
              <Star className="w-12 h-12 text-brand-energy-orange mx-auto mb-3" />
              <h3 className="text-title-md font-bold text-gray-900 mb-2">
                How was your experience?
              </h3>
              <p className="text-sm text-gray-600">
                Rate {orderData.stationName} to help others
              </p>
            </div>
            <PrimaryButton
              fullWidth
              variant="energy"
              onClick={() => setShowRatingModal(true)}
            >
              <Star className="w-5 h-5" />
              <span>Rate Station</span>
            </PrimaryButton>
          </GlassCard>
        </motion.div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleSubmitRating}
        stationName={orderData.stationName}
        orderId={orderId}
      />
    </div>
  );
}

