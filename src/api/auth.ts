import { isAxiosError } from 'axios';

import { apiClient } from '@/api/client';
import type { ApiUser, LoginResponseBody } from '@/types/auth';
import { getDeviceTypeForApi, getOrCreateDeviceToken } from '@/utils/deviceToken';

/** Matches staging `/auth/register` — customer = 2, tasker = 3. */
export const REGISTER_ROLE_ID_CUSTOMER = 2;
export const REGISTER_ROLE_ID_TASKER = 3;

export type RegisterPayload = {
  email: string;
  countryCode: string;
  isoCode: string;
  phone: string;
  password: string;
  first_name: string;
  last_name: string;
  address: string;
  role_id: number;
  sole_trader: boolean;
};

export type RegisterResponseUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
  role_id: number;
  countryCode?: string;
  isoCode?: string;
  phone?: string;
  soleTrader?: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginPayload = LoginCredentials & {
  device_token: string;
  device_type: string;
};

function isLoginStatusOk(statusCode: unknown): boolean {
  if (statusCode === undefined || statusCode === null) {
    return true;
  }
  const n = Number(statusCode);
  return n === 200;
}

/** Accepts `role` as `{ name }` or a string (some API variants). */
export async function loginRequest(credentials: LoginCredentials) {
  const device_token = await getOrCreateDeviceToken();
  const device_type = getDeviceTypeForApi();
  const payload: LoginPayload = {
    ...credentials,
    device_token,
    device_type,
  };
  const { data: raw } = await apiClient.post<unknown>('/auth/login', payload);
  const body = raw as Record<string, unknown>;
  if (!isLoginStatusOk(body.statusCode)) {
    const msg = typeof body.message === 'string' ? body.message : 'Sign in failed.';
    throw new Error(msg);
  }
  const inner = body.data as Record<string, unknown> | undefined;
  if (!inner || typeof inner !== 'object') {
    throw new Error('Sign in failed.');
  }
  const tokens = inner.tokens as { access_token?: string; refresh_token?: string } | undefined;
  const user = inner.user as ApiUser | undefined;
  if (!tokens?.access_token || !tokens?.refresh_token || !user) {
    throw new Error('Sign in failed.');
  }
  return {
    user,
    tokens: { access_token: tokens.access_token, refresh_token: tokens.refresh_token },
  } as NonNullable<LoginResponseBody['data']>;
}

export async function logoutRequest(refreshToken: string) {
  await apiClient.post<{ statusCode?: number; message?: string }>('/auth/logout', {
    refresh_token: refreshToken,
  });
}

export async function registerRequest(payload: RegisterPayload): Promise<RegisterResponseUser> {
  try {
    const { data: raw } = await apiClient.post<unknown>('/auth/register', payload);
    const body = raw as Record<string, unknown>;
    if (!isLoginStatusOk(body.statusCode)) {
      const msg = typeof body.message === 'string' ? body.message : 'Registration failed.';
      throw new Error(msg);
    }
    const inner = body.data as RegisterResponseUser | null | undefined;
    if (!inner || typeof inner !== 'object' || typeof inner.id !== 'number') {
      throw new Error('Registration failed.');
    }
    return inner;
  } catch (error) {
    if (error instanceof Error && !isAxiosError(error)) {
      throw error;
    }
    throw new Error(getAuthErrorMessage(error, 'Could not create account.'));
  }
}

export async function forgotPasswordRequest(email: string) {
  const { data } = await apiClient.post<{ statusCode?: number; message?: string }>(
    '/auth/forgot-password',
    { email: email.trim().toLowerCase() },
  );
  if (data.statusCode !== undefined && data.statusCode !== 200) {
    throw new Error(data.message ?? 'Could not send reset code.');
  }
}

function extractResetTokenFromVerifyResponse(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const o = body as Record<string, unknown>;
  if (typeof o.token === 'string' && o.token.trim()) {
    return o.token.trim();
  }
  const data = o.data;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.token === 'string' && d.token.trim()) {
      return d.token.trim();
    }
    if (typeof d.access_token === 'string' && d.access_token.trim()) {
      return d.access_token.trim();
    }
  }
  return null;
}

/**
 * Verifies OTP (sent as `token`). Returns the **reset token** from the response for `/auth/reset-password`.
 */
