import { apiClient } from './client';

export interface BidProvider {
  id: number;
  name: string;
  profileImage: string;
  description: string;
}

export interface Bid {
  id: number;
  amount: string;
  message: string;
  status: string;
  createdAt: string;
  portfolio: any[];
  provider: BidProvider;
}

export interface BiddingTask {
  id: number;
  title: string;
  icon: string;
  status: string;
  price: string;
  amountType: string;
  scheduledDate: string;
  type: string;
  bids: Bid[];
}

export interface BiddingTasksResponse {
  statusCode: number;
  data: BiddingTask[];
  message: string;
}

export async function fetchCustomerBiddingTasks(): Promise<BiddingTask[]> {
  const { data } = await apiClient.get<BiddingTasksResponse>('/tasks/bids');
  return data.data;
}

export async function acceptBid(taskId: number, bidId: number): Promise<void> {
  await apiClient.post(`/tasks/${taskId}/bids/${bidId}/accept`);
}

export async function rejectBid(taskId: number, bidId: number): Promise<void> {
  await apiClient.post(`/tasks/${taskId}/bids/${bidId}/reject`);
}
