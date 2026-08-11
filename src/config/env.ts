import { nativeEnv } from '@/config/nativeEnv';

export const ENV = {
  GOOGLE_MAPS_API_KEY: nativeEnv.googleMapsApiKey,
  GOOGLE_WEB_CLIENT_ID: nativeEnv.googleWebClientId,
};

export function isGoogleWebClientConfigured(): boolean {
  return ENV.GOOGLE_WEB_CLIENT_ID.trim().length > 0;
}
