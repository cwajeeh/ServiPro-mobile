import { AuthorizationStatus, getToken, hasPermission } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

import { appStorage } from '@/utils/appStorage';
import { firebaseMessaging } from '@/utils/firebaseMessaging';
import { logUnexpectedError } from '@/utils/devLog';

const STORAGE_KEY = '@servisca/device_token_v1';

function envCfg(): Record<string, string | undefined> {
  if (Platform.OS === 'web') {
    return {};
  }
  try {
    return require('react-native-config').default as Record<string, string | undefined>;
  } catch {
    return {};
  }
}

/**
 * Values sent as `device_type` on auth + push registration.
 * Override with `DEVICE_TYPE_IOS` / `DEVICE_TYPE_ANDROID` in `.env` if the API expects
 * different strings (e.g. `iOS` / `Android`).
 */
export function getDeviceTypeForApi(): string {
  const cfg = envCfg();
  if (Platform.OS === 'ios') {
    const v = cfg.DEVICE_TYPE_IOS?.trim();
    return v || 'ios';
  }
  const v = cfg.DEVICE_TYPE_ANDROID?.trim();
  return v || 'android';
}

/** Keep storage in sync with the token sent to `registerPushDeviceToken` / login. */
export async function persistDeviceTokenForApi(token: string): Promise<void> {
  await appStorage.setItem(STORAGE_KEY, token.trim());
}

function randomUuid(): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) {
    return c.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Stable per-install id for API `device_token` until push (FCM/APNs) is wired. */
export async function getOrCreateDeviceToken(): Promise<string> {
  try {
    const msg = firebaseMessaging();
    const permission = await hasPermission(msg);
    if (
      permission === AuthorizationStatus.AUTHORIZED ||
      permission === AuthorizationStatus.PROVISIONAL
    ) {
      const fcmToken = await getToken(msg);
      if (fcmToken) {
        await appStorage.setItem(STORAGE_KEY, fcmToken);
        return fcmToken;
      }
    }
  } catch (error) {
    logUnexpectedError('getOrCreateDeviceToken', error);
  }

  const existing = await appStorage.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }
  const token = randomUuid();
  await appStorage.setItem(STORAGE_KEY, token);
  return token;
}
