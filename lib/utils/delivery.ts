/**
 * Delivery time and distance calculation using Google Maps API
 * Accounts for tricycle delivery vehicle
 */

export interface DeliveryRoute {
  riderToStation: {
    distance: number; // in km
    duration: number; // in minutes
  };
  stationToCustomer: {
    distance: number; // in km
    duration: number; // in minutes
  };
  total: {
    distance: number; // in km
    duration: number; // in minutes
  };
}

export interface Position {
  lat: number;
  lng: number;
}

/**
 * Calculate delivery ETA using Google Maps Distance Matrix API
 * Route: Rider Location → Station → Customer Location
 */
export async function calculateDeliveryETA(
  riderPosition: Position,
  stationPosition: Position,
  customerPosition: Position,
  apiKey: string
): Promise<DeliveryRoute> {
  // Check if we're in browser and have Google Maps loaded
  if (typeof window === 'undefined' || !apiKey || !(window as any).google) {
    // Fallback calculation using Haversine formula
    return calculateFallbackETA(riderPosition, stationPosition, customerPosition);
  }

  const google = (window as any).google;

  try {
    const service = new google.maps.DistanceMatrixService();

    // Calculate Rider → Station
    const riderToStationPromise = new Promise<{ distance: number; duration: number }>((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [{ lat: riderPosition.lat, lng: riderPosition.lng }],
          destinations: [{ lat: stationPosition.lat, lng: stationPosition.lng }],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
        },
        (response, status) => {
          if (status === 'OK' && response && response.rows[0] && response.rows[0].elements[0]) {
            const element = response.rows[0].elements[0];
            if (element.status === 'OK') {
              resolve({
                distance: element.distance.value / 1000, // Convert meters to km
                duration: element.duration.value / 60, // Convert seconds to minutes
              });
            } else {
              reject(new Error(element.status));
            }
          } else {
            reject(new Error(status || 'Unknown error'));
          }
        }
      );
    });

    // Calculate Station → Customer
    const stationToCustomerPromise = new Promise<{ distance: number; duration: number }>((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [{ lat: stationPosition.lat, lng: stationPosition.lng }],
          destinations: [{ lat: customerPosition.lat, lng: customerPosition.lng }],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
        },
        (response, status) => {
          if (status === 'OK' && response && response.rows[0] && response.rows[0].elements[0]) {
            const element = response.rows[0].elements[0];
            if (element.status === 'OK') {
              resolve({
                distance: element.distance.value / 1000, // Convert meters to km
                duration: element.duration.value / 60, // Convert seconds to minutes
              });
            } else {
              reject(new Error(element.status));
            }
          } else {
            reject(new Error(status || 'Unknown error'));
          }
        }
      );
    });

    const [riderToStation, stationToCustomer] = await Promise.all([
      riderToStationPromise,
      stationToCustomerPromise,
    ]);

    // Adjust for tricycle speed (typically 20-25 km/h in urban areas vs car speed)
    // Google Maps assumes car speed, so we multiply by 1.3-1.5 for tricycle
    const tricycleMultiplier = 1.4; // Tricycle is ~30% slower than car

    const adjustedRiderToStation = {
      distance: riderToStation.distance,
      duration: Math.round(riderToStation.duration * tricycleMultiplier),
    };

    const adjustedStationToCustomer = {
      distance: stationToCustomer.distance,
      duration: Math.round(stationToCustomer.duration * tricycleMultiplier),
    };

    return {
      riderToStation: adjustedRiderToStation,
      stationToCustomer: adjustedStationToCustomer,
      total: {
        distance: Math.round((adjustedRiderToStation.distance + adjustedStationToCustomer.distance) * 10) / 10,
        duration: adjustedRiderToStation.duration + adjustedStationToCustomer.duration,
      },
    };
  } catch (error) {
    console.error('Error calculating delivery ETA:', error);
    // Fallback to Haversine calculation
    return calculateFallbackETA(riderPosition, stationPosition, customerPosition);
  }
}

/**
 * Fallback calculation using Haversine formula (straight-line distance)
 * Used when Google Maps API is not available
 */
function calculateFallbackETA(
  riderPosition: Position,
  stationPosition: Position,
  customerPosition: Position
): DeliveryRoute {
  const calculateDistance = (pos1: Position, pos2: Position): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(pos2.lat - pos1.lat);
    const dLon = toRad(pos2.lng - pos1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(pos1.lat)) *
        Math.cos(toRad(pos2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees: number): number => (degrees * Math.PI) / 180;

  // Calculate distances
  const riderToStationDistance = calculateDistance(riderPosition, stationPosition);
  const stationToCustomerDistance = calculateDistance(stationPosition, customerPosition);

  // Estimate time using tricycle average speed (22 km/h in urban areas)
  const tricycleSpeed = 22; // km/h
  const riderToStationDuration = Math.round((riderToStationDistance / tricycleSpeed) * 60);
  const stationToCustomerDuration = Math.round((stationToCustomerDistance / tricycleSpeed) * 60);

  // Add buffer time for loading at station (5 minutes)
  const stationLoadingTime = 5;

  return {
    riderToStation: {
      distance: Math.round(riderToStationDistance * 10) / 10,
      duration: riderToStationDuration,
    },
    stationToCustomer: {
      distance: Math.round(stationToCustomerDistance * 10) / 10,
      duration: stationToCustomerDuration,
    },
    total: {
      distance: Math.round((riderToStationDistance + stationToCustomerDistance) * 10) / 10,
      duration: riderToStationDuration + stationToCustomerDuration + stationLoadingTime,
    },
  };
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${mins} min`;
}

