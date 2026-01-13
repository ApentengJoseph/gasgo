/**
 * Distance and Location Utilities
 * Using Google Maps Distance Matrix API and Haversine formula
 */

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate ETA using Google Maps Distance Matrix API
 */
export async function calculateETA(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  apiKey: string
): Promise<{ distance: number; duration: number }> {
  if (!apiKey) {
    // Fallback to Haversine
    const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const duration = distance * 2; // Rough estimate: 2 minutes per km
    return { distance, duration };
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?` +
        `origins=${origin.lat},${origin.lng}&` +
        `destinations=${destination.lat},${destination.lng}&` +
        `key=${apiKey}&` +
        `mode=driving&` +
        `units=metric`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      const element = data.rows[0].elements[0];
      return {
        distance: element.distance.value / 1000, // Convert to km
        duration: element.duration.value / 60, // Convert to minutes
      };
    }

    // Fallback
    const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const duration = distance * 2;
    return { distance, duration };
  } catch (error) {
    console.error('Error calculating ETA:', error);
    // Fallback
    const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const duration = distance * 2;
    return { distance, duration };
  }
}

/**
 * Check if location is within service area (Koforidua bounds)
 */
export function isWithinServiceArea(lat: number, lng: number): boolean {
  // Koforidua bounds (expanded to cover surrounding areas)
  const bounds = {
    north: 6.15, // Okorase, Osabene area
    south: 6.0,
    east: -0.2,
    west: -0.3,
  };

  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}

