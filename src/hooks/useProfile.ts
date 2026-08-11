import { fetchUserProfile, updateUserProfile } from '@/api/user';
import { UpdateProfilePayload } from '@/types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const profileKeys = {
  all: ['profile'] as const,
};

export function useUserProfile() {
  return useQuery({
    queryKey: profileKeys.all,
    queryFn: async () => {
      const response = await fetchUserProfile();
      return response.data;
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateUserProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
