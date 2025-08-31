import { useState, useEffect } from 'react';

interface GeolocationState {
  position: GeolocationPosition | null;
  error: GeolocationPositionError | null;
  isLoading: boolean;
}

export function useGeolocation(options?: PositionOptions) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        position: null,
        error: {
          code: 0,
          message: 'Geolocation is not supported by this browser.',
        } as GeolocationPositionError,
        isLoading: false,
      });
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        position,
        error: null,
        isLoading: false,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      setState({
        position: null,
        error,
        isLoading: false,
      });
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
        ...options,
      }
    );
  }, []);

  return state;
}

export function getDistanceFromLatLng(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
