import type { ApiUser } from '@/types/auth';

/** Full name from profile, else email local part, else `fallback`. */
export function getUserDisplayName(user: ApiUser | null | undefined, fallback = 'Guest'): string {
  if (!user) {
    return fallback;
  }
  const full = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return full || user.email.split('@')[0] || fallback;
}