export async function verifyPasswordTokenRequest(payload: { email: string; token: string }): Promise<string> {
  const { data } = await apiClient.post<unknown>('/auth/verify_Password_token', {
    email: payload.email.trim().toLowerCase(),
    token: payload.token.trim(),
  });
  if (typeof data === 'object' && data !== null && 'statusCode' in data) {
    const sc = (data as { statusCode?: number }).statusCode;
    if (sc !== undefined && sc !== 200) {
      const msg = (data as { message?: string }).message;
      throw new Error(typeof msg === 'string' ? msg : 'Invalid or expired code.');
    }
  }
  const resetToken = extractResetTokenFromVerifyResponse(data);
  if (!resetToken) {
    throw new Error('Invalid response from server.');
  }
  return resetToken;
}

export async function verifyEmailRequest(payload: { email: string; token: string }) {
  const device_token = await getOrCreateDeviceToken();
  const device_type = getDeviceTypeForApi();
  const { data: raw } = await apiClient.post<unknown>('/auth/verify', {
    ...payload,
    device_token,
    device_type,
  });

  const body = raw as Record<string, unknown>;
  if (!isLoginStatusOk(body.statusCode)) {
    const msg = typeof body.message === 'string' ? body.message : 'Verification failed.';
    throw new Error(msg);
  }

  const inner = body.data as Record<string, unknown> | undefined;
  if (!inner || typeof inner !== 'object') {
    return null;
  }

  const tokens = inner.tokens as { access_token?: string; refresh_token?: string } | undefined;
  const user = inner.user as ApiUser | undefined;
  if (!tokens?.access_token || !tokens?.refresh_token || !user) {
    return null;
  }
  return {
    user,
    tokens: { access_token: tokens.access_token, refresh_token: tokens.refresh_token },
  } as NonNullable<LoginResponseBody['data']>;
}

export async function resendOtpRequest(email: string) {
  const { data } = await apiClient.post<{ statusCode?: number; message?: string }>('/auth/resendOtp', {
    email: email.trim().toLowerCase(),
  });
  if (data.statusCode !== undefined && data.statusCode !== 200) {
    throw new Error(data.message ?? 'Could not resend OTP.');
  }
}

export async function resetPasswordRequest(payload: { password: string; token: string }) {
  const { data } = await apiClient.post<{ statusCode?: number; message?: string }>('/auth/reset-password', {
    password: payload.password,
    token: payload.token.trim(),
  });
  if (data.statusCode !== undefined && data.statusCode !== 200) {
    throw new Error(data.message ?? 'Could not reset password.');
  }
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const res = error.response?.data as { message?: string } | undefined;
    if (typeof res?.message === 'string') {
      return res.message;
    }
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function getLoginErrorMessage(error: unknown): string {
  return getAuthErrorMessage(error, 'Could not sign in.');
}

export function getRegisterErrorMessage(error: unknown): string {
  return getAuthErrorMessage(error, 'Could not create account.');
}

export async function firebaseLoginRequest(firebaseToken: string) {
  const device_token = await getOrCreateDeviceToken();
  const device_type = getDeviceTypeForApi();
  const payload = {
    firebaseToken,
    device_token,
    device_type,
  };
  const { data: raw } = await apiClient.post<unknown>('/auth/firebase-login', payload);
  const body = raw as Record<string, unknown>;
  if (!isLoginStatusOk(body.statusCode)) {
    const msg = typeof body.message === 'string' ? body.message : 'Social sign in failed.';
    throw new Error(msg);
  }
  const inner = body.data as Record<string, unknown> | undefined;
  if (!inner || typeof inner !== 'object') {
    throw new Error('Social sign in failed.');
  }
  const tokens = inner.tokens as { access_token?: string; refresh_token?: string } | undefined;
  const user = inner.user as ApiUser | undefined;
  if (!tokens?.access_token || !tokens?.refresh_token || !user) {
    throw new Error('Social sign in failed.');
  }
  return {
    user,
    tokens: { access_token: tokens.access_token, refresh_token: tokens.refresh_token },
  } as NonNullable<LoginResponseBody['data']>;
}

/** POST /auth/switch-role — returns new tokens + user for the other portal. */
export async function switchRoleRequest() {
  const { data: raw } = await apiClient.post<unknown>('/auth/switch-role', {});
  const body = raw as Record<string, unknown>;
  if (!isLoginStatusOk(body.statusCode)) {
    const msg = typeof body.message === 'string' ? body.message : 'Could not switch role.';
    throw new Error(msg);
  }
  const inner = (body.data ?? body) as Record<string, unknown>;
  const tokens = (inner.tokens ?? body.tokens) as
    | { access_token?: string; refresh_token?: string }
    | undefined;
  const user = (inner.user ?? body.user) as ApiUser | undefined;
  if (!tokens?.access_token || !tokens?.refresh_token || !user) {
    throw new Error('Could not switch role.');
  }
  return {
    user,
    tokens: { access_token: tokens.access_token, refresh_token: tokens.refresh_token },
  };
}
