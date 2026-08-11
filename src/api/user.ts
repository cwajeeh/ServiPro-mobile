import { isAxiosError } from 'axios';

import { apiClient } from '@/api/client';
import { nativeEnv } from '@/config/nativeEnv';
import type { UpdateProfilePayload, UserProfileResponse } from '@/types/user';

export async function fetchUserProfile(): Promise<UserProfileResponse> {
  const { data } = await apiClient.get<UserProfileResponse>('/user/profile');
  return data;
}

export async function updateUserProfile(payload: UpdateProfilePayload): Promise<UserProfileResponse> {
  const { data } = await apiClient.patch<UserProfileResponse>('/user/profile', payload);
  return data;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** Parses GET /user/online-status body — tolerates wrapped or flat shapes; never throws. */
function parseOnlineStatusPayload(data: unknown): boolean {
  if (!isRecord(data)) {
    return false;
  }

  const scRaw = data.statusCode;
  if (scRaw !== undefined && scRaw !== null) {
    const n = typeof scRaw === 'string' ? Number(scRaw) : scRaw;
    if (typeof n === 'number' && !Number.isNaN(n) && n >= 400) {
      return false;
    }
  }

  const inner = data.data;
  if (isRecord(inner) && typeof inner.is_online === 'boolean') {
    return inner.is_online;
  }

  if (typeof data.is_online === 'boolean') {
    return data.is_online;
  }

  return false;
}

/**
 * GET /user/online-status — returns whether the tasker is marked online.
 * On network/auth errors or unexpected JSON, returns false (assume offline) without throwing.
 */
export async function fetchUserOnlineStatus(): Promise<boolean> {
  try {
    const { data } = await apiClient.get<unknown>('/user/online-status');
    return parseOnlineStatusPayload(data);
  } catch {
    return false;
  }
}

/** PATCH /user/online-status — set tasker online/offline. */
export async function patchUserOnlineStatus(isOnline: boolean): Promise<boolean> {
  const { data } = await apiClient.patch<unknown>('/user/online-status', { isOnline });
  if (!isRecord(data)) {
    return isOnline;
  }
  const sc = data.statusCode;
  if (typeof sc === 'number' && sc !== 200 && sc !== 201) {
    const msg = typeof data.message === 'string' ? data.message : 'Could not update online status.';
    throw new Error(msg);
  }
  const inner = data.data;
  if (isRecord(inner) && typeof inner.is_online === 'boolean') {
    return inner.is_online;
  }
  return isOnline;
}

function normalizeAccountPath(path: string): string {
  const t = path.trim();
  return t.startsWith('/') ? t : `/${t}`;
}

export function getDeleteAccountErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 404) {
      return 'Account deletion is not available. Please contact support or update the app.';
    }
    const body = error.response?.data;
    if (isRecord(body) && typeof body.message === 'string') {
      return body.message;
    }
    return typeof error.message === 'string' ? error.message : 'Could not delete account.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Could not delete account.';
}

/** Deletes the authenticated user account (`USER_DELETE_ACCOUNT_PATH` / `USER_DELETE_ACCOUNT_METHOD` in `.env`). */
export async function deleteUserAccount(): Promise<void> {
  const path = normalizeAccountPath(nativeEnv.userDeleteAccountPath);
  if (nativeEnv.userDeleteAccountMethod === 'POST') {
    await apiClient.post(path);
  } else {
    await apiClient.delete(path);
  }
}
