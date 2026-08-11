import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { isAxiosError } from 'axios';
import { Platform } from 'react-native';

/** Android `CommonStatusCodes.DEVELOPER_ERROR` — almost always Firebase / OAuth config. */
export const GOOGLE_SIGN_IN_DEVELOPER_ERROR_CODE = '10';

/**
 * User-facing steps when Google shows DEVELOPER_ERROR (see also
 * https://react-native-google-signin.github.io/docs/troubleshooting ).
 */
export function getGoogleDeveloperErrorInstructions(): string {
  const pkg = 'com.facilcod.app';
  if (Platform.OS === 'android') {
    return [
      'Developer error: your Android app is not registered correctly with Google.',
      '',
      `1) Firebase Console → Project settings → Your apps → Android (${pkg}).`,
      '2) Add SHA-1 for the keystore that signs this build (debug uses ~/.android/debug.keystore).',
      '   From android/: ./gradlew signingReport — copy SHA-1 under Variant: debug, or: keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android',
      '3) Download the new google-services.json and place it in android/app/google-services.json.',
      '4) In .env set GOOGLE_WEB_CLIENT_ID to the Web client ID (Firebase → Web app), then rebuild the native app.',
      '5) Google Cloud Console → APIs & Services → OAuth consent screen must be configured (Testing/Production).',
    ].join('\n');
  }
  return [
    'Developer error: Google Sign-In OAuth client mismatch.',
    '',
    '1) Firebase / Google Cloud: iOS bundle ID must match the Xcode app.',
    '2) GOOGLE_WEB_CLIENT_ID in .env = Web client ID from Firebase (not iOS client ID). Rebuild the app.',
    '3) GoogleService-Info.plist must be from the same Firebase project; URL types include REVERSED_CLIENT_ID.',
  ].join('\n');
}

/** True if this is the common Android DEVELOPER_ERROR / status 10. */
export function isGoogleSignInDeveloperError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const { code, message } = error as { code?: string | number; message?: string };
  const msg = typeof message === 'string' ? message : '';
  const codeStr = code === undefined || code === null ? '' : String(code);
  if (codeStr === GOOGLE_SIGN_IN_DEVELOPER_ERROR_CODE) {
    return true;
  }
  return /developer_?error/i.test(msg) || /status code:\s*10/i.test(msg);
}

/** Thrown when the user dismisses Google Sign-In (do not show an error alert). */
export class GoogleSignInCancelledError extends Error {
  constructor() {
    super('Google Sign-In cancelled');
    this.name = 'GoogleSignInCancelledError';
  }
}

/**
 * Google sign-in → Firebase Auth → Firebase ID token for `POST /auth/firebase-login`
 * (same token shape as Apple sign-in). Sending only the raw Google OAuth JWT breaks
 * backends that use Firebase Admin `verifyIdToken`.
 *
 * @throws GoogleSignInCancelledError if the user closes the flow
 */
export async function signInWithGoogleIdToken(): Promise<string> {
  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const result = await GoogleSignin.signIn();
  if (result.type === 'cancelled') {
    throw new GoogleSignInCancelledError();
  }

  const tokens = await GoogleSignin.getTokens();
  const idToken = tokens.idToken;
  const accessToken = tokens.accessToken;

  if (!idToken) {
    throw new Error(
      'Google Sign-In did not return an ID token. Use the Web client OAuth ID from Firebase Console (Project settings → General → Your apps → Web app) as GOOGLE_WEB_CLIENT_ID, rebuild the native app, and on Android add your debug/release SHA-1 fingerprints for this package name.',
    );
  }

  const googleCredential = auth.GoogleAuthProvider.credential(idToken, accessToken);
  const userCredential = await auth().signInWithCredential(googleCredential);
  return userCredential.user.getIdToken();
}

export function isGoogleSignInCancelled(e: unknown): boolean {
  return e instanceof GoogleSignInCancelledError;
}

/** Prefer this in Google Sign-In catch blocks so DEVELOPER_ERROR shows fix steps. */
export function getGoogleSignInAlertMessage(error: unknown, fallback: string): string {
  if (isGoogleSignInDeveloperError(error)) {
    return getGoogleDeveloperErrorInstructions();
  }
  if (isAxiosError(error)) {
    return fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
