import { fetchMyProviderProfile, fetchProviders } from '@/api/provider';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const providerKeys = {
  myProfile: ['myProviderProfile'] as const,
  list: (page: number, pageSize: number) => ['providers', { page, pageSize }] as const,
};

export function useMyProviderProfile() {
  return useQuery({
    queryKey: providerKeys.myProfile,
    queryFn: async () => {
      const response = await fetchMyProviderProfile();
      return response.data;
    },
  });
}

export function useUpdateProviderProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: import('@/types/provider').UpdateProviderProfilePayload) => {
      const response = await import('@/api/provider').then(m => m.updateMyProviderProfile(payload));
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.myProfile });
    },
  });
}

export function useProviders(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: providerKeys.list(page, pageSize),
    queryFn: async () => {
      const response = await fetchProviders(page, pageSize);
      return response.data;
    },
  });
}

export function useInfiniteProviders(
  pageSize: number = 20,
  filters?: {
    categoryId?: string | number;
    subCategoryId?: string | number;
    minPrice?: number;
    maxPrice?: number;
  }
) {
  return useInfiniteQuery({
    queryKey: ['providers', 'infinite', { pageSize, ...filters }],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetchProviders(pageParam as number, pageSize, filters);
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
}

export function useTopRatedProviders(limit: number = 5) {
  return useQuery({
    queryKey: ['providers', 'top-rated', { limit }],
    queryFn: async () => {
      const response = await fetchProviders(1, limit);
      return response.data.providers;
    },
  });
}

export function useProviderDetails(id: string | number) {
  return useQuery({
    queryKey: ['providerDetails', id],
    queryFn: async () => {
      const response = await import('@/api/provider').then(m => m.fetchProviderById(id));
      return response.data;
    },
    enabled: !!id,
  });
}
