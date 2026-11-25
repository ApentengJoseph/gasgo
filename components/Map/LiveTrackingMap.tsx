'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Navigation2, AlertCircle } from 'lucide-react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

export interface RiderPosition {
  lat: number;
  lng: number;
  heading?: number;
}

export interface TrackingMapProps {
  orderId?: string;
  stationPosition: { lat: number; lng: number; name?: string };
  riderPosition: RiderPosition;
  destinationPosition: { lat: number; lng: number; address?: string };
  orderStatus?: string;
  height?: string;
  className?: string;
  onETAUpdate?: (etaMinutes: number, distanceKm: number) => void;
}

// Bolt-style dark map theme
// Light, warm map that matches the app (muted POIs so the route stands out)
const BOLT_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#F7F1EA' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7A6E62' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#E6EBD9' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#EADFD2' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#FBE3CC' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#F3C9A3' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#CFE0E8' }] },
];

// Build SVG for vehicle marker — tricycle/scooter icon that rotates with heading
function buildVehicleSVG(heading: number = 0, isMoving: boolean = true): string {
  const pulse = isMoving
    ? `<circle cx="24" cy="24" r="22" fill="#FF6B00" fill-opacity="0.25">
        <animate attributeName="r" values="18;26;18" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="fill-opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
       </circle>`
    : '';
  return encodeURIComponent(`
    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      ${pulse}
      <circle cx="24" cy="24" r="18" fill="#17130F" stroke="#ffffff" stroke-width="3"/>
      <g transform="translate(24,24) rotate(${heading}) translate(-24,-24)">
        <text x="24" y="30" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle">🛵</text>
      </g>
    </svg>
  `);
}

function buildStationSVG(): string {
  return encodeURIComponent(`
    <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="19" fill="#2A231C" stroke="#ffffff" stroke-width="3"/>
      <text x="22" y="28" font-size="18" fill="white" text-anchor="middle">⛽</text>
    </svg>
  `);
}

function buildDestinationSVG(): string {
  return encodeURIComponent(`
    <svg width="36" height="50" viewBox="0 0 36 50" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 2C9.163 2 2 9.163 2 18c0 11.25 16 30 16 30S34 29.25 34 18C34 9.163 26.837 2 18 2z"
            fill="#FF6B00" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="18" cy="18" r="7" fill="white"/>
      <circle cx="18" cy="18" r="4" fill="#FF6B00"/>
    </svg>
  `);
}

// Glide the marker to a new GPS fix the way ride-hailing apps do: constant speed over
// roughly the time until the next fix, so the vehicle never stops and jumps.
// Starting a new glide cancels the previous one (it continues from where the pin is now).
const glides = new WeakMap<google.maps.Marker, number>();
function animateMarkerTo(marker: google.maps.Marker, targetLat: number, targetLng: number, durationMs: number) {
  const prevFrame = glides.get(marker);
  if (prevFrame) cancelAnimationFrame(prevFrame);
  const startPos = marker.getPosition();
  if (!startPos || durationMs <= 0 || document.hidden) {
    marker.setPosition({ lat: targetLat, lng: targetLng });
    return;
  }
  const startLat = startPos.lat();
  const startLng = startPos.lng();
  const startTime = performance.now();
  const step = (now: number) => {
    const t = Math.min((now - startTime) / durationMs, 1);
    marker.setPosition({ lat: startLat + (targetLat - startLat) * t, lng: startLng + (targetLng - startLng) * t });
    if (t < 1) glides.set(marker, requestAnimationFrame(step));
    else glides.delete(marker);
  };
  glides.set(marker, requestAnimationFrame(step));
}

const metresBetween = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371000, r = (d: number) => (d * Math.PI) / 180;
  const x = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

