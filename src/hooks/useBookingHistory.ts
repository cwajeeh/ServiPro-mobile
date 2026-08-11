import { BookingHistoryData, fetchBookingHistory } from '@/api/tasks';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useBookingHistory(pageSize: number = 20) {
  return useInfiniteQuery({
    queryKey: ['booking-history', { pageSize }],
    queryFn: async ({ pageParam = 1 }): Promise<BookingHistoryData> => {
      return await fetchBookingHistory(pageParam as number, pageSize);
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
