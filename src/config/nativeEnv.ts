import { Platform } from 'react-native';

const DEFAULT_WEB = 'https://www.servisca.co.uk';
/** Dev builds default to staging API; release builds default to production. */
const DEFAULT_API = __DEV__ ? 'https://staging-api.servisca.co.uk' : 'https://api.servisca.co.uk';
const DEFAULT_MEDIA = 'https://servisca-app.s3.eu-west-2.amazonaws.com';

function fromProcess(key: string): string {
  const v = process.env[key];
  return typeof v === 'string' ? v.trim() : '';
}

function loadConfig(): Record<string, string | undefined> {
  if (Platform.OS === 'web') {
    return {};
  }
  try {
    return require('react-native-config').default as Record<string, string | undefined>;
  } catch {
    return {};
  }
}

const cfg = loadConfig();

function cfgString(key: string): string {
  const v = cfg[key as keyof typeof cfg];
  return typeof v === 'string' ? v.trim() : '';
}

function pickEnv(key: keyof typeof cfg, fallback: string): string {
  const a = cfg[key];
  if (typeof a === 'string' && a.trim()) {
    return a.trim();
  }
  const b = fromProcess(key);
  if (b) {
    return b;
  }
  return fallback;
}

/** Empty = do not POST FCM token after login (many APIs only accept it on `/auth/login`). */
const rawDeviceTokenPath = pickEnv('USER_DEVICE_TOKEN_PATH', '').replace(/\/$/, '').trim();
const deviceTokenPath = rawDeviceTokenPath
  ? rawDeviceTokenPath.startsWith('/')
    ? rawDeviceTokenPath
    : `/${rawDeviceTokenPath}`
  : '';

/** JSON keys for POST device-token (some backends use e.g. fcm_token / platform). */
const pushTokenField = pickEnv('PUSH_DEVICE_TOKEN_FIELD', 'device_token');
const pushTypeField = pickEnv('PUSH_DEVICE_TYPE_FIELD', 'device_type');

function pickGoogleWebClientId(): string {
  const fromEnv = pickEnv('GOOGLE_WEB_CLIENT_ID', '');
  if (fromEnv) {
    return fromEnv;
  }
  return cfgString('GOOGLE_WEB_CLIENT_ID_FIREBASE');
}

const webBase = pickEnv('SERVISCA_WEB_URL', DEFAULT_WEB).replace(/\/$/, '');
const deleteMethodRaw = pickEnv('USER_DELETE_ACCOUNT_METHOD', 'DELETE').toUpperCase();
const userDeleteAccountMethod: 'DELETE' | 'POST' = deleteMethodRaw === 'POST' ? 'POST' : 'DELETE';

export const nativeEnv = {
  apiUrl: pickEnv('API_URL', DEFAULT_API),
  mediaBaseUrl: pickEnv('MEDIA_BASE_URL', DEFAULT_MEDIA),
  webBaseUrl: webBase,
  termsUrl: pickEnv('TERMS_URL', `${webBase}/terms`),
  privacyUrl: pickEnv('PRIVACY_URL', `${webBase}/privacy-policy`),
  faqUrl: pickEnv('FAQ_URL', `${webBase}/help`),
  sentryDsn: pickEnv('SENTRY_DSN', ''),
  /** Backend route for account deletion (default DELETE). */
  userDeleteAccountPath: pickEnv('USER_DELETE_ACCOUNT_PATH', '/user/account'),
  /** `DELETE` or `POST` — must match your API. */
  userDeleteAccountMethod,
  googleMapsApiKey: pickEnv('GOOGLE_MAPS_API_KEY', ''),
  googleWebClientId: pickGoogleWebClientId(),
  stripePublishableKey: pickEnv('STRIPE_PUBLISHABLE_KEY', ''),
  userDeviceTokenPath: deviceTokenPath,
  pushDeviceTokenJsonKey: pushTokenField || 'device_token',
  pushDeviceTypeJsonKey: pushTypeField || 'device_type',
};
