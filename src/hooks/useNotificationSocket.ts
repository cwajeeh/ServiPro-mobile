import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationSocketStore } from '@/store/notificationSocketStore';
import { queryClient } from '@/api/queryClient';

export function useNotificationSocketInit() {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const connect = useNotificationSocketStore((s) => s.connect);
  const disconnect = useNotificationSocketStore((s) => s.disconnect);
  const socket = useNotificationSocketStore((s) => s.socket);

  useEffect(() => {
    if (isAuth) {
      connect();
    } else {
      disconnect();
    }
  }, [isAuth, connect, disconnect]);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = () => {
        // Refresh count from server via socket
        socket.emit("get_unread_count", {});
        // Invalidate query to refetch list in UI
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      };
      
      socket.on("new_notification", handleNewNotification);
      return () => {
        socket.off("new_notification", handleNewNotification);
      };
    }
  }, [socket]);
}
