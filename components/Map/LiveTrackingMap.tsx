'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

interface LiveTrackingMapProps {
  stationPosition: { lat: number; lng: number };
  riderPosition: { lat: number; lng: number };
  destinationPosition: { lat: number; lng: number };
  height?: string;
  className?: string;
  onRiderPositionChange?: (position: { lat: number; lng: number }) => void;
}

const libraries: ('places' | 'geometry' | 'drawing')[] = ['places', 'geometry', 'drawing'];

export default function LiveTrackingMap({
  stationPosition,
  riderPosition: initialRiderPosition,
  destinationPosition,
  height = '400px',
  className = '',
  onRiderPositionChange,
}: LiveTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [riderPosition, setRiderPosition] = useState(initialRiderPosition);
  const riderPositionRef = useRef(initialRiderPosition);
  const markersRef = useRef<{
    station?: google.maps.Marker;
    rider?: google.maps.Marker;
    destination?: google.maps.Marker;
  }>({});
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const animationRef = useRef<number | null>(null);
  const hasAnimationStartedRef = useRef(false); // Track if animation has started
  
  // Store positions in refs to avoid dependency array issues
  const stationPositionRef = useRef(stationPosition);
  const destinationPositionRef = useRef(destinationPosition);
  const onRiderPositionChangeRef = useRef(onRiderPositionChange);
  
  // Update callback ref when it changes
  useEffect(() => {
    onRiderPositionChangeRef.current = onRiderPositionChange;
  }, [onRiderPositionChange]);
  
  // Update refs when positions change
  useEffect(() => {
    stationPositionRef.current = stationPosition;
    destinationPositionRef.current = destinationPosition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationPosition.lat, stationPosition.lng, destinationPosition.lat, destinationPosition.lng]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
                 process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || 
                 '';

  const { isLoaded, loadError } = useGoogleMaps();

  // Initialize map (only once)
  useEffect(() => {
    // If map already exists, don't re-initialize
    if (map) {
      setIsLoading(false);
      return;
    }

    // Wait for Google Maps to load
    if (!isLoaded) {
      // Keep loading state true while waiting, but set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        if (!isLoaded && !map) {
          console.warn('Google Maps taking too long to load');
          setIsLoading(false);
        }
      }, 10000); // 10 second timeout
      return () => clearTimeout(timeout);
    }

    // If there's a load error or no API key, stop loading
    if (loadError || !apiKey) {
      setIsLoading(false);
      return;
    }

    // If map container doesn't exist yet, wait a bit then check again
    if (!mapRef.current) {
      // Use a timeout to wait for ref to be available
      const timeout = setTimeout(() => {
        if (!mapRef.current && !map) {
          console.warn('Map container ref not available');
          setIsLoading(false);
        }
      }, 2000); // 2 second timeout
      return () => clearTimeout(timeout);
    }

    // Check if Google Maps API is actually available
    if (typeof window === 'undefined' || !(window as any).google) {
      // Google Maps not loaded yet, but isLoaded is true, so wait a bit
      const timeout = setTimeout(() => {
        if (!(window as any).google && !map) {
          console.warn('Google Maps API not available after isLoaded=true');
          setIsLoading(false);
        }
      }, 2000); // 2 second timeout
      return () => clearTimeout(timeout);
    }

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: riderPosition,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    // Create custom icons
    const stationIcon = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#F97316" stroke="#fff" stroke-width="3"/>
          <text x="20" y="26" font-size="20" fill="white" text-anchor="middle">⛽</text>
        </svg>
      `),
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(20, 20),
    };

    const riderIcon = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
          <circle cx="25" cy="25" r="22" fill="#0F4C81" stroke="#fff" stroke-width="3"/>
          <text x="25" y="32" font-size="24" fill="white" text-anchor="middle">🚚</text>
        </svg>
      `),
      scaledSize: new google.maps.Size(50, 50),
      anchor: new google.maps.Point(25, 25),
    };

    // User location icon - proper location pin
    const destinationIcon = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C9.5 0 1 8.5 1 19c0 14 19 31 19 31s19-17 19-31C39 8.5 30.5 0 20 0z" fill="#0F4C81" stroke="#fff" stroke-width="2"/>
          <circle cx="20" cy="19" r="8" fill="#fff"/>
        </svg>
      `),
      scaledSize: new google.maps.Size(40, 50),
      anchor: new google.maps.Point(20, 50),
    };

    // Get current positions from refs
    const stationPos = stationPositionRef.current;
    const destPos = destinationPositionRef.current;
    
    // Create markers
    markersRef.current.station = new google.maps.Marker({
      position: stationPos,
      map: mapInstance,
      icon: stationIcon,
      title: 'Gas Station',
      zIndex: 1,
    });

    markersRef.current.rider = new google.maps.Marker({
      position: riderPosition,
      map: mapInstance,
      icon: riderIcon,
      title: 'Rider',
      zIndex: 3,
      animation: google.maps.Animation.DROP,
    });

    markersRef.current.destination = new google.maps.Marker({
      position: destPos,
      map: mapInstance,
      icon: destinationIcon,
      title: 'Your Location',
      zIndex: 2,
      animation: google.maps.Animation.DROP,
    });

    // Draw initial route (will be updated by animation to show full journey)
    const routePath = new google.maps.Polyline({
      path: [initialRiderPosition, stationPos, destPos],
      geodesic: true,
      strokeColor: '#0F4C81',
      strokeOpacity: 0.6,
      strokeWeight: 4,
      map: mapInstance,
    });

    routePolylineRef.current = routePath;

    // Fit bounds to show all markers
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(stationPos);
    bounds.extend(riderPosition);
    bounds.extend(destPos);
    mapInstance.fitBounds(bounds);

    try {
      setMap(mapInstance);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, loadError, apiKey, map, riderPosition]); // Include riderPosition for initial center

  // Animate rider movement (Uber/Bolt style) - Two-leg journey: Rider → Station → User Location
  useEffect(() => {
    if (!map || !markersRef.current.rider || !apiKey) return;
    
    // Prevent animation from restarting if it's already running
    if (hasAnimationStartedRef.current) return;

    // Get positions from refs (always up-to-date, no dependency issues)
    const stationPos = stationPositionRef.current;
    const destPos = destinationPositionRef.current;
    const initialRiderPos = initialRiderPosition;
    
    // Two-leg journey: 
    // Leg 1: Rider → Station (0 to 0.5 progress)
    // Leg 2: Station → User Location (0.5 to 1.0 progress)
    
    let progress = 0.0; // Start from beginning
    const speed = 0.0015; // Faster speed to complete animation in reasonable time (~11 seconds at 60fps)
    let lastNotifyTime = 0;
    let lastPanTime = 0;
    const NOTIFY_INTERVAL = 2000; // Only notify parent every 2 seconds
    const PAN_INTERVAL = 2000; // Pan map every 2 seconds
    let currentLeg = 1; // 1 = going to station, 2 = going to user location
    let isAnimating = true;

    const animate = () => {
      if (!isAnimating) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        return;
      }
      
      progress += speed;
      
      let currentPosition: { lat: number; lng: number };
      
      if (progress <= 0.5) {
        // Leg 1: Rider → Station
        currentLeg = 1;
        const legProgress = progress / 0.5; // 0 to 1 for this leg
        currentPosition = {
          lat: initialRiderPos.lat + (stationPos.lat - initialRiderPos.lat) * legProgress,
          lng: initialRiderPos.lng + (stationPos.lng - initialRiderPos.lng) * legProgress,
        };
      } else {
        // Leg 2: Station → User Location
        currentLeg = 2;
        const legProgress = (progress - 0.5) / 0.5; // 0 to 1 for this leg
        currentPosition = {
          lat: stationPos.lat + (destPos.lat - stationPos.lat) * legProgress,
          lng: stationPos.lng + (destPos.lng - stationPos.lng) * legProgress,
        };
      }
      
      // Clamp progress to 1.0
      if (progress >= 1.0) {
        progress = 1.0;
        currentPosition = destPos; // Final position at user location
        isAnimating = false; // Stop animation when complete
      }

      // Always update ref (no re-render)
      riderPositionRef.current = currentPosition;
      
      // Always update marker position for smooth animation (doesn't cause re-renders)
      if (markersRef.current.rider) {
        markersRef.current.rider.setPosition(currentPosition);
      }
      
      // Only update state and notify parent periodically to avoid infinite loops
      const now = Date.now();
      if (now - lastNotifyTime >= NOTIFY_INTERVAL) {
        setRiderPosition(currentPosition);
        
        // Notify parent component of position change (debounced)
        if (onRiderPositionChangeRef.current) {
          onRiderPositionChangeRef.current(currentPosition);
        }
        
        lastNotifyTime = now;
      }

      // Update route polyline to show full route (smoothly)
      if (routePolylineRef.current) {
        if (currentLeg === 1) {
          // Show: Rider → Current Position → Station → User Location
          routePolylineRef.current.setPath([
            initialRiderPos,
            currentPosition,
            stationPos,
            destPos,
          ]);
        } else {
          // Show: Rider → Station → Current Position → User Location
          routePolylineRef.current.setPath([
            initialRiderPos,
            stationPos,
            currentPosition,
            destPos,
          ]);
        }
      }

      // Center map on rider (smoothly, less frequently)
      if (map && now - lastPanTime >= PAN_INTERVAL) {
        map.panTo(currentPosition);
        lastPanTime = now;
      }

      // Continue animation if not complete
      if (isAnimating && progress < 1.0) {
        animationRef.current = requestAnimationFrame(animate);
      } else if (progress >= 1.0) {
        // Ensure we're at final position
        if (markersRef.current.rider) {
          markersRef.current.rider.setPosition(destPos);
        }
        if (routePolylineRef.current) {
          routePolylineRef.current.setPath([
            initialRiderPos,
            stationPos,
            destPos,
          ]);
        }
        isAnimating = false;
      }
    };

    // Start animation after a small delay to ensure map is ready
    const startTimeout = setTimeout(() => {
      if (isAnimating && map && markersRef.current.rider && !hasAnimationStartedRef.current) {
        hasAnimationStartedRef.current = true;
        animationRef.current = requestAnimationFrame(animate);
      }
    }, 500);

    return () => {
      isAnimating = false;
      hasAnimationStartedRef.current = false; // Reset so animation can restart if component remounts
      if (startTimeout) clearTimeout(startTimeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, apiKey, stationPosition.lat, stationPosition.lng, destinationPosition.lat, destinationPosition.lng, initialRiderPosition.lat, initialRiderPosition.lng]); // Use individual values instead of objects

  // Fallback if no API key
  if (!apiKey) {
    return (
      <div className={`relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 ${className}`} style={{ height }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-gray-600">Map requires Google Maps API key</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`relative rounded-2xl overflow-hidden border border-gray-200 ${className}`} style={{ height }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-gray-600">Map failed to load</p>
        </div>
      </div>
    );
  }

  // Always render the map container so ref is available
  // Show loading overlay while Google Maps is loading or map is initializing
  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`} style={{ height }}>
      {/* Map container - always rendered so ref is available */}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Loading overlay */}
      {(!isLoaded || isLoading || !map) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-brand-deep-blue animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">Loading live tracking...</p>
            {!isLoaded && <p className="text-xs text-gray-500 mt-2">Loading Google Maps...</p>}
          </div>
        </div>
      )}
    </div>
  );
}

