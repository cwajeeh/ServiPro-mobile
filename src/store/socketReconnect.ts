import { useAuthStore } from '@/store/authStore';
import { useChatSocketStore } from '@/store/chatSocketStore';
import { useNotificationSocketStore } from '@/store/notificationSocketStore';
import { useTaskSocketStore } from '@/store/taskSocketStore';

/** Call after access token refresh so Socket.IO reconnects with the new Bearer token. */
export function reconnectSocketsAfterTokenRefresh(): void {
  useNotificationSocketStore.getState().reconnect();
  useChatSocketStore.getState().reconnect();
  if (useAuthStore.getState().role === 'customer') {
    useTaskSocketStore.getState().reconnect();
  } else {
    // Taskers also use /task-stream for area + job status events.
    useTaskSocketStore.getState().reconnect();
  }
}
