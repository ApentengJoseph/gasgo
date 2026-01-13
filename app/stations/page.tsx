'use client';

import { useState, useMemo, useEffect } from 'react';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { MapPin, Clock, CheckCircle, Flame, Star, Map, Navigation, BadgeCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGuestOrder } from '@/lib/store/guestOrder';
import StarRating from '@/components/Rating/StarRating';
import MapView from '@/components/Map/MapView';
import { calculateDistance } from '@/lib/utils/pricing';
import { formatDuration } from '@/lib/utils/delivery';
import { saveUserLocation, getSavedUserLocation } from '@/lib/utils/location';

// Real Koforidua station data
const stationsData = [
  {
    no: 1,
    gas_station_name: 'Goil Gas Station',
    location_description: 'Near Koforidua–Nsutam Rd, Koforidua',
    latitude: 6.098813,
    longitude: -0.27765,
    price_per_kg_ghs: 12.86,
    price_per_litre_ghs: 7.0,
    google_maps_status: true,
  },
  {
    no: 2,
    gas_station_name: 'Lartey Gas',
    location_description: 'Suhum Road, Near All Nations School, Koforidua',
    latitude: 6.109447,
    longitude: -0.292065,
    price_per_kg_ghs: 12.86,
    price_per_litre_ghs: 7.0,
    google_maps_status: true,
  },
  {
    no: 3,
    gas_station_name: 'Morgas',
    location_description: 'Suhum Road, Koforidua',
    latitude: 6.1076519,
    longitude: -0.2799717,
    price_per_kg_ghs: 15.0,
    price_per_litre_ghs: null,
    google_maps_status: false,
  },
  {
    no: 4,
    gas_station_name: 'Express Gas (Trinity Oil / Owusu Gas)',
    location_description: 'Near Effiduasi Technical Institute (Effitech), Close to Asokore, Koforidua',
    latitude: 6.105526,
    longitude: -0.277021,
    price_per_kg_ghs: 15.0,
    price_per_litre_ghs: null,
    google_maps_status: true,
  },
  {
    no: 5,
    gas_station_name: 'Anasset Gas (Bance) / Anasset Company Limited',
    location_description: 'Pipeline Road, Koforidua',
    latitude: 6.117014,
    longitude: -0.251796,
    price_per_kg_ghs: 13.33,
    price_per_litre_ghs: 7.7,
    google_maps_status: true,
  },
  {
    no: 6,
    gas_station_name: 'Manbah Gas',
    location_description: 'Pipeline Road, Koforidua',
    latitude: 6.11364,
    longitude: -0.249552,
    price_per_kg_ghs: 13.01,
    price_per_litre_ghs: 7.16,
    google_maps_status: true,
  },
  {
    no: 7,
    gas_station_name: 'Dukes Gas (Total 4)',
    location_description: 'Total 4, Koforidua',
    latitude: 6.104499,
    longitude: -0.250154,
    price_per_kg_ghs: 14.28,
    price_per_litre_ghs: 7.7,
    google_maps_status: true,
  },
  {
    no: 8,
    gas_station_name: 'Yokwa Gas Company Limited',
    location_description: 'Adweso Road, close to Galloway, Near School of Nursing',
    latitude: 6.0754564,
    longitude: -0.2499899,
    price_per_kg_ghs: 15.0,
    price_per_litre_ghs: 7.3,
    google_maps_status: false,
  },
];

// Standard cylinder sizes
const standardSizes = [
  { kg: 6, label: '6kg' },
  { kg: 12, label: '12kg' },
  { kg: 25, label: '25kg' },
];

interface StationWithDistance {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  pricePerKg: number;
  distance?: number; // One-way distance in km
  roundtripDistance?: number; // Roundtrip distance in km
  estimatedTime?: number; // in minutes
  rating: number; // Default rating, can be updated later
  googleMapsVerified: boolean; // Verified on Google Maps
}

