import { Platform } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

import type { ApiUser, UserRole } from '@/types/auth';
import { appStorage } from '@/utils/appStorage';

/** Legacy: full session JSON (web still uses this; native migrates to split storage). */
export const AUTH_STORAGE_KEY = '@servisca/auth_session_v1';

const AUTH_PROFILE_KEY = '@servisca/auth_profile_v1';
const SECURE_ACCESS_KEY = 'servisca_auth_access_v1';
const SECURE_REFRESH_KEY = 'servisca_auth_refresh_v1';

export type PersistedSession = {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
  provider: boolean;
  user: ApiUser;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function isUserRole(v: unknown): v is UserRole {
  return v === 'customer' || v === 'tasker';
}

function isApiUser(v: unknown): v is ApiUser {
  if (!isRecord(v)) {
    return false;
  }
  if (typeof v.id !== 'number' || typeof v.email !== 'string') {
    return false;
  }
  if (typeof v.provider !== 'boolean') {
    return false;
  }
  const role = v.role;
  if (!isRecord(role) || typeof role.name !== 'string') {
    return false;
  }
  return true;
}

function isSessionProfile(v: unknown): v is Pick<PersistedSession, 'user' | 'role' | 'provider'> {
  if (!isRecord(v)) {
    return false;
  }
  if (!isUserRole(v.role) || typeof v.provider !== 'boolean' || !isApiUser(v.user)) {
    return false;
  }
  return true;
}

function isPersistedSession(v: unknown): v is PersistedSession {
  if (!isRecord(v)) {
    return false;
  }
  if (typeof v.accessToken !== 'string' || typeof v.refreshToken !== 'string') {
    return false;
  }
  return isSessionProfile(v);
}

async function writeNativeSecureSession(session: PersistedSession): Promise<void> {
  await EncryptedStorage.setItem(SECURE_ACCESS_KEY, session.accessToken);
  await EncryptedStorage.setItem(SECURE_REFRESH_KEY, session.refreshToken);
  const profile = { user: session.user, role: session.role, provider: session.provider };
  await appStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
  await appStorage.removeItem(AUTH_STORAGE_KEY);
}

async function readNativeSecureSession(): Promise<PersistedSession | null> {
  const [accessToken, refreshToken, profileRaw] = await Promise.all([
    EncryptedStorage.getItem(SECURE_ACCESS_KEY),
    EncryptedStorage.getItem(SECURE_REFRESH_KEY),
    appStorage.getItem(AUTH_PROFILE_KEY),
  ]);
  if (!accessToken || !refreshToken || !profileRaw) {
    return null;
  }
  let profile: unknown;
  try {
    profile = JSON.parse(profileRaw);
  } catch {
    return null;
  }
  if (!isSessionProfile(profile)) {
    return null;
  }
  return {
    accessToken,
    refreshToken,
    user: profile.user,
    role: profile.role,
    provider: profile.provider,
  };
}

/** One-time migration from legacy single-file session to Keychain + profile file. */
async function migrateLegacyNativeSessionIfPresent(): Promise<PersistedSession | null> {
  const legacyRaw = await appStorage.getItem(AUTH_STORAGE_KEY);
  if (!legacyRaw) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(legacyRaw);
  } catch {
    return null;
  }
  if (!isPersistedSession(parsed)) {
    return null;
  }
  await writeNativeSecureSession(parsed);
  return parsed;
}

export async function readPersistedSession(): Promise<PersistedSession | null> {
  try {
    if (Platform.OS === 'web') {
      const raw = await appStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as unknown;
      return isPersistedSession(parsed) ? parsed : null;
    }

    const fromSecure = await readNativeSecureSession();
    if (fromSecure) {
      return fromSecure;
    }
    return await migrateLegacyNativeSessionIfPresent();
  } catch {
    return null;
  }
}

export async function writePersistedSession(session: PersistedSession): Promise<void> {
  if (Platform.OS === 'web') {
    await appStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return;
  }
  await writeNativeSecureSession(session);
}

export async function clearPersistedSession(): Promise<void> {
  if (Platform.OS === 'web') {
    await appStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  await EncryptedStorage.removeItem(SECURE_ACCESS_KEY).catch(() => {});
  await EncryptedStorage.removeItem(SECURE_REFRESH_KEY).catch(() => {});
  await appStorage.removeItem(AUTH_PROFILE_KEY);
  await appStorage.removeItem(AUTH_STORAGE_KEY);
}
