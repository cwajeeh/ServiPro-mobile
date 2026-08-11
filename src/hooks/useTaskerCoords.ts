import { useCallback, useEffect, useState } from 'react';

import { useAuthStore } from '@/store/authStore';
import { getCurrentPosition, requestLocationPermission } from '@/utils/nativeLocation';

export function useTaskerCoords() {
  const user = useAuthStore((s) => s.user);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() => {
    const lat = user?.lat != null ? Number(user.lat) : NaN;
    const lng = user?.lng != null ? Number(user.lng) : NaN;
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!coords);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        const lat = user?.lat != null ? Number(user.lat) : NaN;
        const lng = user?.lng != null ? Number(user.lng) : NaN;
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setCoords({ lat, lng });
          return { lat, lng };
        }
        setError('Location permission is required to find nearby jobs.');
        return null;
      }
      const pos = await getCurrentPosition();
      const next = { lat: pos.latitude, lng: pos.longitude };
      setCoords(next);
      return next;
    } catch (e) {
      const lat = user?.lat != null ? Number(user.lat) : NaN;
      const lng = user?.lng != null ? Number(user.lng) : NaN;
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const next = { lat, lng };
        setCoords(next);
        return next;
      }
      setError(e instanceof Error ? e.message : 'Could not get location');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.lat, user?.lng]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { coords, loading, error, refresh };
}
