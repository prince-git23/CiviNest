// ============================================================
// CiviNest Geolocation Service
// ============================================================

import type { GeoPoint } from './geoTypes';

export interface GeolocationResult {
  point: GeoPoint;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED';
  message: string;
}

const DEFAULT_NAGPUR: GeoPoint = {
  latitude: 21.1458,
  longitude: 79.0882,
};

export async function getCurrentPosition(
  timeoutMs = 10000,
  enableHighAccuracy = true
): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 'UNSUPPORTED',
        message: 'Geolocation is not supported by your browser.',
      } as GeolocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          point: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let code: GeolocationError['code'];
        let message: string;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            code = 'PERMISSION_DENIED';
            message = 'Location permission denied. You can manually select a location.';
            break;
          case error.POSITION_UNAVAILABLE:
            code = 'POSITION_UNAVAILABLE';
            message = 'Location unavailable. Using default location.';
            break;
          case error.TIMEOUT:
            code = 'TIMEOUT';
            message = 'Location request timed out.';
            break;
          default:
            code = 'POSITION_UNAVAILABLE';
            message = 'Unable to determine location.';
        }

        reject({ code, message } as GeolocationError);
      },
      {
        enableHighAccuracy,
        timeout: timeoutMs,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

export function getDefaultLocation(): GeoPoint {
  return DEFAULT_NAGPUR;
}

// Watch position for continuous updates (use sparingly)
export function watchPosition(
  callback: (point: GeoPoint) => void,
  errorCallback?: (error: GeolocationError) => void
): () => void {
  if (!navigator.geolocation) {
    errorCallback?.({
      code: 'UNSUPPORTED',
      message: 'Geolocation not supported.',
    });
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => {
      errorCallback?.({
        code: 'POSITION_UNAVAILABLE',
        message: error.message,
      });
    },
    { enableHighAccuracy: true, maximumAge: 30000 }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}

// Format coordinates for display
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
}

// Format distance
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
