/** Tolerates wrapped `data.tokens`, flat `data.access_token`, or top-level token fields. */
export function parseRefreshTokenResponse(data: unknown): { access_token: string; refresh_token: string } | null {
  if (data === null || data === undefined || typeof data !== 'object') {
    return null;
  }
  const root = data as Record<string, unknown>;
  const inner = root.data;
  if (inner !== null && inner !== undefined && typeof inner === 'object') {
    const d = inner as Record<string, unknown>;
    const tokens = d.tokens;
    if (tokens !== null && tokens !== undefined && typeof tokens === 'object') {
      const t = tokens as Record<string, unknown>;
      const a = t.access_token;
      const r = t.refresh_token;
      if (typeof a === 'string' && typeof r === 'string' && a.length > 0 && r.length > 0) {
        return { access_token: a, refresh_token: r };
      }
    }
    const da = d.access_token;
    const dr = d.refresh_token;
    if (typeof da === 'string' && typeof dr === 'string' && da.length > 0 && dr.length > 0) {
      return { access_token: da, refresh_token: dr };
    }
  }
  const ta = root.access_token;
  const tr = root.refresh_token;
  if (typeof ta === 'string' && typeof tr === 'string' && ta.length > 0 && tr.length > 0) {
    return { access_token: ta, refresh_token: tr };
  }
  return null;
}
