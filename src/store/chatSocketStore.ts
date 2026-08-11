import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';

import { nativeEnv } from '@/config/nativeEnv';
import { useAuthStore } from '@/store/authStore';
import { devDebug } from '@/utils/devLog';

const apiStr = nativeEnv.apiUrl;
const socketURL = apiStr.replace(/^http/, 'ws') + '/chat';

export type ChatMessage = {
  id: string;
  taskId?: number;
  senderId?: number;
  receiverId?: number;
  message: string;
  createdAt?: string;
  mine?: boolean;
};

interface ChatSocketState {
  socket: Socket | null;
  isConnected: boolean;
  messages: ChatMessage[];
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  joinChat: (userId: number) => void;
  sendMessage: (params: { receiverId: number; taskId: number | string; message: string }) => void;
  clearMessages: () => void;
  onNewMessage: (listener: (msg: ChatMessage) => void) => () => void;
}

function normalizeMessage(raw: any, myId?: number | null): ChatMessage {
  const senderId = Number(raw?.senderId ?? raw?.sender_id ?? raw?.fromUserId);
  const message = String(raw?.message ?? raw?.text ?? raw?.content ?? '');
  return {
    id: String(raw?.id ?? `${Date.now()}-${Math.random()}`),
    taskId: raw?.taskId != null ? Number(raw.taskId) : undefined,
    senderId: Number.isFinite(senderId) ? senderId : undefined,
    receiverId: raw?.receiverId != null ? Number(raw.receiverId) : undefined,
    message,
    createdAt: raw?.createdAt ?? raw?.created_at,
    mine: myId != null && Number.isFinite(senderId) ? senderId === myId : false,
  };
}

export const useChatSocketStore = create<ChatSocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  messages: [],

  connect: () => {
    const { socket } = get();
    if (socket) return;

    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    const newSocket = io(socketURL, {
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    newSocket.on('connect', () => {
      devDebug('Chat socket connected');
      set({ isConnected: true });
      const userId = useAuthStore.getState().user?.id;
      if (userId) newSocket.emit('join_chat', { userId: Number(userId) });
    });

    newSocket.on('disconnect', () => set({ isConnected: false }));

    newSocket.on('new_message', (payload: unknown) => {
      const myId = useAuthStore.getState().user?.id;
      const msg = normalizeMessage(payload, myId != null ? Number(myId) : null);
      set((s) => ({ messages: [...s.messages, msg] }));
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  reconnect: () => {
    get().disconnect();
    get().connect();
  },

  joinChat: (userId) => {
    const { socket, connect } = get();
    if (!socket) {
      connect();
    }
    get().socket?.emit('join_chat', { userId });
  },

  sendMessage: ({ receiverId, taskId, message }) => {
    const text = message.trim();
    if (!text) return;
    const { socket, connect } = get();
    if (!socket) connect();
    const active = get().socket;
    const myId = useAuthStore.getState().user?.id;
    if (myId) active?.emit('join_chat', { userId: Number(myId) });
    active?.emit('send_message', {
      receiverId: Number(receiverId),
      taskId: Number(taskId),
      message: text,
    });
    // Optimistic local append
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: `local-${Date.now()}`,
          taskId: Number(taskId),
          senderId: myId != null ? Number(myId) : undefined,
          receiverId: Number(receiverId),
          message: text,
          createdAt: new Date().toISOString(),
          mine: true,
        },
      ],
    }));
  },

  clearMessages: () => set({ messages: [] }),

  onNewMessage: (listener) => {
    const { socket, connect } = get();
    if (!socket) connect();
    const active = get().socket;
    if (!active) return () => undefined;
    const handler = (payload: unknown) => {
      const myId = useAuthStore.getState().user?.id;
      listener(normalizeMessage(payload, myId != null ? Number(myId) : null));
    };
    active.on('new_message', handler);
    return () => {
      active.off('new_message', handler);
    };
  },
}));
