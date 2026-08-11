import { nativeEnv } from '@/config/nativeEnv';

const DEFAULT_MEDIA_BASE = 'https://servisca-app.s3.eu-west-2.amazonaws.com';

/**
 * Base URL for Servisca CDN/S3 assets (icons, images). Override via env / react-native-config.
 */
export function getMediaBaseUrl(): string {
  const raw = nativeEnv.mediaBaseUrl || DEFAULT_MEDIA_BASE;
  return raw.replace(/\/+$/, '');
}

/**
 * Builds a full URL for images/icons. Absolute `http(s)://` values are unchanged.
 * Relative paths are joined to {@link getMediaBaseUrl}.
 */
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (path == null) {
    return null;
  }
  const s = String(path).trim();
  if (!s) {
    return null;
  }
  if (s.startsWith('http://') || s.startsWith('https://')) {
    return s;
  }
  if (s.startsWith('//')) {
    return `https:${s}`;
  }
  const base = getMediaBaseUrl();
  const pathPart = s.replace(/^\/+/, '');
  return `${base}/${pathPart}`;
}

/** Use {@link resolveMediaUrl} + `Image` when the value looks like a file/path, not a lone emoji. */
export function isRemoteMediaReference(value: string): boolean {
  const t = value.trim();
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('//')) {
    return true;
  }
  if (t.includes('/')) {
    return true;
  }
  return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(t);
}
