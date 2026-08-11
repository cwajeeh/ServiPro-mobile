import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { switchRoleRequest } from '@/api/auth';
import { queryClient } from '@/api/queryClient';
import { buildSessionFromLoginData, useAuthStore } from '@/store/authStore';

export function useSwitchRole() {
  const setSessionFromLogin = useAuthStore((s) => s.setSessionFromLogin);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: switchRoleRequest,
    onSuccess: (data) => {
      const session = buildSessionFromLoginData(data);
      if (!session) {
        Alert.alert('Switch role', 'Could not determine the new role from the server response.');
        return;
      }
      setSessionFromLogin(session);
      qc.clear();
      queryClient.clear();
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Could not switch role.';
      Alert.alert('Switch role', msg);
    },
  });
}
