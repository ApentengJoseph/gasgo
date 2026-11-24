'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { isWithinServiceArea, getServiceAreaBounds } from '@/lib/utils/serviceArea';
import ServiceAreaModal from './ServiceAreaModal';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, location?: { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  showCurrentLocation?: boolean;
  onLocationOutOfBounds?: () => void;
}


export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Search for an address in Koforidua...',
  className = '',
  error,
  showCurrentLocation = true,
  onLocationOutOfBounds,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showServiceAreaModal, setShowServiceAreaModal] = useState(false);
  const lastCheckedValue = useRef<string>('');

  // Load Google Maps script
  // Check for both variable names to support different .env setups
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
                 process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || 
                 '';

  const { isLoaded, loadError } = useGoogleMaps();

  // Function to format address using reverse geocoding (converts Plus Codes/coordinates to readable address)
  const formatAddressFromCoordinates = (
    lat: number,
    lng: number,
    callback: (address: string) => void
  ) => {
    if (!apiKey || !isLoaded || !window.google) {
      callback(`Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          callback(results[0].formatted_address);
        } else {
          callback(`Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
        }
      }
    );
  };

  // Get current location function
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Check if location is within service area
        if (isWithinServiceArea(latitude, longitude)) {
          // Use reverse geocoding to get formatted address
          formatAddressFromCoordinates(latitude, longitude, (formattedAddress) => {
            setGettingLocation(false);
            onChange(formattedAddress, { lat: latitude, lng: longitude });
          });
        } else {
          setGettingLocation(false);
          // Show service area modal
          setShowServiceAreaModal(true);
          if (onLocationOutOfBounds) {
            onLocationOutOfBounds();
          }
        }
      },
      (error) => {
        setGettingLocation(false);
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enter address manually.');
      }
    );
  };

  // Check and convert Plus Code when value is set and API is loaded
  useEffect(() => {
    // Only run if we have all prerequisites
    if (!apiKey || !isLoaded || !window.google || !value) {
      return;
    }

    // Skip if we've already checked this exact value
    if (lastCheckedValue.current === value) {
      return;
    }

    // Check if current value is a Plus Code (contains + and comma)
    const isPlusCode = value.includes('+') && value.includes(',');
    
    // Only convert if it's a Plus Code and hasn't been converted yet (doesn't contain street names)
    if (isPlusCode && !value.toLowerCase().includes('street') && !value.toLowerCase().includes('road') && !value.toLowerCase().includes('avenue')) {
      lastCheckedValue.current = value; // Mark as checked
      setIsLoading(true);
      // Geocode the Plus Code to get coordinates
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { address: value },
        (results, status) => {
          setIsLoading(false);
          if (status === 'OK' && results && results[0] && results[0].geometry) {
            const location = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            };
            
            // Check if location is within service area
            if (!isWithinServiceArea(location.lat, location.lng)) {
              lastCheckedValue.current = ''; // Reset on error
              setShowServiceAreaModal(true);
              onChange('', undefined);
              return;
            }
            
            // Reverse geocode to get formatted address
            formatAddressFromCoordinates(location.lat, location.lng, (formattedAddress) => {
              onChange(formattedAddress, location);
              lastCheckedValue.current = formattedAddress; // Update to new formatted address
            });
          } else {
            lastCheckedValue.current = ''; // Reset on error
          }
        }
      );
    } else {
      // Not a Plus Code, mark as checked
      lastCheckedValue.current = value;
    }
    // Note: We intentionally don't include onChange in deps to avoid re-running
    // when the parent component re-renders. The ref prevents duplicate processing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, isLoaded, value]); // Stable dependencies

  useEffect(() => {
    // If no API key, use regular input
    if (!apiKey) {
      return;
    }

    if (!isLoaded || !inputRef.current || loadError) {
      return;
    }

    // Initialize autocomplete with service area bounds
    const serviceBounds = getServiceAreaBounds();
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'gh' }, // Restrict to Ghana
      fields: ['formatted_address', 'geometry', 'name', 'address_components'],
      types: ['address'],
      // Use bounds to bias results toward service area (Koforidua, Oyoko, Okorase, Osabene, etc.)
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng(serviceBounds.southwest.lat, serviceBounds.southwest.lng),
        new google.maps.LatLng(serviceBounds.northeast.lat, serviceBounds.northeast.lng)
      ),
    });

    autocompleteRef.current = autocomplete;

    // Handle place selection
    autocomplete.addListener('place_changed', () => {
      setIsLoading(true);
      const place = autocomplete.getPlace();

      if (place.geometry && place.geometry.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        // Check if selected location is within service area
        if (!isWithinServiceArea(location.lat, location.lng)) {
          // Location is outside service area, show modal
          setIsLoading(false);
          setShowServiceAreaModal(true);
          // Clear the input
          if (inputRef.current) {
            inputRef.current.value = '';
          }
          onChange('', undefined);
          return;
        }

        // Always use reverse geocoding to get a properly formatted address
        // This ensures Plus Codes and other formats are converted to readable addresses
        formatAddressFromCoordinates(location.lat, location.lng, (formattedAddress) => {
          onChange(formattedAddress, location);
          setIsLoading(false);
        });
      } else {
        // Fallback if no geometry
        onChange(place.formatted_address || place.name || '');
        setIsLoading(false);
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, loadError, apiKey]); // Don't include onChange to keep dependency array stable

  // Fallback if no API key provided
  if (!apiKey) {
    return (
      <div className="space-y-3">
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-flame" />
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`input-field !h-auto py-3.5 pl-11 resize-none ${error ? '!border-[#DC2626]' : ''} ${className}`}
            rows={3}
          />
        </div>
        {showCurrentLocation && (
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={gettingLocation}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-cream border border-line text-[0.875rem] font-semibold text-ink hover:bg-cream-deep transition-colors disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 text-flame ${gettingLocation ? 'animate-spin' : ''}`} />
            <span>{gettingLocation ? 'Finding you…' : 'Use my current location'}</span>
          </button>
        )}
        {error && (
          <p className="text-xs text-status-error">{error}</p>
        )}
        <p className="text-xs text-gray-500">
          Enter your full address manually in Koforidua (Google Maps API key not configured)
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-3">
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-flame" />
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`input-field !h-auto py-3.5 pl-11 resize-none ${error ? '!border-[#DC2626]' : ''} ${className}`}
            rows={3}
          />
        </div>
        {showCurrentLocation && (
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={gettingLocation}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-cream border border-line text-[0.875rem] font-semibold text-ink hover:bg-cream-deep transition-colors disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 text-flame ${gettingLocation ? 'animate-spin' : ''}`} />
            <span>{gettingLocation ? 'Finding you…' : 'Use my current location'}</span>
          </button>
        )}
        {error && (
          <p className="text-xs text-status-error">{error}</p>
        )}
        <p className="text-xs text-status-error">
          Google Maps failed to load. Please enter Koforidua address manually.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled
          className={`input-field pl-11 bg-cream ${className}`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-flame" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              const inputValue = e.target.value;
              // If user manually types a Plus Code, we'll format it when they finish typing
              onChange(inputValue);
            }}
            onBlur={async (e) => {
              // When user leaves the field, check if it's a Plus Code and format it
              const inputValue = e.target.value.trim();
              if (inputValue && (inputValue.includes('+') || inputValue.match(/^[A-Z0-9]+\+[A-Z0-9]+/))) {
                // Try to geocode the Plus Code
                if (apiKey && isLoaded && window.google) {
                  setIsLoading(true);
                  const geocoder = new google.maps.Geocoder();
                  geocoder.geocode(
                    { address: inputValue },
                    (results, status) => {
                      setIsLoading(false);
                      if (status === 'OK' && results && results[0] && results[0].geometry) {
                        const location = {
                          lat: results[0].geometry.location.lat(),
                          lng: results[0].geometry.location.lng(),
                        };
                        
                        // Check if location is within service area
                        if (!isWithinServiceArea(location.lat, location.lng)) {
                          setShowServiceAreaModal(true);
                          if (inputRef.current) {
                            inputRef.current.value = '';
                          }
                          onChange('', undefined);
                          return;
                        }
                        
                        // Now reverse geocode to get formatted address
                        formatAddressFromCoordinates(location.lat, location.lng, (formattedAddress) => {
                          onChange(formattedAddress, location);
                        });
                      }
                    }
                  );
                }
              }
            }}
            placeholder={placeholder}
            className={`input-field pl-11 ${error ? '!border-[#DC2626]' : ''} ${className}`}
            autoComplete="off"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-flame animate-spin" />
            </div>
          )}
        </div>
        {showCurrentLocation && (
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={gettingLocation}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-cream border border-line text-[0.875rem] font-semibold text-ink hover:bg-cream-deep transition-colors disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 text-flame ${gettingLocation ? 'animate-spin' : ''}`} />
            <span>{gettingLocation ? 'Finding you…' : 'Use my current location'}</span>
          </button>
        )}
        {error && (
          <p className="text-xs text-status-error">{error}</p>
        )}
      </div>
      
      {/* Service Area Modal - Rendered via React Portal at document.body */}
      <ServiceAreaModal
        isOpen={showServiceAreaModal}
        onClose={() => setShowServiceAreaModal(false)}
      />
    </>
  );
}
