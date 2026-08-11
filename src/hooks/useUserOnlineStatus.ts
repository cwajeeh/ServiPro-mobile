import { fetchUserOnlineStatus, patchUserOnlineStatus } from '@/api/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const onlineStatusKeys = {
  all: ['online-status'] as const,
};
export function useUserOnlineStatus() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: onlineStatusKeys.all,
    queryFn: fetchUserOnlineStatus,
    staleTime: 1000 * 60, // 1 minute
  });

  const mutation = useMutation({
    mutationFn: (nextStatus: boolean) => patchUserOnlineStatus(nextStatus),
    onSuccess: (confirmed) => {
      queryClient.setQueryData(onlineStatusKeys.all, confirmed);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: onlineStatusKeys.all });
    },
  });

  const toggle = () => {
    const current = query.data ?? false;
    mutation.mutate(!current);
  };

  return {
    isOnline: !!query.data,
    isLoading: query.isLoading,
    isUpdating: mutation.isPending,
    toggle,
    setOnline: (val: boolean) => mutation.mutate(val),
    error: mutation.error,
  };
}
