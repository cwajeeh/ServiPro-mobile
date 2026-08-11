import { apiClient } from '@/api/client';
import { nativeEnv } from '@/config/nativeEnv';
import { getDeviceTypeForApi, persistDeviceTokenForApi } from '@/utils/deviceToken';

/**
 * Registers the FCM/APNs token for push notifications when `USER_DEVICE_TOKEN_PATH` is set.
 * Otherwise only persists locally — login flows already send `device_token` + `device_type`.
 */
export async function registerPushDeviceToken(fcmToken: string): Promise<void> {
  const trimmed = fcmToken.trim();
  if (!trimmed) {
    return;
  }
  await persistDeviceTokenForApi(trimmed);
  const path = nativeEnv.userDeviceTokenPath;
  if (!path) {
    return;
  }
  const body: Record<string, string> = {
    [nativeEnv.pushDeviceTokenJsonKey]: trimmed,
    [nativeEnv.pushDeviceTypeJsonKey]: getDeviceTypeForApi(),
  };
  await apiClient.post(path, body);
}
