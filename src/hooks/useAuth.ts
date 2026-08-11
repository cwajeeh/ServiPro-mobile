import { useAuthStore } from '@/store/authStore';

/** Convenience hook around the auth Zustand slice. */
export function useAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  return { isAuthenticated, role, signIn, signOut };
}
