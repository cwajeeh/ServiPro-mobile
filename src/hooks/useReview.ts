import { fetchMyReviews, fetchProviderReviews } from '@/api/review';
import { useQuery } from '@tanstack/react-query';

export const reviewKeys = {
  all: ['reviews'] as const,
  my: () => [...reviewKeys.all, 'my'] as const,
  paginated: (page: number, pageSize: number) =>
    [...reviewKeys.my(), { page, pageSize }] as const,
};

export function useMyReviews(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: reviewKeys.paginated(page, pageSize),
    queryFn: () => fetchMyReviews(page, pageSize),
  });
}

export function useProviderReviews(providerId: number, page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['reviews', 'provider', providerId, { page, pageSize }],
    queryFn: () => fetchProviderReviews(providerId, page, pageSize),
    enabled: !!providerId,
  });
}
