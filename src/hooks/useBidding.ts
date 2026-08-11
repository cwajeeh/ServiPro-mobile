import { fetchCustomerBiddingTasks } from '@/api/bidding';
import { useQuery } from '@tanstack/react-query';

export const biddingKeys = {
  all: ['biddingTasks'] as const,
};

export function useCustomerBiddingTasks() {
  return useQuery({
    queryKey: biddingKeys.all,
    queryFn: async () => {
      return await fetchCustomerBiddingTasks();
    },
  });
}

import { acceptBid, rejectBid } from '@/api/bidding';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useAcceptBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, bidId }: { taskId: number; bidId: number }) => acceptBid(taskId, bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: biddingKeys.all });
    },
  });
}

export function useRejectBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, bidId }: { taskId: number; bidId: number }) => rejectBid(taskId, bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: biddingKeys.all });
    },
  });
}
