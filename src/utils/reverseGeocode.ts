import { nativeEnv } from '@/config/nativeEnv';

/**
 * Reverse geocode via Google Geocoding API (replaces expo-location reverseGeocodeAsync).
 */
export async function reverseGeocodeLatLng(latitude: number, longitude: number): Promise<string | null> {
  const key = nativeEnv.googleMapsApiKey;
  if (!key) {
    return null;
  }
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${encodeURIComponent(key)}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status?: string;
    results?: Array<{ formatted_address?: string }>;
  };
  if (data.status !== 'OK' || !data.results?.[0]?.formatted_address) {
    return null;
  }
  return data.results[0].formatted_address ?? null;
}