// Calculate compass heading between two points
function calculateHeading(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const dLng = (to.lng - from.lng) * (Math.PI / 180);
  const lat1 = from.lat * (Math.PI / 180);
  const lat2 = to.lat * (Math.PI / 180);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export default function LiveTrackingMap({
  orderId,
  stationPosition,
  riderPosition,
  destinationPosition,
  orderStatus = 'on_the_way',
  height = '420px',
  className = '',
  onETAUpdate,
}: TrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const riderMarkerRef = useRef<google.maps.Marker | null>(null);
  const stationMarkerRef = useRef<google.maps.Marker | null>(null);
  const destMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const etaIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevRiderPosRef = useRef<RiderPosition>(riderPosition);

  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [etaDistance, setEtaDistance] = useState<number | null>(null);
  const [routeError, setRouteError] = useState(false);

  const { isLoaded, loadError: googleLoadError } = useGoogleMaps();

  const isDelivered = orderStatus === 'delivered' || orderStatus === 'cancelled';

  // ─── Initialize map once Google is loaded ───────────────────────────────────
  useEffect(() => {
    if (!isLoaded || googleLoadError || !mapContainerRef.current || mapRef.current) return;

    try {
      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: riderPosition.lat, lng: riderPosition.lng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
        gestureHandling: 'greedy',
        styles: BOLT_MAP_STYLES,
        clickableIcons: false,
      });
      mapRef.current = map;

      // Station marker
      stationMarkerRef.current = new google.maps.Marker({
        position: stationPosition,
        map,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${buildStationSVG()}`,
          scaledSize: new google.maps.Size(44, 44),
          anchor: new google.maps.Point(22, 22),
        },
        title: stationPosition.name || 'Gas Station',
        zIndex: 2,
      });

      // Station info window
      const stationInfo = new google.maps.InfoWindow({
        content: `<div style="font-family:sans-serif;font-size:13px;font-weight:600;color:#1a1a2e;padding:4px 8px">${stationPosition.name || 'Gas Station'}</div>`,
      });
      stationMarkerRef.current.addListener('click', () =>
        stationInfo.open(map, stationMarkerRef.current!),
      );

      // Destination marker
      destMarkerRef.current = new google.maps.Marker({
        position: destinationPosition,
        map,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${buildDestinationSVG()}`,
          scaledSize: new google.maps.Size(36, 50),
          anchor: new google.maps.Point(18, 50),
        },
        title: destinationPosition.address || 'Your Location',
        zIndex: 3,
        animation: google.maps.Animation.DROP,
      });

      // Destination info window
      const destInfo = new google.maps.InfoWindow({
        content: `<div style="font-family:sans-serif;font-size:13px;font-weight:600;color:#1a1a2e;padding:4px 8px">${destinationPosition.address || 'Your Location'}</div>`,
      });
      destMarkerRef.current.addListener('click', () =>
        destInfo.open(map, destMarkerRef.current!),
      );

      // Rider marker
      riderMarkerRef.current = new google.maps.Marker({
        position: riderPosition,
        map,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${buildVehicleSVG(riderPosition.heading || 0, !isDelivered)}`,
          scaledSize: new google.maps.Size(48, 48),
          anchor: new google.maps.Point(24, 24),
        },
        title: 'Rider',
        zIndex: 10,
        optimized: false, // Required for SVG rotation to work correctly
      });

      // DirectionsRenderer for road-following route
      const renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#FF6B00',
          strokeWeight: 5,
          strokeOpacity: 0.9,
          geodesic: true,
          icons: [
            {
              icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3, strokeColor: '#FF6B00' },
              offset: '100%',
              repeat: '120px',
            },
          ],
        },
      });
      renderer.setMap(map);
      directionsRendererRef.current = renderer;

      setMapReady(true);
    } catch (err) {
      console.error('Map init error:', err);
      setLoadError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, googleLoadError]);

  // ─── Fetch actual road route via DirectionsService ──────────────────────────
  const fetchRoute = useCallback(async (riderPos: RiderPosition) => {
    if (!mapRef.current || !directionsRendererRef.current || isDelivered) return;

    const service = new google.maps.DirectionsService();

    // Route: Rider → Station → Customer (two legs)
    const origin = orderStatus === 'on_the_way' || orderStatus === 'arriving'
      ? riderPos  // already picked up, go direct to customer
      : riderPos;

    // If rider is en-route to customer skip station waypoint
    const waypoints =
      orderStatus === 'assigned' || orderStatus === 'at_station' || orderStatus === 'collected'
        ? [{ location: new google.maps.LatLng(stationPosition.lat, stationPosition.lng), stopover: true }]
        : [];

    try {
      service.route(
        {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destinationPosition.lat, destinationPosition.lng),
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: google.maps.TrafficModel.BEST_GUESS,
          },
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRendererRef.current!.setDirections(result);

            // Extract ETA from all legs
            let totalDurationSec = 0;
            let totalDistanceM = 0;
            result.routes[0]?.legs.forEach((leg) => {
              totalDurationSec += leg.duration?.value || 0;
              totalDistanceM += leg.distance?.value || 0;
            });
            const etaMins = Math.ceil((totalDurationSec * 1.35) / 60); // 1.35× for tricycle
            const distKm = Math.round((totalDistanceM / 1000) * 10) / 10;
            setEtaMinutes(etaMins);
            setEtaDistance(distKm);
            setRouteError(false);
            onETAUpdate?.(etaMins, distKm);
          } else {
            setRouteError(true);
          }
        },
      );
    } catch {
      setRouteError(true);
    }
  }, [orderStatus, stationPosition, destinationPosition, isDelivered, onETAUpdate]);

  // ─── Fetch route on map ready + every 60s ──────────────────────────────────
  useEffect(() => {
    if (!mapReady) return;
    fetchRoute(riderPosition);
    etaIntervalRef.current = setInterval(() => fetchRoute(prevRiderPosRef.current), 60_000);
    return () => {
      if (etaIntervalRef.current) clearInterval(etaIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, fetchRoute]);

  // ─── Update rider marker when a new GPS fix arrives (Supabase realtime or prop) ─
  const lastFixAtRef = useRef<number>(0);
  const lastHeadingRef = useRef<number>(riderPosition.heading ?? 0);
  const lastRouteAtRef = useRef<number>(0);
  useEffect(() => {
    if (!mapReady || !riderMarkerRef.current) return;

    const prev = prevRiderPosRef.current;
    const moved = metresBetween(prev, riderPosition);
    // Same fix re-sent (e.g. the page re-rendered): nothing to do.
    if (moved < 0.5 && lastFixAtRef.current) return;
    prevRiderPosRef.current = riderPosition;
    const now = performance.now();
    const gap = lastFixAtRef.current ? now - lastFixAtRef.current : 0;
    lastFixAtRef.current = now;

    // Glide over the real gap between fixes (riders send every ~4 s); snap on big jumps.
    const duration = moved > 2000 || !gap ? 0 : Math.min(Math.max(gap * 0.95, 600), 6000);
    animateMarkerTo(riderMarkerRef.current, riderPosition.lat, riderPosition.lng, duration);

    // Only turn the vehicle when it actually moved (no spinning while parked at the station).
    if (moved > 5) lastHeadingRef.current = riderPosition.heading ?? calculateHeading(prev, riderPosition);
    riderMarkerRef.current.setIcon({
      url: `data:image/svg+xml;charset=UTF-8,${buildVehicleSVG(lastHeadingRef.current, !isDelivered)}`,
      scaledSize: new google.maps.Size(48, 48),
      anchor: new google.maps.Point(24, 24),
    });

    // Follow the rider only when they leave the visible area (don't fight the user's panning).
    const bounds = mapRef.current?.getBounds();
    if (mapRef.current && bounds && !bounds.contains(riderPosition)) {
      mapRef.current.panTo({ lat: riderPosition.lat, lng: riderPosition.lng });
    }

    // Refresh the route (and ETA) when the rider has moved on, at most every 20 s.
    if (moved > 100 && Date.now() - lastRouteAtRef.current > 20000) {
      lastRouteAtRef.current = Date.now();
      fetchRoute(riderPosition);
    }
  }, [riderPosition, mapReady, isDelivered, fetchRoute]);

  // ─── Fit bounds to show all markers once map is ready ──────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(riderPosition);
    bounds.extend(stationPosition);
    bounds.extend(destinationPosition);
    mapRef.current.fitBounds(bounds, { top: 60, bottom: 180, left: 40, right: 40 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  // ─── Delivered state — show green route, hide live tracking ────────────────
  useEffect(() => {
    if (!mapReady || !riderMarkerRef.current) return;
    if (isDelivered) {
      riderMarkerRef.current.setIcon({
        url: `data:image/svg+xml;charset=UTF-8,${buildVehicleSVG(0, false)}`,
        scaledSize: new google.maps.Size(48, 48),
        anchor: new google.maps.Point(24, 24),
      });
      if (etaIntervalRef.current) clearInterval(etaIntervalRef.current);
    }
  }, [isDelivered, mapReady]);

  // ─── Recenter button ────────────────────────────────────────────────────────
  const handleRecenter = () => {
    if (!mapRef.current) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(riderPosition);
    bounds.extend(destinationPosition);
    mapRef.current.fitBounds(bounds, { top: 60, bottom: 200, left: 40, right: 40 });
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (loadError || googleLoadError) {
    return (
      <div
        className={`relative rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-white p-6">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
          <p className="text-sm font-medium">Map failed to load</p>
          <p className="text-xs text-gray-400 mt-1">Check your Google Maps API key</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Map canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {(!isLoaded || !mapReady) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F7F1EA] z-20">
          <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin mb-3" />
          <p className="text-sm text-[#6B6259]">Loading live map…</p>
        </div>
      )}

      {/* ETA chip — top center */}
      {mapReady && etaMinutes !== null && !isDelivered && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-[#17130F] text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-white/20">
            <div className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
            {etaMinutes} min away
            {etaDistance !== null && (
              <span className="text-white/70 font-normal text-xs">· {etaDistance} km</span>
            )}
          </div>
        </div>
      )}

      {/* Delivered chip */}
      {mapReady && isDelivered && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-[#FF6B00] text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            ✓ Delivered
          </div>
        </div>
      )}

      {/* Route error */}
      {mapReady && routeError && !isDelivered && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
            Route unavailable — showing approximate
          </div>
        </div>
      )}

      {/* Recenter button */}
      {mapReady && (
        <button
          onClick={handleRecenter}
          className="absolute bottom-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
          aria-label="Re-center map"
        >
          <Navigation2 className="w-5 h-5 text-[#17130F]" />
        </button>
      )}

      {/* Legend */}
      {mapReady && (
        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5 bg-white/90 backdrop-blur-sm border border-[#EFE7DE] rounded-xl px-3 py-2 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#17130F] border border-white/30" />
            <span className="text-[#17130F] text-xs font-medium">Rider</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#2A231C] border border-white/30" />
            <span className="text-[#17130F] text-xs font-medium">Station</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF6B00] border border-white/30" />
            <span className="text-[#17130F] text-xs font-medium">You</span>
          </div>
        </div>
      )}
    </div>
  );
}
