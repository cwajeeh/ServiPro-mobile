import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { devDebug } from '@/utils/devLog';

import { ENV } from './env';

export function configureSocialAuth() {
  const webClientId = ENV.GOOGLE_WEB_CLIENT_ID.trim();
  if (__DEV__ && !webClientId) {
    devDebug(
      '[Servisca] GOOGLE_WEB_CLIENT_ID is not set — add it to .env (Web client ID from Firebase) and rebuild the native app so react-native-config embeds it.',
    );
  }
  GoogleSignin.configure(
    webClientId
      ? {
          webClientId,
          // ID token for Firebase/backend does not require offline server auth; keeps setup simpler.
          offlineAccess: false,
        }
      : {},
  );
}
