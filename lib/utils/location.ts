/**
 * User location utilities
 * Saves and retrieves user location from localStorage
 */

const USER_LOCATION_KEY = 'gaso-user-location';

export interface UserLocation {
  lat: number;
  lng: number;
  timestamp: number; // When location was saved
}

/**
 * Save user location to localStorage
 */
export function saveUserLocation(location: { lat: number; lng: number }): void {
  if (typeof window === 'undefined') return;
  
  const locationData: UserLocation = {
    lat: location.lat,
    lng: location.lng,
    timestamp: Date.now(),
  };
  
  try {
    localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(locationData));
  } catch (error) {
    console.error('Error saving user location:', error);
  }
}

/**
 * Get saved user location from localStorage
 */
export function getSavedUserLocation(): UserLocation | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem(USER_LOCATION_KEY);
    if (!saved) return null;
    
    const locationData: UserLocation = JSON.parse(saved);
    
    // Location is valid for 24 hours
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - locationData.timestamp > TWENTY_FOUR_HOURS;
    
    if (isExpired) {
      // Remove expired location
      localStorage.removeItem(USER_LOCATION_KEY);
      return null;
    }
    
    return locationData;
  } catch (error) {
    console.error('Error reading user location:', error);
    return null;
  }
}

/**
 * Clear saved user location
 */
export function clearSavedUserLocation(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(USER_LOCATION_KEY);
  } catch (error) {
    console.error('Error clearing user location:', error);
  }
}

