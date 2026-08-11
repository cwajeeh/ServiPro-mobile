import { apiClient } from '@/api/client';
import type { JobItem } from '@/components/tasker/JobCard';
import { formatDistanceKm, formatMoney, haversineKm } from '@/utils/geo';
import { resolveMediaUrl } from '@/utils/mediaUrl';

export const DEFAULT_TASKER_RADIUS_KM = 25;

export type TaskerJobTypeFilter = 'scheduled' | 'quick' | 'hourly' | 'fixed';

export interface AvailableJobRaw {
  taskId: number;
  scheduledDate?: string;
  clientName?: string;
  clientProfileImage?: string | null;
  taskTitle?: string;
  amount?: string | number | null;
  price?: string | number | null;
  amountType?: string | null;
  amount_type?: string | null;
  description?: string;
  entimatedTime?: string;
  estimatedTime?: string;
  categoryName?: string;
  subcategoryName?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  type?: string;
  taskType?: string;
  clientAddress?: string;
  ClientId?: number;
  clientRating?: string | number;
  working_hours?: string | number;
  taskBeforeImages?: Array<{ image_url?: string; url?: string } | string>;
}

export interface PlaceBidPayload {
  amount: number;
  message: string;
  portfolio: string[];
}

export interface WalletStats {
  totalEarnings: number;
  todayEarnings: number;
  totalTasks: number;
  totalHours: number;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function extractJobs(body: unknown): AvailableJobRaw[] {
  if (!isRecord(body)) return [];
  const data = body.data;
  if (Array.isArray(data)) return data as AvailableJobRaw[];
  if (isRecord(data) && Array.isArray(data.jobs)) return data.jobs as AvailableJobRaw[];
  if (isRecord(data) && Array.isArray(data.bids)) return data.bids as AvailableJobRaw[];
  if (Array.isArray(body.jobs)) return body.jobs as AvailableJobRaw[];
  return [];
}

function extractData<T>(body: unknown): T | null {
  if (!isRecord(body)) return null;
  return (body.data as T) ?? null;
}

function parseWorkingHours(raw: string | number | undefined): number | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw !== 'string') return undefined;
  const m = raw.match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : undefined;
}

function mapStatus(status?: string): JobItem['status'] | undefined {
  if (!status) return undefined;
  const s = status.toLowerCase();
  if (s.includes('progress') || s.includes('started') || s.includes('arrived') || s.includes('on_the_way')) {
    return 'In Progress';
  }
  if (s.includes('complete')) return 'Completed';
  if (s.includes('assign') || s.includes('upcoming') || s.includes('scheduled')) return 'Upcoming';
  return undefined;
}

export function mapAvailableJobToJobItem(
  raw: AvailableJobRaw,
  viewer?: { lat?: number; lng?: number } | null,
): JobItem {
  const lat = Number(raw.latitude);
  const lng = Number(raw.longitude);
  let distanceKm: number | null = null;
  if (
    viewer?.lat != null &&
    viewer?.lng != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    distanceKm = haversineKm(viewer.lat, viewer.lng, lat, lng);
  }

  const amountType = raw.amountType ?? raw.amount_type ?? '';
  const amount = raw.amount ?? raw.price;
  const avatar =
    resolveMediaUrl(raw.clientProfileImage) ??
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(raw.clientName || 'C') + '&background=19317C&color=fff';

  const images = (raw.taskBeforeImages ?? [])
    .map((item) => {
      if (typeof item === 'string') return resolveMediaUrl(item);
      if (isRecord(item)) {
        return resolveMediaUrl(
          (typeof item.image_url === 'string' && item.image_url) ||
            (typeof item.url === 'string' && item.url) ||
            '',
        );
      }
      return null;
    })
    .filter((u): u is string => Boolean(u));

  const estimated =
    raw.entimatedTime ||
    raw.estimatedTime ||
    (raw.working_hours != null ? `${raw.working_hours} hrs` : '—');

  return {
    id: String(raw.taskId),
    title: raw.taskTitle || 'Untitled job',
    price: formatMoney(amount, amountType),
    category: raw.categoryName,
    description: raw.description,
    estimatedTime: estimated,
    distance: formatDistanceKm(distanceKm),
    time: raw.scheduledDate ? String(raw.scheduledDate).slice(0, 16).replace('T', ' ') : 'Flexible',
    status: mapStatus(raw.status),
    tasker: {
      name: raw.clientName || 'Customer',
      avatar,
      rating: raw.clientRating != null ? Number(raw.clientRating) : undefined,
      address: raw.clientAddress,
    },
    budget: formatMoney(amount, amountType),
    workingHours: parseWorkingHours(raw.working_hours),
    dateTime: raw.scheduledDate
      ? String(raw.scheduledDate).slice(0, 16).replace('T', ' | ')
      : undefined,
    media: images.length ? { images } : undefined,
  };
}

