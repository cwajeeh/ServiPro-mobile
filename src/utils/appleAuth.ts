import appleAuth, { AppleRequestOperation, AppleRequestScope } from '@invertase/react-native-apple-authentication';
import auth from '@react-native-firebase/auth';
import { Platform } from 'react-native';

/** True on iOS 13+ where Sign in with Apple is available. Always false on Android/web in this app. */
export function isAppleSignInSupported(): boolean {
  return Platform.OS === 'ios' && appleAuth.isSupported;
}

export function isAppleSignInCancelledError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const { code } = error as { code?: string | number };
  if (code === appleAuth.Error.CANCELED || code === '1001' || code === 1001) {
    return true;
  }
  if (code === 'ERR_CANCELED') {
    return true;
  }
  return false;
}

/**
 * Sign in with Apple → Firebase Auth → Firebase ID token for `POST /auth/firebase-login`.
 * Passes the raw nonce to Firebase (required for Apple); see Firebase Apple auth docs.
 */
export async function getFirebaseIdTokenFromApple(): Promise<string> {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign-In is only supported on iOS.');
  }
  if (!appleAuth.isSupported) {
    throw new Error('Apple Sign-In requires iOS 13 or later.');
  }

  const appleCredential = await appleAuth.performRequest({
    requestedOperation: AppleRequestOperation.LOGIN,
    requestedScopes: [AppleRequestScope.FULL_NAME, AppleRequestScope.EMAIL],
  });

  const { identityToken, nonce } = appleCredential;

  if (!identityToken) {
    throw new Error('Apple Sign-In did not return an identity token.');
  }

  const firebaseCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
  const userCredential = await auth().signInWithCredential(firebaseCredential);
  return userCredential.user.getIdToken();
}
