/** Haversine distance in kilometres. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceKm(km: number | null | undefined): string {
  if (km == null || Number.isNaN(Number(km))) return '—';
  const n = Number(km);
  if (n < 1) return `${Math.round(n * 1000)}m Away`;
  return `${n.toFixed(1)}Km Away`;
}

export function formatMoney(amount: number | string | null | undefined, amountType?: string | null): string {
  const n = Number(amount);
  const value = Number.isFinite(n) ? `£${n.toFixed(n % 1 === 0 ? 0 : 2)}` : '—';
  const t = (amountType ?? '').toLowerCase();
  if (t.includes('hour')) return `${value}/h`;
  return value;
}