export async function fetchAvailableJobs(params: {
  lat: number;
  lng: number;
  page?: number;
  pageSize?: number;
  maxDistance?: number;
  type?: TaskerJobTypeFilter;
  search?: string;
}): Promise<JobItem[]> {
  const {
    lat,
    lng,
    page = 1,
    pageSize = 20,
    maxDistance = DEFAULT_TASKER_RADIUS_KM,
    type,
    search,
  } = params;

  const query: Record<string, string | number> = {
    page,
    pageSize,
    lat,
    lng,
    maxDistance,
  };
  if (type) query.type = type;
  if (search) query.search = search;

  const { data } = await apiClient.get('/tasks/jobs/available', { params: query });
  return extractJobs(data).map((j) => mapAvailableJobToJobItem(j, { lat, lng }));
}

export async function fetchAvailableBiddingTasks(params: {
  lat: number;
  lng: number;
  page?: number;
  pageSize?: number;
  maxDistance?: number;
  type?: string;
  amountType?: string;
}): Promise<JobItem[]> {
  const {
    lat,
    lng,
    page = 1,
    pageSize = 20,
    maxDistance = DEFAULT_TASKER_RADIUS_KM,
    type,
    amountType,
  } = params;

  const query: Record<string, string | number> = {
    page,
    pageSize,
    lat,
    lng,
    maxDistance,
  };
  if (type) query.type = type;
  if (amountType) query.amountType = amountType;

  const { data } = await apiClient.get('/tasks/bidding/available', { params: query });
  return extractJobs(data).map((j) => mapAvailableJobToJobItem(j, { lat, lng }));
}

export async function fetchMyBids(params: {
  lat: number;
  lng: number;
  page?: number;
  pageSize?: number;
}): Promise<JobItem[]> {
  const { lat, lng, page = 1, pageSize = 20 } = params;
  const { data } = await apiClient.get('/tasks/my-bids', {
    params: { page, pageSize, lat, lng },
  });
  return extractJobs(data).map((j) => mapAvailableJobToJobItem(j, { lat, lng }));
}

export async function fetchTaskerTaskDetail(taskId: string | number): Promise<{
  job: JobItem;
  raw: AvailableJobRaw & Record<string, unknown>;
}> {
  const { data } = await apiClient.get(`/tasks/detail/${taskId}`);
  const raw = (extractData<AvailableJobRaw & Record<string, unknown>>(data) ??
    data) as AvailableJobRaw & Record<string, unknown>;
  if (raw && raw.taskId == null && (raw as { id?: number }).id != null) {
    (raw as AvailableJobRaw).taskId = Number((raw as { id?: number }).id);
  }
  return {
    raw,
    job: mapAvailableJobToJobItem(raw),
  };
}

export async function placeBid(taskId: string | number, payload: PlaceBidPayload) {
  const { data } = await apiClient.post(`/tasks/${taskId}/place-bid`, payload);
  return data;
}

export async function acceptTask(taskId: string | number, amount?: number) {
  const { data } = await apiClient.post(
    `/tasks/${taskId}/accept`,
    amount != null ? { amount } : {},
  );
  return data;
}

export async function rejectTask(taskId: string | number) {
  const { data } = await apiClient.post(`/tasks/${taskId}/reject`);
  return data;
}

export async function ignoreTask(taskId: string | number) {
  const { data } = await apiClient.post(`/tasks/tasks/${taskId}/ignore`);
  return data;
}

export async function fetchJobHistory(page = 1, pageSize = 20): Promise<JobItem[]> {
  const { data } = await apiClient.get('/tasks/history', {
    params: { page, pageSize },
  });
  return extractJobs(data).map((j) => mapAvailableJobToJobItem(j));
}

export async function fetchProviderRecentJobs(): Promise<JobItem[]> {
  const { data } = await apiClient.get('/tasks/provider/recent');
  return extractJobs(data).map((j) => mapAvailableJobToJobItem(j));
}

export async function fetchWalletStats(): Promise<WalletStats> {
  const { data } = await apiClient.get('/wallet/wallet-stats');
  const raw = extractData<Record<string, unknown>>(data) ?? {};
  return {
    totalEarnings: Number(raw.totalEarnings ?? 0) || 0,
    todayEarnings: Number(raw.todayEarnings ?? 0) || 0,
    totalTasks: Number(raw.totalTasks ?? 0) || 0,
    totalHours: Number(raw.totalHours ?? 0) || 0,
  };
}
