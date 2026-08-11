import { create } from 'zustand';

import { logoutRequest } from '@/api/auth';
import { queryClient } from '@/api/queryClient';
import {
  clearPersistedSession,
  readPersistedSession,
  writePersistedSession,
  type PersistedSession,
} from '@/store/authPersistence';
import type { ApiRoleName, ApiUser, UserRole } from '@/types/auth';

export type { UserRole } from '@/types/auth';

function mapApiRoleToAppRole(name: string): UserRole | null {
  const n = name.trim().toUpperCase();
  if (n === 'CUSTOMER') {
    return 'customer';
  }
  if (n === 'TASKER') {
    return 'tasker';
  }
  return null;
}

/** Some login responses send `role` as `{ name }`; others send a plain string. */
function getRoleNameFromApiUser(user: unknown): string {
  if (!user || typeof user !== 'object') {
    return '';
  }
  const u = user as Record<string, unknown>;
  const r = u.role;
  if (typeof r === 'string') {
    return r;
  }
  if (r && typeof r === 'object') {
    const name = (r as { name?: unknown }).name;
    if (typeof name === 'string') {
      return name;
    }
  }
  return '';
}

function isProviderTruthy(raw: unknown): boolean {
  if (raw === true || raw === 1) {
    return true;
  }
  if (typeof raw === 'string') {
    const s = raw.trim().toLowerCase();
    return s === 'true' || s === '1';
  }
  return false;
}

function normalizeUserForSession(user: ApiUser, roleName: string): ApiUser {
  const raw = user as unknown as Record<string, unknown>;
  if (typeof raw.role === 'string') {
    return {
      ...user,
      role: { id: 0, name: roleName as ApiRoleName },
    };
  }
  return user;
}

type AuthState = {
  hydrated: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  /** Tasker only: `true` = full tasker app; `false` = post-signup onboarding (category select, etc.). */
  provider: boolean | null;
  accessToken: string | null;
  refreshToken: string | null;
  user: ApiUser | null;
  signIn: (role: UserRole) => void;
  setSessionFromLogin: (session: PersistedSession) => void;
  hydrate: () => Promise<void>;
  /** Clears session locally without calling the logout API (e.g. expired token / 401). */
  signOutLocal: () => Promise<void>;
  signOut: () => Promise<void>;
  updateTokens: (accessToken: string, refreshToken: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  isAuthenticated: false,
  role: null,
  provider: null,
  accessToken: null,
  refreshToken: null,
  user: null,

  signIn: (role) =>
    set({
      isAuthenticated: true,
      role,
    }),

  setSessionFromLogin: (session) => {
    set({
      isAuthenticated: true,
      role: session.role,
      provider: session.provider,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
    });
    void writePersistedSession(session);
  },

  hydrate: async () => {
    try {
      const persisted = await readPersistedSession();
      if (persisted) {
        set({
          isAuthenticated: true,
          role: persisted.role,
          provider: persisted.provider,
          accessToken: persisted.accessToken,
          refreshToken: persisted.refreshToken,
          user: persisted.user,
        });
      }
    } finally {
      set({ hydrated: true });
    }
  },

  signOutLocal: async () => {
    queryClient.clear();
    await clearPersistedSession();
    set({
      isAuthenticated: false,
      role: null,
      provider: null,
      accessToken: null,
      refreshToken: null,
      user: null,
    });
  },

  signOut: async () => {
    const refreshToken = get().refreshToken;
    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch {
        // Still clear local session if the network request fails.
      }
    }
    queryClient.clear();
    await clearPersistedSession();
    set({
      isAuthenticated: false,
      role: null,
      provider: null,
      accessToken: null,
      refreshToken: null,
      user: null,
    });
  },

  updateTokens: async (accessToken, refreshToken) => {
    const current = get();
    set({ accessToken, refreshToken });
    if (!current.user || !current.role) {
      return;
    }
    const newSession: PersistedSession = {
      accessToken,
      refreshToken,
      user: current.user,
      role: current.role,
      provider: current.provider ?? false,
    };
    await writePersistedSession(newSession);
  },
}));

export function buildSessionFromLoginData(data: {
  user: ApiUser;
  tokens: { access_token: string; refresh_token: string };
}): PersistedSession | null {
  const roleName = getRoleNameFromApiUser(data.user);
  const appRole = mapApiRoleToAppRole(roleName);
  if (!appRole) {
    return null;
  }
  const providerRaw = (data.user as unknown as Record<string, unknown>).provider;
  const providerFlag = isProviderTruthy(providerRaw);

  const user = normalizeUserForSession(data.user, roleName);

  return {
    accessToken: data.tokens.access_token,
    refreshToken: data.tokens.refresh_token,
    role: appRole,
    provider: providerFlag,
    user,
  };
}
