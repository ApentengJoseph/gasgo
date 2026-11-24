'use client';

import { ReactNode } from 'react';
import { useLoadScript } from '@react-google-maps/api';

/**
 * Google Maps loads on demand: the script is only fetched when a component
 * that shows a map or address search calls useGoogleMaps(). Pages without a
 * map (like the homepage) never download it. useLoadScript loads the script
 * once and shares it between components.
 */
const libraries: ('places' | 'geometry')[] = ['places', 'geometry'];
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || '';

/** Kept for compatibility; maps no longer need a provider at the top of the app. */
export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useGoogleMaps() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || 'dummy-key',
    libraries,
    ...(apiKey ? {} : { preventGoogleFontsLoading: true }),
  });
  return { isLoaded, loadError };
}
