function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** Pull a task id from common create-task API response shapes. */
export function extractTaskIdFromResponse(data: unknown): number | null {
  if (!isRecord(data)) return null;

  const tryId = (raw: unknown): number | null => {
    if (!isRecord(raw)) return null;
    const id = raw.id ?? raw.taskId ?? raw.task_id;
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const nestedData = isRecord(data.data) ? data.data : null;
  const candidates: unknown[] = [
    data.task,
    nestedData?.task,
    nestedData,
    data,
  ];

  for (const c of candidates) {
    const id = tryId(c);
    if (id != null) return id;
  }
  return null;
}
