import { apiClient } from '@/api/client';

export interface NotificationActionData {
  status?: string;
  taskId?: number;
  deepLink?: string;
  disputeId?: number;
}

export interface NotificationItemData {
  id: number;
  recipient_user_id: number;
  type: string;
  title: string;
  body: string;
  data: NotificationActionData;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface NotificationsResponseData {
  items: NotificationItemData[];
  pagination: NotificationsPagination;
  unreadCount: number;
}

export interface NotificationsResponse {
  statusCode: number;
  data: NotificationsResponseData;
  message: string;
}

export async function fetchNotifications(page = 1, limit = 20): Promise<NotificationsResponseData> {
  const { data } = await apiClient.get<NotificationsResponse>('/notifications', {
    params: { page, limit }
  });
  return data.data;
}

export interface MarkAsReadResponse {
  statusCode: number;
  data: {
    unreadCount: number;
    affected?: number;
  };
  message: string;
}

export async function markNotificationAsRead(id: number): Promise<MarkAsReadResponse['data']> {
  const { data } = await apiClient.post<MarkAsReadResponse>(`/notifications/${id}/read`);
  return data.data;
}

export async function markAllNotificationsAsRead(): Promise<MarkAsReadResponse['data']> {
  const { data } = await apiClient.post<MarkAsReadResponse>('/notifications/read-all');
  return data.data;
}
