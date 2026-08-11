import { useQuery } from '@tanstack/react-query';
import { fetchTaskDetail, fetchCustomerTaskDetail } from '@/api/tasks';

export function useTaskDetail(taskId: string | number) {
  return useQuery({
    queryKey: ['task-detail', taskId],
    queryFn: () => fetchTaskDetail(taskId),
    enabled: !!taskId,
  });
}

export function useCustomerTaskDetail(taskId: string | number) {
  return useQuery({
    queryKey: ['customer-task-detail', taskId],
    queryFn: () => fetchCustomerTaskDetail(taskId),
    enabled: !!taskId,
    refetchInterval: 30_000, // poll every 30s to keep status fresh
  });
}
