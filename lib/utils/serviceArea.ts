/**
 * Service area bounds and validation
 * Defines the operational area for GasRefill delivery service
 */

export interface ServiceAreaBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Expanded Koforidua service area bounds
 * Covers: Koforidua, Oyoko, Okorase, Osabene, Asokore, Effiduase, Adweso, Large Town, and surrounding areas
 */
export const KOFORIDUA_SERVICE_AREA: ServiceAreaBounds = {
  minLat: 5.90,  // Extended south to cover Large Town and beyond
  maxLat: 6.25,  // Extended north to cover Okorase, Oyoko and beyond
  minLng: -0.38, // Extended west to cover Osabene and beyond
  maxLng: -0.12, // Extended east to cover surrounding areas
};

/**
 * Check if a location is within the service area
 */
export function isWithinServiceArea(lat: number, lng: number): boolean {
  return (
    lat >= KOFORIDUA_SERVICE_AREA.minLat &&
    lat <= KOFORIDUA_SERVICE_AREA.maxLat &&
    lng >= KOFORIDUA_SERVICE_AREA.minLng &&
    lng <= KOFORIDUA_SERVICE_AREA.maxLng
  );
}

/**
 * Get Google Maps LatLngBounds for the service area
 */
export function getServiceAreaBounds(): {
  southwest: { lat: number; lng: number };
  northeast: { lat: number; lng: number };
} {
  return {
    southwest: {
      lat: KOFORIDUA_SERVICE_AREA.minLat,
      lng: KOFORIDUA_SERVICE_AREA.minLng,
    },
    northeast: {
      lat: KOFORIDUA_SERVICE_AREA.maxLat,
      lng: KOFORIDUA_SERVICE_AREA.maxLng,
    },
  };
}

