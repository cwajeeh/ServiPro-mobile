import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';

import { nativeEnv } from '@/config/nativeEnv';
import { useAuthStore } from '@/store/authStore';
import { devDebug } from '@/utils/devLog';

const apiStr = nativeEnv.apiUrl;
const socketURL = apiStr.replace(/^http/, 'ws') + '/task-stream';

interface TaskPayload {
  id?: number;
  [key: string]: any;
}

interface TaskUpdatePayload {
  taskId?: number;
  status?: string;
  [key: string]: any;
}

interface BidPayload {
  id?: number;
  taskId?: number;
  amount?: number;
  provider?: any;
  [key: string]: any;
}

interface AreaParams {
  lat: number;
  lng: number;
  radius?: number;
}

interface TaskSocketState {
  socket: Socket | null;
  isConnected: boolean;
  lastError: string | null;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;

  // Customer flows
  subscribeMyTasks: (limit?: number) => void;
  subscribeTask: (taskId: number) => void;
  unsubscribeTask: (taskId: number) => void;
  confirmTaskCompleted: (taskId: number) => void;

  // Tasker map/area flows
  subscribeArea: (params: AreaParams) => void;
  updateArea: (params: AreaParams) => void;

  // Task lifecycle flows
  markOnTheWay: (params: { taskId: number; startLat?: number; startLng?: number; startAddress?: string }) => void;
  markArrived: (taskId: number) => void;
  markStarted: (taskId: number) => void;
  markCompleted: (taskId: number) => void;
  cancelTask: (params: { taskId: number; reason?: string }) => void;
  changeTaskStatus: (params: { taskId: number; status: string; [key: string]: any }) => void;

  // Listener helpers
  onTaskCreated: (listener: (task: TaskPayload) => void) => () => void;
  onTaskStatusChanged: (listener: (payload: TaskUpdatePayload) => void) => () => void;
  onBidPlaced: (listener: (payload: BidPayload) => void) => () => void;
  onNewTask: (listener: (task: TaskPayload) => void) => () => void;
}

export const useTaskSocketStore = create<TaskSocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  lastError: null,

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
      devDebug('Task socket connected');
      set({ isConnected: true, lastError: null });
      newSocket.emit('subscribe_my_tasks', { limit: 20 });
    });

    newSocket.on('connect_error', (err: { message?: string }) => {
      const message = err?.message ?? 'Task socket connection failed';
      devDebug('Task stream connect_error:', message);
      set({ isConnected: false, lastError: message });
    });

    newSocket.on('disconnect', () => {
      devDebug('Task socket disconnected');
      set({ isConnected: false });
    });

    newSocket.on('error', (payload: { message?: string } | string) => {
      const message = typeof payload === 'string' ? payload : (payload?.message ?? 'Task socket error');
      devDebug('Task stream error:', message);
      set({ lastError: message });
    });

    // Customer + tasker shared room/task events.
    newSocket.on('my_tasks_subscribed', (data: { taskIds?: number[] }) => {
      devDebug('Task socket my_tasks_subscribed', data?.taskIds?.length ?? 0);
    });

    newSocket.on('task_subscribed', (data: { task?: { id?: number } }) => {
      devDebug('Task socket task_subscribed', data?.task?.id);
    });

    newSocket.on('task_update', (payload: { taskId?: number; status?: string }) => {
      devDebug('Task socket task_update', payload?.taskId, payload?.status);

      const status = (payload?.status ?? '').toLowerCase();
      if (status === 'assignment_completed' && payload?.taskId) {
        newSocket.emit('task_status_confirm_completed', { taskId: payload.taskId, status: 'completed' });
      }
    });

    newSocket.on('bid_placed', () => {
      devDebug('Task socket bid_placed');
    });

    newSocket.on('task_created', (task: { id?: number }) => {
      devDebug('Task socket task_created', task?.id);
      if (task?.id) {
        newSocket.emit('subscribe_task', { taskId: task.id });
      }
    });

    // Tasker area subscription events.
    newSocket.on('area_subscribed', () => {
      devDebug('Task socket area_subscribed');
    });

    newSocket.on('area_updated', () => {
      devDebug('Task socket area_updated');
    });

    newSocket.on('new_task', () => {
      devDebug('Task socket new_task');
    });

    newSocket.on('task_status_changed', () => {
      devDebug('Task socket task_status_changed');
    });

    newSocket.on('task_status_updated', () => {
      devDebug('Task socket task_status_updated');
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, lastError: null });
    }
  },

  reconnect: () => {
    get().disconnect();
    get().connect();
  },

  subscribeMyTasks: (limit = 20) => {
    get().socket?.emit('subscribe_my_tasks', { limit });
  },

  subscribeTask: (taskId) => {
    get().socket?.emit('subscribe_task', { taskId });
  },

  unsubscribeTask: (taskId) => {
    get().socket?.emit('unsubscribe_task', { taskId });
  },

  confirmTaskCompleted: (taskId) => {
    get().socket?.emit('task_status_confirm_completed', { taskId, status: 'completed' });
  },

  subscribeArea: ({ lat, lng, radius }) => {
    get().socket?.emit('subscribe_area', { lat, lng, radius });
  },

  updateArea: ({ lat, lng, radius }) => {
    get().socket?.emit('update_area', { lat, lng, radius });
  },

  markOnTheWay: ({ taskId, startLat, startLng, startAddress }) => {
    get().socket?.emit('task_status_on_the_way', { taskId, startLat, startLng, startAddress });
  },

  markArrived: (taskId) => {
    get().socket?.emit('task_status_arrived', { taskId });
  },

  markStarted: (taskId) => {
    get().socket?.emit('task_status_started', { taskId });
  },

  markCompleted: (taskId) => {
    get().socket?.emit('task_status_completed', { taskId });
  },

  cancelTask: ({ taskId, reason }) => {
    get().socket?.emit('task_status_canceled', { taskId, reason });
  },

  changeTaskStatus: (params) => {
    get().socket?.emit('task_status_changed', params);
  },

  onTaskCreated: (listener) => {
    const socket = get().socket;
    if (!socket) return () => { };
    socket.on('task_created', listener);
    return () => socket.off('task_created', listener);
  },

  onTaskStatusChanged: (listener) => {
    const socket = get().socket;
    if (!socket) return () => { };
    socket.on('task_status_changed', listener);
    socket.on('task_update', listener);
    return () => {
      socket.off('task_status_changed', listener);
      socket.off('task_update', listener);
    };
  },

  onBidPlaced: (listener) => {
    const socket = get().socket;
    if (!socket) return () => { };
    socket.on('bid_placed', listener);
    return () => socket.off('bid_placed', listener);
  },

  onNewTask: (listener) => {
    const socket = get().socket;
    if (!socket) return () => { };
    const handler = (payload: TaskPayload) => listener(payload);
    socket.on('new_task', handler);
    socket.on('task_created', handler);
    return () => {
      socket.off('new_task', handler);
      socket.off('task_created', handler);
    };
  },
}));
