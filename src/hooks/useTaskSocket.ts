import { useEffect } from 'react';

import { useAuthStore } from '@/store/authStore';
import { useTaskSocketStore } from '@/store/taskSocketStore';

export function useTaskSocketInit() {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const connect = useTaskSocketStore((s) => s.connect);
  const disconnect = useTaskSocketStore((s) => s.disconnect);

  useEffect(() => {
    if (isAuth && role === 'customer') {
      connect();
      return;
    }
    disconnect();
  }, [isAuth, role, connect, disconnect]);
}
