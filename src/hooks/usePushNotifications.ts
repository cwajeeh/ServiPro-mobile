import {
  AuthorizationStatus,
  getInitialNotification,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import { isAxiosError } from 'axios';
import { useCallback, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';

import { registerPushDeviceToken } from '@/api/pushDevice';
import { nativeEnv } from '@/config/nativeEnv';
import { navigateToNotifications } from '@/navigation/navigationRef';
import { useAuthStore } from '@/store/authStore';
import { firebaseMessaging } from '@/utils/firebaseMessaging';
import { devDebug, logUnexpectedError } from '@/utils/devLog';

function openNotificationsDeepLink() {
  navigateToNotifications();
}

export function usePushNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const lastRegisteredToken = useRef<string | null>(null);

  const syncTokenToBackend = useCallback(async (fcmToken: string) => {
    if (!useAuthStore.getState().isAuthenticated || !fcmToken || lastRegisteredToken.current === fcmToken) {
      return;
    }
    try {
      await registerPushDeviceToken(fcmToken);
      lastRegisteredToken.current = fcmToken;
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        if (status === 404 || status === 501) {
          devDebug('Push device registration endpoint not implemented on server');
          return;
        }
        if (status === 401) {
          return;
        }
        if (__DEV__ && status === 400) {
          const bodyStr =
            typeof data === 'string' ? data : data !== undefined ? JSON.stringify(data, null, 2) : '(empty body)';
          devDebug(
            '[registerPushDeviceToken] 400 — POST',
            nativeEnv.userDeviceTokenPath,
            bodyStr,
            'If you see "Cannot POST …", set USER_DEVICE_TOKEN_PATH in .env to the route your API exposes (e.g. /auth/device-token) and rebuild.',
          );
          return;
        }
      }
      logUnexpectedError('registerPushDeviceToken', error);
    }
  }, []);

  useEffect(() => {
    const msg = firebaseMessaging();

    const requestUserPermission = async () => {
      if (Platform.OS === 'ios') {
        const authStatus = await requestPermission(msg);
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          devDebug('Push notification permission not granted (iOS)');
          return;
        }
      } else if (Platform.OS === 'android' && Platform.Version >= 33) {
        const authStatus = await requestPermission(msg);
        if (authStatus !== AuthorizationStatus.AUTHORIZED) {
          devDebug('Push notification permission not granted (Android)');
          return;
        }
      }

      try {
        await getToken(msg);
        devDebug('FCM token obtained (not logged in production)');
      } catch (error) {
        logUnexpectedError('usePushNotifications.getToken', error);
      }
    };

    void requestUserPermission();

    const unsubscribe = onMessage(msg, async (remoteMessage) => {
      if (__DEV__) {
        devDebug('[FCM] foreground', remoteMessage.messageId, remoteMessage.notification?.title);
      }

      const title = remoteMessage.notification?.title || 'New Notification';
      const body = remoteMessage.notification?.body || '';

      Alert.alert(title, body, [
        { text: 'Dismiss', style: 'cancel' },
        { text: 'View', onPress: openNotificationsDeepLink },
      ]);
    });

    const unsubOpened = onNotificationOpenedApp(msg, () => {
      openNotificationsDeepLink();
    });

    void getInitialNotification(msg).then((remoteMessage) => {
      if (remoteMessage) {
        openNotificationsDeepLink();
      }
    });

    const unsubscribeTokenRefresh = onTokenRefresh(msg, (token) => {
      lastRegisteredToken.current = null;
      devDebug('FCM token refreshed (not logged in production)');
      if (token) {
        void syncTokenToBackend(token);
      }
    });

    return () => {
      unsubscribe();
      unsubOpened();
      unsubscribeTokenRefresh();
    };
  }, [syncTokenToBackend]);

  useEffect(() => {
    if (!isAuthenticated) {
      lastRegisteredToken.current = null;
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const token = await getToken(firebaseMessaging());
        if (!cancelled && token) {
          await syncTokenToBackend(token);
        }
      } catch (error) {
        if (!cancelled) {
          logUnexpectedError('usePushNotifications.syncToken', error);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, syncTokenToBackend]);
}
