import { apiClient } from '@/api/client';

export interface TaskBeforeImage {
  image_url: string;
  media_type: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  amount_type: 'hourly' | 'fixed';
  price: number;
  amount: number;
  categoryId: number;
  subcategoryId: number;
  latitude: number;
  longitude: number;
  address: string;
  type: 'quick' | 'scheduled';
  scheduledDate: string;
  taskLength: string;
  providerId: number | null;
  beforeImages?: TaskBeforeImage[];
}

export interface TaskMedia {
  image_url: string;
  media_type: 'image' | 'video' | string;
}

export interface CustomerTask {
  id: string | number;
  title: string;
  description?: string;
  status: string;
  category?: string;
  subcategory?: string;
  price?: number;
  amount?: number;
  amount_type?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  scheduledDate?: string;
  taskLength?: string;
  type?: string;
  createdAt?: string;
  beforeImages?: TaskMedia[];
  provider?: {
    id?: number;
    name?: string;
    avatar?: string;
  } | null;
}

export interface BookingItem {
  sr?: number;
  taskId: number;
  customer: {
    id: number;
    name: string;
    profileImage: string;
    address: string;
  };
  provider: {
    id: number;
    name: string;
    profileImage: string;
  } | null;
  title: string;
  description: string;
  category: string;
  categoryIcon?: string;
  subCategory: string;
  hours: string;
  distance?: number | null;
  type: string;
  amount: string;
  amountType: string;
  isPaid?: boolean;
  scheduledDate?: string;
  schedule?: string;
  address: string;
  status: string;
  createdAt: string;
}

