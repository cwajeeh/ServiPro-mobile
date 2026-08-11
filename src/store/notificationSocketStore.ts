import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

import { nativeEnv } from '@/config/nativeEnv';
import { useAuthStore } from '@/store/authStore';
import { devDebug } from '@/utils/devLog';

const apiStr = nativeEnv.apiUrl;
const socketURL = apiStr.replace(/^http/, 'ws') + '/notifications';

interface NotificationSocketState {
  socket: Socket | null;
  unreadCount: number;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  /** Disconnect and connect so socket auth uses the latest access token (e.g. after refresh). */
  reconnect: () => void;
}

export const useNotificationSocketStore = create<NotificationSocketState>((set, get) => ({
  socket: null,
  unreadCount: 0,
  isConnected: false,

  connect: () => {
    const { socket } = get();
    if (socket) return;

    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    const newSocket = io(socketURL, {
      transports: ["websocket"],
      auth: { token },
    });

    newSocket.on("connect", () => {
      devDebug('Notification socket connected');
      set({ isConnected: true });
      newSocket.emit("get_unread_count", {});
    });

    newSocket.on("disconnect", () => {
      devDebug('Notification socket disconnected');
      set({ isConnected: false });
    });

    newSocket.on("unread_count", (data: { unread_count?: number; unreadCount?: number; count?: number }) => {
      const count = data?.unread_count ?? data?.unreadCount ?? data?.count ?? 0;
      devDebug('Notification unread_count', count);
      set({ unreadCount: count });
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, unreadCount: 0 });
    }
  },

  reconnect: () => {
    get().disconnect();
    get().connect();
  },
}));
