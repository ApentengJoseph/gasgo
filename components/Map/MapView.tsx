'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Truck } from 'lucide-react';
import GlassCard from '@/components/Cards/GlassCard';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

interface MapViewProps {
  center?: { lat: number; lng: number };
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    label?: string;
    icon?: string;
  }>;
  userLocation?: { lat: number; lng: number } | null;
  zoom?: number;
  height?: string;
  className?: string;
  showControls?: boolean;
}


export default function MapView({
  center = { lat: 6.0833, lng: -0.2500 }, // Default to Koforidua, Ghana
  markers = [],
  userLocation = null,
  zoom = 14,
  selectedMarkerId = null,
  height = '400px',
  className = '',
  showControls = true,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load Google Maps script
  // Check for both variable names to support different .env setups
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
                 process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || 
                 '';
  
  const { isLoaded, loadError } = useGoogleMaps();

  const markersRef = useRef<google.maps.Marker[]>([]);
  const userLocationMarkerRef = useRef<google.maps.Marker | null>(null);
  const userLocationInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Initialize map when script loads (only once)
  useEffect(() => {
    // If map already exists, don't re-initialize
    if (map) {
      setIsLoading(false);
      return;
    }

    // Check if Google Maps is already available (even if isLoaded is false)
    const googleMapsAvailable = typeof window !== 'undefined' && (window as any).google;
    
    // If there's a load error or no API key, stop loading
    if (loadError || !apiKey) {
      setIsLoading(false);
      return;
    }

    // If map container doesn't exist yet, wait briefly
    if (!mapRef.current) {
      // Very short timeout - container should be available immediately
      const timeout = setTimeout(() => {
        if (!mapRef.current && !map) {
          setIsLoading(false);
        }
      }, 100);
      return () => clearTimeout(timeout);
    }

    // If Google Maps is available (from previous page), initialize immediately
    if (googleMapsAvailable) {
      try {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: showControls,
          streetViewControl: showControls,
          fullscreenControl: showControls,
          zoomControl: showControls,
          styles: [
            // Enhanced map styles to show buildings, POIs, and details
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'poi.attraction',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'poi.government',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'poi.medical',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'poi.park',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'poi.place_of_worship',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'poi.school',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'poi.sports_complex',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'road',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'administrative',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'transit',
              stylers: [{ visibility: 'on' }],
            },
          ],
        });
        setMap(mapInstance);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
        return;
      }
    }

    // If Google Maps is not available yet, wait for it
    if (!isLoaded && !googleMapsAvailable) {
      // Wait for Google Maps to load
      const checkInterval = setInterval(() => {
        const nowAvailable = typeof window !== 'undefined' && (window as any).google;
        if (nowAvailable && mapRef.current && !map) {
          clearInterval(checkInterval);
          try {
            const mapInstance = new google.maps.Map(mapRef.current, {
              center,
              zoom,
              mapTypeControl: showControls,
              streetViewControl: showControls,
              fullscreenControl: showControls,
              zoomControl: showControls,
              styles: [
                // Enhanced map styles to show buildings, POIs, and details
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.business',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.attraction',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.government',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.medical',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.park',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.place_of_worship',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.school',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.sports_complex',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'road',
                  elementType: 'labels',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'road.highway',
                  elementType: 'labels',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'administrative',
                  elementType: 'labels',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'transit',
                  stylers: [{ visibility: 'on' }],
                },
              ],
            });
            setMap(mapInstance);
            setIsLoading(false);
          } catch (error) {
            console.error('Error initializing map:', error);
            setIsLoading(false);
          }
        }
      }, 200);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!map) {
          setIsLoading(false);
        }
      }, 10000);
      
      return () => clearInterval(checkInterval);
    }

    // If isLoaded is true, initialize
    if (isLoaded && !googleMapsAvailable) {
      // Wait a bit more
      const timeout = setTimeout(() => {
        if ((window as any).google && mapRef.current && !map) {
          try {
            const mapInstance = new google.maps.Map(mapRef.current, {
              center,
              zoom,
              mapTypeControl: showControls,
              streetViewControl: showControls,
              fullscreenControl: showControls,
              zoomControl: showControls,
              styles: [
                // Enhanced map styles to show buildings, POIs, and details
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.business',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.attraction',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.government',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.medical',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.park',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.place_of_worship',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.school',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'poi.sports_complex',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'road',
                  elementType: 'labels',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'road.highway',
                  elementType: 'labels',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'administrative',
                  elementType: 'labels',
                  stylers: [{ visibility: 'on' }],
                },
                {
                  featureType: 'transit',
                  stylers: [{ visibility: 'on' }],
                },
              ],
            });
            setMap(mapInstance);
            setIsLoading(false);
          } catch (error) {
            console.error('Error initializing map:', error);
            setIsLoading(false);
          }
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isLoaded, loadError, apiKey, map, center, zoom, showControls]);

  // Update map center and zoom when they change (without recreating map)
  useEffect(() => {
    if (!map) return;
    
    map.setCenter(center);
    map.setZoom(zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, center.lat, center.lng, zoom]);

  // Zoom to selected marker when it changes
  useEffect(() => {
    if (!map || !selectedMarkerId || !isLoaded || !apiKey) return;

    const selectedMarker = markers.find((m) => m.id === selectedMarkerId);
    if (selectedMarker) {
      // Pan and zoom to the selected marker with smooth animation
      map.panTo(selectedMarker.position);
      map.setZoom(17); // Zoom in closer when a station is selected
      
      // Find and animate the selected marker
      const markerIndex = markers.findIndex((m) => m.id === selectedMarkerId);
      if (markerIndex !== -1 && markersRef.current[markerIndex]) {
        const markerInstance = markersRef.current[markerIndex];
        // Animate marker with bounce
        markerInstance.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => {
          if (markerInstance) {
            markerInstance.setAnimation(null);
          }
        }, 2000);
      }
    }
  }, [map, selectedMarkerId, markers, isLoaded, apiKey]);

  // Update markers when they change (without recreating the map)
  useEffect(() => {
    if (!map || !isLoaded || !apiKey) {
      return;
    }

    // Clear existing station markers
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // Add new station markers
    markers.forEach((marker) => {
      const markerInstance = new google.maps.Marker({
        position: marker.position,
        map: map,
        label: marker.label,
        title: marker.label,
        icon: marker.icon
          ? {
              url: marker.icon,
              scaledSize: new google.maps.Size(40, 40),
            }
          : undefined,
      });
      markersRef.current.push(markerInstance);
    });
  }, [markers, map, isLoaded, apiKey]);

  // Update user location marker
  useEffect(() => {
    if (!map || !isLoaded || !apiKey || !userLocation) {
      // Remove user location marker and info window if location is not available
      if (userLocationInfoWindowRef.current) {
        userLocationInfoWindowRef.current.close();
        userLocationInfoWindowRef.current = null;
      }
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.setMap(null);
        userLocationMarkerRef.current = null;
      }
      return;
    }

    // Create or update user location marker
    if (!userLocationMarkerRef.current) {
      const userLocationIcon = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0C9.5 0 1 8.5 1 19c0 14 19 31 19 31s19-17 19-31C39 8.5 30.5 0 20 0z" fill="#0F4C81" stroke="#fff" stroke-width="2"/>
            <circle cx="20" cy="19" r="8" fill="#fff"/>
            <circle cx="20" cy="19" r="4" fill="#0F4C81"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(40, 50),
        anchor: new google.maps.Point(20, 50),
      };

      userLocationMarkerRef.current = new google.maps.Marker({
        position: userLocation,
        map: map,
        icon: userLocationIcon,
        title: 'Your Current Location',
        zIndex: 1000, // Always on top
        animation: google.maps.Animation.DROP,
      });

      // Create and open InfoWindow with label text
      const infoWindowContent = `
        <div style="padding: 8px 12px; font-weight: 600; color: #0F4C81; font-size: 13px; text-align: center;">
          📍 Your Current Location
        </div>
      `;

      userLocationInfoWindowRef.current = new google.maps.InfoWindow({
        content: infoWindowContent,
        disableAutoPan: false,
      });

      // Open info window immediately and keep it open
      userLocationInfoWindowRef.current.open(map, userLocationMarkerRef.current);
    } else {
      // Update existing marker position
      userLocationMarkerRef.current.setPosition(userLocation);
      // Update info window position if it exists
      if (userLocationInfoWindowRef.current) {
        userLocationInfoWindowRef.current.open(map, userLocationMarkerRef.current);
      }
    }
  }, [map, isLoaded, apiKey, userLocation]);

  // Fallback map (static image or placeholder) when no API key
  // Check this FIRST before trying to load Google Maps
  if (!apiKey) {
    return (
      <div className={`relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 ${className}`} style={{ height, minHeight: height }}>
        {/* Static map placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-deep-blue/20 via-brand-corporate-blue/10 to-brand-energy-orange/10" style={{ minHeight: '100%' }}>
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-10" 
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }} 
          />
          
          {/* Markers */}
          {markers.map((marker, index) => {
            // Calculate position based on marker index
            const positions = [
              { left: '30%', top: '40%' }, // Station
              { left: '50%', top: '50%' }, // Rider (center)
              { left: '70%', top: '60%' }, // Destination
            ];
            const pos = positions[index] || { left: `${50 + (index * 10)}%`, top: `${50 + (index * 5)}%` };
            
            const isRider = marker.id === 'rider';
            const isStation = marker.id === 'station';
            const isDestination = marker.id === 'destination';
            
            return (
              <div
                key={marker.id}
                className="absolute z-10"
                style={{
                  left: pos.left,
                  top: pos.top,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="relative">
                  <div className={`${
                    isRider ? 'w-16 h-16' : 'w-12 h-12'
                  } rounded-full flex items-center justify-center shadow-lg ${
                    isRider
                      ? 'bg-brand-deep-blue animate-pulse' 
                      : isStation
                      ? 'bg-brand-energy-orange'
                      : 'bg-brand-safety-green'
                  }`}>
                    {isRider ? (
                      <Truck className={`${isRider ? 'w-8 h-8' : 'w-6 h-6'} text-white`} />
                    ) : (
                      <MapPin className="w-6 h-6 text-white" />
                    )}
                  </div>
                  {isRider && (
                    <div className="absolute inset-0 bg-brand-deep-blue rounded-full animate-ping opacity-20" />
                  )}
                  {marker.label && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-20">
                      <div className="bg-white px-3 py-1 rounded-lg shadow-lg text-xs font-semibold text-gray-900 border border-gray-200">
                        {marker.label}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Route line (visual) */}
          {markers.length >= 2 && (
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
              <line
                x1="30%"
                y1="40%"
                x2="70%"
                y2="60%"
                stroke="#0F4C81"
                strokeWidth="3"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            </svg>
          )}

          {/* Info overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-30">
            <GlassCard className="p-3 bg-white/95 backdrop-blur-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-deep-blue" />
                <p className="text-sm text-gray-700">
                  Add Google Maps API key to see interactive map
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  // Handle load error
  if (loadError) {
    return (
      <div className={`relative rounded-2xl overflow-hidden border border-gray-200 ${className}`} style={{ height }}>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-deep-blue/20 via-brand-corporate-blue/10 to-brand-energy-orange/10 flex items-center justify-center">
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 text-brand-deep-blue mx-auto mb-4" />
            <p className="text-sm text-gray-700 font-medium">
              Map failed to load. Please check your API key.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Always render map container so ref is available immediately
  // Show loading overlay only when needed
  const googleMapsAvailable = typeof window !== 'undefined' && (window as any).google;
  const shouldShowLoading = (!googleMapsAvailable && !isLoaded) || (isLoading && !map && !googleMapsAvailable);

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`} style={{ height }}>
      {/* Map container - always rendered */}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Loading overlay */}
      {shouldShowLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-brand-deep-blue animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}