export interface BookingHistoryData {
  inProgressJob: BookingItem | null;
  bookings: BookingItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface BookingHistoryResponse {
  statusCode: number;
  data: BookingHistoryData;
  message: string;
}

export interface CustomerTaskDetailStatusLog {
  status: string;
  updatedBy: number;
  timestamp: string;
}

export interface CustomerTaskDetail {
  taskId: number;
  taskTitle: string;
  description: string;
  categoryName: string;
  subCategory: string;
  working_hours: string;
  is_paid: boolean;
  assignmentStatus: string;
  providerCompletion: string | null;
  amount: string;
  amountType: string;
  scheduledDate: string;
  latitude: number;
  longitude: number;
  taskBeforeImages: string[];
  clientName: string;
  clientProfileImage: string;
  clientAddress: string;
  ClientId: number;
  clientRating: string;
  status: string;
  statusLog: CustomerTaskDetailStatusLog | null;
  /** Provider user account id for chat / live location (when assigned). */
  providerUserId: number | null;
  /** Provider profile/entity id for live-location subscribe_provider. */
  providerId: number | null;
}

export interface CustomerTaskDetailResponse {
  statusCode: number;
  data: CustomerTaskDetail;
  message: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function getStatusCode(body: unknown): number | undefined {
  if (!isRecord(body)) {
    return undefined;
  }
  const sc = body.statusCode;
  return typeof sc === 'number' ? sc : undefined;
}

function getMessage(body: unknown): string | undefined {
  if (!isRecord(body)) {
    return undefined;
  }
  const m = body.message;
  return typeof m === 'string' ? m : undefined;
}

export async function createTaskRequest(payload: CreateTaskPayload) {
  const { data } = await apiClient.post<unknown>('/tasks', payload);
  const sc = getStatusCode(data);
  if (sc !== undefined && sc !== 201 && sc !== 200) {
    throw new Error(getMessage(data) ?? 'Could not create task. Please try again.');
  }
  return data;
}

function coerceId(v: unknown): string | number {
  if (typeof v === 'string' || typeof v === 'number') {
    return v;
  }
  if (v != null && v !== '') {
    return String(v);
  }
  return '';
}

function normalizeBeforeImages(raw: unknown): TaskMedia[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => ({
      image_url: typeof item.image_url === 'string' ? item.image_url
        : typeof item.url === 'string' ? item.url
        : typeof item.media_url === 'string' ? item.media_url : '',
      media_type: typeof item.media_type === 'string' ? item.media_type : 'image',
    }))
    .filter((m) => m.image_url !== '');
}

function normalizeTask(raw: unknown): CustomerTask {
  if (!isRecord(raw)) {
    return { id: '', title: 'Untitled Task', status: 'Pending' };
  }
  const id = coerceId(raw.id ?? raw.taskId);
  const title = raw.title ?? 'Untitled Task';
  const category = raw.category;
  const subcategory = raw.subcategory;

  return {
    id,
    title: typeof title === 'string' ? title : 'Untitled Task',
    description: typeof raw.description === 'string' ? raw.description : '',
    status: typeof raw.status === 'string' ? raw.status : 'Pending',
    category:
      isRecord(category) && typeof category.name === 'string'
        ? category.name
        : typeof raw.categoryName === 'string'
          ? raw.categoryName
          : typeof raw.category === 'string'
            ? raw.category
            : '',
    subcategory:
      isRecord(subcategory) && typeof subcategory.name === 'string'
        ? subcategory.name
        : typeof raw.subcategoryName === 'string'
          ? raw.subcategoryName
          : typeof raw.subcategory === 'string'
            ? raw.subcategory
            : '',
    price: typeof raw.price === 'number' ? raw.price : typeof raw.budget === 'number' ? raw.budget : 0,
    amount: typeof raw.amount === 'number' ? raw.amount : 0,
    amount_type:
      typeof raw.amount_type === 'string'
        ? raw.amount_type
        : typeof raw.amountType === 'string'
          ? raw.amountType
          : '',
    address: typeof raw.address === 'string' ? raw.address : '',
    latitude: typeof raw.latitude === 'number' ? raw.latitude
      : typeof raw.lat === 'number' ? raw.lat : undefined,
    longitude: typeof raw.longitude === 'number' ? raw.longitude
      : typeof raw.lng === 'number' ? raw.lng : undefined,
    scheduledDate:
      typeof raw.scheduledDate === 'string'
        ? raw.scheduledDate
        : typeof raw.scheduled_date === 'string'
          ? raw.scheduled_date
          : '',
    taskLength:
      typeof raw.taskLength === 'string'
        ? raw.taskLength
        : typeof raw.task_length === 'string'
          ? raw.task_length
          : '',
    type: typeof raw.type === 'string' ? raw.type : '',
    createdAt:
      typeof raw.createdAt === 'string'
        ? raw.createdAt
        : typeof raw.created_at === 'string'
          ? raw.created_at
          : '',
    beforeImages: normalizeBeforeImages(
      raw.beforeImages ?? raw.before_images ?? raw.images ?? raw.media
    ),
    provider: normalizeProvider(raw.provider ?? raw.assignedProvider),
  };
}

function normalizeProvider(raw: unknown): CustomerTask['provider'] {
  if (raw === null || raw === undefined) {
    return null;
  }
  if (!isRecord(raw)) {
    return null;
  }
  return {
    id: typeof raw.id === 'number' ? raw.id : undefined,
    name: typeof raw.name === 'string' ? raw.name : undefined,
    avatar: typeof raw.avatar === 'string' ? raw.avatar : undefined,
  };
}

function extractTaskList(body: unknown): unknown[] {
  if (Array.isArray(body)) {
    return body;
  }
  if (!isRecord(body)) {
    return [];
  }
  const data = body.data;
  if (Array.isArray(data)) {
    return data;
  }
  if (isRecord(data) && Array.isArray(data.tasks)) {
    return data.tasks;
  }
  if (Array.isArray(body.tasks)) {
    return body.tasks;
  }
  return [];
}

export async function fetchCustomerTasks(): Promise<CustomerTask[]> {
  const { data: body } = await apiClient.get<unknown>('/tasks/my');
  const list = extractTaskList(body);
  return list.map(normalizeTask);
}

export async function fetchBookingHistory(page: number = 1, pageSize: number = 20): Promise<BookingHistoryData> {
  const { data } = await apiClient.get<BookingHistoryResponse>('/tasks/booking-history', {
    params: { page, pageSize },
  });
  return data.data;
}

export async function fetchTaskDetail(taskId: string | number): Promise<CustomerTask> {
  const { data: body } = await apiClient.get<unknown>(`/tasks/user/bookings/${taskId}`);
  const raw = isRecord(body) && isRecord(body.data) ? body.data : body;
  return normalizeTask(raw);
}

function pickNumericId(...candidates: unknown[]): number | null {
  for (const c of candidates) {
    if (c == null) continue;
    const n = Number(c);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

export async function fetchCustomerTaskDetail(
  taskId: string | number
): Promise<CustomerTaskDetail> {
  const { data: body } = await apiClient.get<CustomerTaskDetailResponse & { data?: Record<string, unknown> }>(
    `/tasks/detail/${taskId}`
  );
  const raw = (body.data ?? {}) as Record<string, unknown>;
  const assignment = isRecord(raw.assignment) ? raw.assignment : null;
  const provider = isRecord(raw.provider)
    ? raw.provider
    : isRecord(raw.assignedProvider)
      ? raw.assignedProvider
      : null;

  const providerUserId = pickNumericId(
    raw.providerUserId,
    raw.ProviderUserId,
    assignment?.providerUserId,
    assignment?.userId,
    provider?.userid,
    provider?.userId,
    provider?.user_id,
  );
  const providerId = pickNumericId(
    raw.providerId,
    raw.ProviderId,
    assignment?.providerId,
    provider?.providerid,
    provider?.providerId,
    provider?.id,
  );

  return {
    ...(body.data as CustomerTaskDetail),
    providerUserId,
    providerId,
  };
}

export async function createDispute(
  taskId: string | number,
  payload: { description: string; image_urls: string[]; reason?: string }
) {
  const { data } = await apiClient.post(`/tasks/${taskId}/disputes`, payload);
  return data;
}

export async function fetchCurrentDispute(taskId: string | number) {
  const { data } = await apiClient.get(`/tasks/${taskId}/disputes/current`);
  return data;
}

export async function fetchDisputeById(taskId: string | number, disputeId: string | number) {
  const { data } = await apiClient.get(`/tasks/${taskId}/disputes/${disputeId}`);
  return data;
}

export async function submitTaskerDisputeResponse(
  taskId: string | number,
  disputeId: string | number,
  payload: { response: string; image_urls?: string[] },
) {
  const { data } = await apiClient.post(
    `/tasks/${taskId}/disputes/${disputeId}/tasker-response`,
    payload,
  );
  return data;
}

export async function escalateDispute(taskId: string | number, disputeId: string | number) {
  const { data } = await apiClient.post(`/tasks/${taskId}/disputes/${disputeId}/escalate`, {});
  return data;
}
