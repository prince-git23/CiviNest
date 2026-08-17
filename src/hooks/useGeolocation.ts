import { useCallback, useRef, useState } from 'react';

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationResult {
  position: GeoPosition | null;
  locating: boolean;
  error: string | null;
  requestLocation: () => void;
}

/**
 * Requests the browser's current location only when the user acts
 * (never tracks continuously). Handles permission denied, timeout,
 * unavailable position, and unsupported browsers.
 */
export function useGeolocation(): UseGeolocationResult {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const requestLocation = useCallback(() => {
    if (inFlight.current) return;

    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    inFlight.current = true;
    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        inFlight.current = false;
        setLocating(false);
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        inFlight.current = false;
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location permission was denied.');
        } else if (err.code === err.TIMEOUT) {
          setError('Location request timed out. Try again.');
        } else {
          setError('Unable to determine your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  return { position, locating, error, requestLocation };
}

export default useGeolocation;
