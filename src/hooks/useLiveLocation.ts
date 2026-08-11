import { useEffect, useRef } from 'react';

import { useLiveLocationSocketStore } from '@/store/liveLocationSocketStore';
import { getCurrentPosition, requestLocationPermission } from '@/utils/nativeLocation';

const ACTIVE_STATUSES = new Set([
  'on_the_way',
  'arrived',
  'started',
  'in_progress',
  'assigned',
]);

/** Customer: subscribe to provider GPS updates while tracking a job. */
export function useCustomerLiveLocation(providerId: number | null | undefined, enabled: boolean) {
  const connect = useLiveLocationSocketStore((s) => s.connect);
  const subscribeProvider = useLiveLocationSocketStore((s) => s.subscribeProvider);
  const clearProviderLocation = useLiveLocationSocketStore((s) => s.clearProviderLocation);
  const providerLocation = useLiveLocationSocketStore((s) => s.providerLocation);
  const isProviderOffline = useLiveLocationSocketStore((s) => s.isProviderOffline);

  useEffect(() => {
    if (!enabled || providerId == null || !Number.isFinite(Number(providerId))) {
      return undefined;
    }
    connect();
    subscribeProvider(Number(providerId));
    return () => {
      clearProviderLocation();
    };
  }, [clearProviderLocation, connect, enabled, providerId, subscribeProvider]);

  return { providerLocation, isProviderOffline };
}

/** Tasker: emit GPS while job is in an active transit/work status. */
export function useTaskerLiveLocationPublish(status: string | null | undefined, enabled: boolean) {
  const connect = useLiveLocationSocketStore((s) => s.connect);
  const updateLocation = useLiveLocationSocketStore((s) => s.updateLocation);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const normalized = (status ?? '').toLowerCase();
    const shouldPublish = enabled && ACTIVE_STATUSES.has(normalized);
    if (!shouldPublish) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return undefined;
    }

    connect();

    let cancelled = false;

    const tick = async () => {
      try {
        const granted = await requestLocationPermission();
        if (!granted || cancelled) return;
        const pos = await getCurrentPosition();
        if (cancelled) return;
        updateLocation(pos.latitude, pos.longitude);
      } catch {
        // ignore transient GPS errors
      }
    };

    void tick();
    intervalRef.current = setInterval(() => {
      void tick();
    }, 10000);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [connect, enabled, status, updateLocation]);
}
