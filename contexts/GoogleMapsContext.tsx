'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useLoadScript } from '@react-google-maps/api';

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

const libraries: ('places' | 'geometry' | 'drawing')[] = ['places', 'geometry', 'drawing'];

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
                 process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || 
                 '';

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || 'dummy-key',
    libraries,
    ...(apiKey ? {} : { preventGoogleFontsLoading: true }),
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
}