export default function StationsPage() {
  const router = useRouter();
  const { updateStation, updateCylinder } = useGuestOrder();
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [selectedKg, setSelectedKg] = useState<number | null>(null);
  const [customKg, setCustomKg] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Get user's current location (only once, saved to localStorage)
  useEffect(() => {
    const getUserLocation = () => {
      // First, check if we have a saved location
      const savedLocation = getSavedUserLocation();
      if (savedLocation) {
        setUserLocation({ lat: savedLocation.lat, lng: savedLocation.lng });
        setGettingLocation(false);
        setLocationError(null);
        return;
      }

      // If no saved location, fetch it once
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser');
        // Default to Koforidua center if geolocation not available
        setUserLocation({ lat: 6.0833, lng: -0.2500 });
        return;
      }

      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          // Save location to localStorage
          saveUserLocation(location);
          
          setUserLocation(location);
          setGettingLocation(false);
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to get your location');
          // Default to Koforidua center
          setUserLocation({ lat: 6.0833, lng: -0.2500 });
          setGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

    getUserLocation();
  }, []);

  // Calculate distance and ETA for each station
  const stationsWithDistance = useMemo(() => {
    if (!userLocation) return [];

    return stationsData.map((station) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        station.latitude,
        station.longitude
      );

      // Estimate delivery time using tricycle speed (22 km/h average in urban areas)
      // Add 5 minutes for loading at station
      const tricycleSpeed = 22; // km/h
      const estimatedTime = Math.round((distance / tricycleSpeed) * 60) + 5;

      // Calculate roundtrip distance (to station + back to customer)
      const roundtripDistance = distance * 2;

      return {
        id: station.no.toString(),
        name: station.gas_station_name,
        address: station.location_description,
        coordinates: { lat: station.latitude, lng: station.longitude },
        pricePerKg: station.price_per_kg_ghs,
        distance, // One-way distance
        roundtripDistance, // Roundtrip distance
        estimatedTime,
        rating: 4.5, // Default rating, can be updated from API later
        googleMapsVerified: station.google_maps_status || false,
      };
    });
  }, [userLocation]);

  // Sort stations by distance (closest first)
  const sortedStations = useMemo(() => {
    return [...stationsWithDistance].sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [stationsWithDistance]);

  const handleSelectStation = (stationId: string) => {
    setSelectedStation(stationId);
    const station = sortedStations.find((s) => s.id === stationId);
    if (station) {
      updateStation(stationId, station.name);
    }
  };

  const handleSelectKg = (kg: number) => {
    setSelectedKg(kg);
    setCustomKg(''); // Clear custom input when selecting standard size
  };

  const handleCustomKgChange = (value: string) => {
    setCustomKg(value);
    const kg = parseFloat(value);
    if (!isNaN(kg) && kg > 0) {
      setSelectedKg(kg);
    } else {
      setSelectedKg(null);
    }
  };

  const handleContinue = () => {
    if (selectedStation && selectedKg) {
      setLoading(true);
      const station = sortedStations.find((s) => s.id === selectedStation);
      if (!station) {
        setLoading(false);
        return;
      }

      const totalPrice = station.pricePerKg * selectedKg;
      const cylinderName = customKg ? `${selectedKg}kg Cylinder` : `${selectedKg}kg Cylinder`;

      // Save to guest order
      updateCylinder(selectedKg.toString(), cylinderName, totalPrice);

      // Navigate to order page
      router.push('/order');
    }
  };

  const selectedStationData = sortedStations.find((s) => s.id === selectedStation);
  const finalKg = selectedKg || 0;
  const calculatedPrice = selectedStationData && finalKg > 0 
    ? selectedStationData.pricePerKg * finalKg 
    : 0;

  // Koforidua center coordinates for map
  const koforiduaCenter = { lat: 6.0833, lng: -0.2500 };

  // Prepare map markers from stations
  const mapMarkers = useMemo(
    () =>
      sortedStations.map((station) => ({
        id: station.id,
        position: station.coordinates,
        label: station.name,
      })),
    [sortedStations]
  );

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-bold text-gray-900 mb-2">Select Station</h1>
          <p className="text-gray-600">Choose a nearby station and gas size</p>
        </div>
        <button
          onClick={() => setShowMap(!showMap)}
          className="px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
        >
          <Map className="w-3.5 h-3.5" />
          <span className="text-xs font-medium whitespace-nowrap">{showMap ? 'Hide' : 'Show'} Map</span>
        </button>
      </div>

      {/* Location Status */}
      {gettingLocation && (
        <GlassCard className="p-4 bg-brand-deep-blue/5 border-brand-deep-blue/20">
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5 text-brand-deep-blue animate-spin" />
            <p className="text-sm text-gray-700">Getting your location...</p>
          </div>
        </GlassCard>
      )}

      {/* Location Permission Denied - Explanation */}
      {locationError && !gettingLocation && (
        <GlassCard className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Location Access Needed</h3>
              <p className="text-sm text-gray-700 mb-3">
                We need your location to provide accurate distance and delivery time estimates.
              </p>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Calculate exact distance from your location to each gas station</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Provide accurate estimated delivery times</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Show your location on the map for better navigation</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Sort stations by proximity to find the nearest one</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setGettingLocation(true);
                  setLocationError(null);
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                      };
                      
                      // Save location to localStorage
                      saveUserLocation(location);
                      
                      setUserLocation(location);
                      setGettingLocation(false);
                      setLocationError(null);
                    },
                    (error) => {
                      setLocationError('Unable to get your location');
                      setUserLocation({ lat: 6.0833, lng: -0.2500 });
                      setGettingLocation(false);
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 10000,
                      maximumAge: 0,
                    }
                  );
                }}
                className="mt-3 px-4 py-2 bg-brand-deep-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-corporate-blue transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Map View */}
      {showMap && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MapView
            center={userLocation || koforiduaCenter}
            markers={mapMarkers}
            userLocation={userLocation}
            selectedMarkerId={selectedStation}
            zoom={14}
            height="300px"
            className="mb-6"
          />
        </motion.div>
      )}

      {/* Station List */}
      <div className="space-y-4">
        {sortedStations.map((station, index) => (
          <motion.div
            key={station.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <GlassCard
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedStation === station.id ? 'ring-2 ring-brand-deep-blue shadow-lg' : ''
              }`}
              onClick={() => handleSelectStation(station.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-title-md font-bold text-gray-900">{station.name}</h3>
                    {selectedStation === station.id && (
                      <CheckCircle className="w-5 h-5 text-brand-deep-blue" />
                    )}
                    {station.googleMapsVerified && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-full">
                        <BadgeCheck className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs font-semibold text-green-700">Verified on Google</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-1 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-deep-blue/10 text-brand-deep-blue rounded-full border border-brand-deep-blue/20">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="font-semibold">{station.distance ? `${station.distance.toFixed(1)} km` : 'N/A'}</span>
                      <span className="text-xs opacity-70">({station.roundtripDistance ? `${station.roundtripDistance.toFixed(1)} km RT` : 'N/A'})</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-energy-orange/10 text-brand-energy-orange rounded-full border border-brand-energy-orange/20">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-semibold">{station.estimatedTime ? formatDuration(station.estimatedTime) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <StarRating rating={station.rating} readonly size="sm" />
                      <span className="text-sm font-semibold text-gray-700">{station.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{station.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-title-md font-bold text-brand-deep-blue">
                    GH₵{station.pricePerKg.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">per kg</p>
                </div>
              </div>

              {/* Size Selection */}
              {selectedStation === station.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Select Gas Size:</p>
                  
                  {/* Standard Sizes */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {standardSizes.map((size) => (
                      <button
                        key={size.kg}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectKg(size.kg);
                        }}
                        className={`
                          p-3 rounded-lg border-2 transition-all
                          ${
                            selectedKg === size.kg && !customKg
                              ? 'border-brand-deep-blue bg-brand-deep-blue/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="text-center">
                          <Flame className="w-6 h-6 mx-auto mb-1 text-brand-energy-orange" />
                          <p className="text-sm font-semibold text-gray-900">{size.label}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Custom Kg Input */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or enter custom size (kg):
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={customKg}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCustomKgChange(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="e.g., 10.5"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-deep-blue focus:border-brand-deep-blue text-sm"
                    />
                  </div>

                  {/* Price Preview */}
                  {selectedKg && selectedKg > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {selectedKg}kg × GH₵{station.pricePerKg.toFixed(2)}/kg
                        </span>
                        <span className="text-lg font-bold text-brand-deep-blue">
                          GH₵{calculatedPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Continue Button */}
      {selectedStation && selectedKg && selectedKg > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PrimaryButton fullWidth size="lg" onClick={handleContinue} loading={loading}>
            Continue to Address
          </PrimaryButton>
        </motion.div>
      )}

      {/* Empty State - No stations available */}
      {sortedStations.length === 0 && (
        <GlassCard className="p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-title-md font-semibold text-gray-900 mb-2">No stations available</h3>
          <p className="text-gray-600">We&apos;re currently expanding our network. Check back soon!</p>
        </GlassCard>
      )}
    </div>
  );
}
