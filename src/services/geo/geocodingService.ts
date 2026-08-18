// ============================================================
// CiviNest Geocoding Service
// ============================================================
// Free, keyless geocoding backed by OpenStreetMap data (Photon / Komoot).
// Used for place search and reverse geocoding. No provider secrets live here;
// a private provider key could be wired in later via VITE_/GEOCODING_* env
// vars without changing the callers.

import type { GeoPoint } from './geoTypes';

export interface ReverseGeocodeResult {
  address: string;
  city: string;
  ward?: string; // derived only when real boundary data says so
  locality?: string;
  country?: string;
}

const REVERSE_URL = 'https://photon.komoot.io/reverse';
const SEARCH_URL = 'https://photon.komoot.io/api/';

interface PhotonProperties {
  name?: string;
  housenumber?: string;
  street?: string;
  district?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  osm_value?: string;
  type?: string;
}

function cleanParts(parts: (string | undefined)[]): string[] {
  return [...new Set(parts.map((p) => (p || '').trim()).filter(Boolean))];
}

/**
 * Reverse-geocode a coordinate into a human address. Ward is returned only
 * when the provider exposes a district/local boundary (never invented).
 */
export async function reverseGeocode(point: GeoPoint): Promise<ReverseGeocodeResult | null> {
  const url = `${REVERSE_URL}?lon=${point.longitude}&lat=${point.latitude}&lang=en`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const p: PhotonProperties = data?.features?.[0]?.properties;
    if (!p) return null;

    const streetParts = cleanParts([p.housenumber, p.street]);
    const street = streetParts.join(' ');
    const city = p.city || p.state || '';
    const locality = p.locality || p.district || '';
    const ward = p.district || (p.osm_value === 'district' ? p.name : undefined);

    const addressParts = cleanParts([street || p.name, locality || p.district, city, p.country]);
    const address = addressParts.join(', ') || point.latitude.toFixed(4) + ', ' + point.longitude.toFixed(4);

    return {
      address,
      city: city || 'Unknown city',
      ward: ward || undefined,
      locality: locality || undefined,
      country: p.country,
    };
  } catch {
    return null;
  }
}

export interface PlaceSearchResult {
  name: string;
  address: string;
  point: GeoPoint;
  type: 'locality' | 'ward' | 'landmark' | 'address';
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: PhotonProperties & { osm_type?: string };
}

function toType(value?: string): PlaceSearchResult['type'] {
  if (value === 'locality' || value === 'city' || value === 'district' || value === 'suburb' || value === 'county') {
    return 'locality';
  }
  if (value === 'street' || value === 'house' || value === 'address') {
    return 'address';
  }
  if (value === 'amenity' || value === 'building' || value === 'tourism') {
    return 'landmark';
  }
  return 'landmark';
}

function featureToResult(f: PhotonFeature): PlaceSearchResult {
  const p = f.properties;
  const name = p.name || p.street || 'Location';
  const parts = cleanParts([p.city, p.state, p.country]);
  const address = parts.length ? parts.join(', ') : name;
  const [lng, lat] = f.geometry.coordinates;
  return {
    name,
    address,
    point: { latitude: lat, longitude: lng },
    type: toType(p.type || p.osm_value),
  };
}

/** Search real places (streets, landmarks, localities) via the geocoder. */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceSearchResult[]> {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&limit=6&lang=en`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geocoder error ${res.status}`);
  const data = await res.json();
  return (data.features || []).map(featureToResult);
}

/** True when the geocoder responded — used to decide between live/fallback results. */
export async function isGeocoderReachable(timeoutMs = 4000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${SEARCH_URL}?q=Dharampeth&limit=1&lang=en`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
