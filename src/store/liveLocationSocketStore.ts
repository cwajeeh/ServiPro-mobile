import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';

import { nativeEnv } from '@/config/nativeEnv';
import { useAuthStore } from '@/store/authStore';
import { devDebug } from '@/utils/devLog';

const apiStr = nativeEnv.apiUrl;
const socketURL = apiStr.replace(/^http/, 'ws') + '/live-location';

export type ProviderLocation = {
  providerId?: number;
  lat: number;
  lng: number;
  timestamp?: number;
};

interface LiveLocationState {
  socket: Socket | null;
  isConnected: boolean;
  providerLocation: ProviderLocation | null;
  isProviderOffline: boolean;
  lastError: string | null;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  subscribeProvider: (providerId: number) => void;
  updateLocation: (lat: number, lng: number) => void;
  clearProviderLocation: () => void;
  onProviderLocationUpdate: (listener: (loc: ProviderLocation) => void) => () => void;
  onProviderOffline: (listener: (providerId: number) => void) => () => void;
}

export const useLiveLocationSocketStore = create<LiveLocationState>((set, get) => ({
  socket: null,
  isConnected: false,
  providerLocation: null,
  isProviderOffline: false,
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
      devDebug('Live location connected');
      set({ isConnected: true, lastError: null });
    });

    newSocket.on('connect_error', (err: { message?: string }) => {
      const message = err?.message ?? 'Live location connection failed';
      devDebug('Live location connect_error:', message);
      set({ isConnected: false, lastError: message });
    });

    newSocket.on('disconnect', () => {
      set({ isConnected: false });
    });

    newSocket.on('provider_location_update', (data: ProviderLocation) => {
      const lat = Number(data?.lat);
      const lng = Number(data?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      set({
        providerLocation: {
          providerId: data.providerId != null ? Number(data.providerId) : undefined,
          lat,
          lng,
          timestamp: data.timestamp,
        },
        isProviderOffline: false,
      });
    });

    newSocket.on('provider_offline', (data: { providerId?: number }) => {
      set({ isProviderOffline: true });
      devDebug('Live location provider_offline', data?.providerId);
    });

    newSocket.on('error', (payload: { message?: string } | string) => {
      const message = typeof payload === 'string' ? payload : (payload?.message ?? 'Live location error');
      set({ lastError: message });
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
        providerLocation: null,
        isProviderOffline: false,
        lastError: null,
      });
    }
  },

  reconnect: () => {
    get().disconnect();
    get().connect();
  },

  subscribeProvider: (providerId) => {
    get().socket?.emit('subscribe_provider', { providerId });
  },

  updateLocation: (lat, lng) => {
    get().socket?.emit('update_location', { lat, lng });
  },

  clearProviderLocation: () => set({ providerLocation: null, isProviderOffline: false }),

  onProviderLocationUpdate: (listener) => {
    const socket = get().socket;
    if (!socket) return () => {};
    const handler = (data: ProviderLocation) => {
      const lat = Number(data?.lat);
      const lng = Number(data?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      listener({
        providerId: data.providerId != null ? Number(data.providerId) : undefined,
        lat,
        lng,
        timestamp: data.timestamp,
      });
    };
    socket.on('provider_location_update', handler);
    return () => socket.off('provider_location_update', handler);
  },

  onProviderOffline: (listener) => {
    const socket = get().socket;
    if (!socket) return () => {};
    const handler = (data: { providerId?: number }) => {
      if (data?.providerId != null) listener(Number(data.providerId));
    };
    socket.on('provider_offline', handler);
    return () => socket.off('provider_offline', handler);
  },
}));
