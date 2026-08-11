import { apiClient } from '@/api/client';
import type { ServiceCategory, ServiceSubcategory, SubcategoryDetailResponse } from '@/types/services';

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function extractCategoryArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (!isRecord(payload)) {
    return [];
  }
  const data = payload.data;
  if (Array.isArray(data)) {
    return data;
  }
  if (isRecord(data) && Array.isArray(data.categories)) {
    return data.categories;
  }
  if (isRecord(data) && Array.isArray(data.items)) {
    return data.items;
  }
  if (Array.isArray(payload.categories)) {
    return payload.categories;
  }
  return [];
}

function defaultIcon(): string {
  return '📋';
}

function normalizeCategory(raw: unknown): ServiceCategory | null {
  if (!isRecord(raw)) {
    return null;
  }
  const id = raw.id ?? raw.category_id ?? raw.categoryId;
  const name = raw.name ?? raw.title ?? raw.label;
  if (id == null || name == null) {
    return null;
  }
  const idStr = String(id).trim();
  const nameStr = String(name).trim();
  if (!idStr || !nameStr) {
    return null;
  }
  let icon = defaultIcon();
  const iconRaw = raw.icon ?? raw.image ?? raw.image_url ?? raw.imageUrl;
  if (typeof iconRaw === 'string' && iconRaw.trim()) {
    icon = iconRaw.trim();
  }

  let backgroundColor: string | undefined;
  const colorRaw = raw.color ?? raw.backgroundColor ?? raw.bg_color ?? raw.background_color;
  if (typeof colorRaw === 'string' && colorRaw.trim()) {
    backgroundColor = colorRaw.trim();
  }

  return { id: idStr, name: nameStr, icon, backgroundColor };
}

/**
 * GET /services/categories — lists service categories for tasker selection.
 */
export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  const { data: body } = await apiClient.get<unknown>('/services/categories');
  const list = extractCategoryArray(body);
  const mapped = list.map(normalizeCategory).filter((c): c is ServiceCategory => c !== null);
  return mapped;
}

function extractSubcategoryArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (!isRecord(payload)) {
    return [];
  }
  const data = payload.data;
  if (Array.isArray(data)) {
    return data;
  }
  if (isRecord(data) && Array.isArray(data.data)) {
    return data.data;
  }
  if (isRecord(data) && Array.isArray(data.subcategories)) {
    return data.subcategories;
  }
  if (isRecord(data) && Array.isArray(data.items)) {
    return data.items;
  }
  if (Array.isArray(payload.subcategories)) {
    return payload.subcategories;
  }
  return [];
}

function normalizeSubcategory(raw: unknown): ServiceSubcategory | null {
  if (!isRecord(raw)) {
    return null;
  }
  const id = raw.id ?? raw.subcategory_id ?? raw.subcategoryId;
  const name = raw.name ?? raw.title ?? raw.label;
  if (name == null) {
    return null;
  }
  const nameStr = String(name).trim();
  if (!nameStr) {
    return null;
  }
  const idStr = id != null ? String(id).trim() : nameStr;
  
  let icon: string | undefined;
  const iconRaw = raw.icon ?? raw.image ?? raw.image_url ?? raw.imageUrl;
  if (typeof iconRaw === 'string' && iconRaw.trim()) {
    icon = iconRaw.trim();
  }

  let backgroundColor: string | undefined;
  const colorRaw = raw.color ?? raw.backgroundColor ?? raw.bg_color ?? raw.background_color;
  if (typeof colorRaw === 'string' && colorRaw.trim()) {
    backgroundColor = colorRaw.trim();
  }

  const startingPrice = typeof raw.starting_price === 'number' ? raw.starting_price : undefined;
  const taskerCount = raw.tasker_count != null ? String(raw.tasker_count) : undefined;

  return { id: idStr, name: nameStr, icon, backgroundColor, startingPrice, taskerCount };
}

/**
 * GET /services/categories/:categoryId/subcategories
 */
export async function fetchServiceSubcategories(categoryId: string): Promise<ServiceSubcategory[]> {
  const path = `/services/subcategories/${encodeURIComponent(categoryId)}`;
  const { data: body } = await apiClient.get<unknown>(path);
  const list = extractSubcategoryArray(body);
  return list.map(normalizeSubcategory).filter((s): s is ServiceSubcategory => s !== null);
}

/**
 * GET /services/subcategories/detail/:subCategoryId
 * Fetches subcategory detail and available taskers with optional price filtering.
 */
export async function fetchSubcategoryDetail(
  subCategoryId: string | number,
  minPrice?: number,
  maxPrice?: number
): Promise<SubcategoryDetailResponse | null> {
  let path = `/services/subcategories/detail/${subCategoryId}`;
  const params = new URLSearchParams();
  if (minPrice !== undefined) params.append('minPrice', String(minPrice));
  if (maxPrice !== undefined) params.append('maxPrice', String(maxPrice));
  
  const query = params.toString();
  if (query) path += `?${query}`;

  const { data: body } = await apiClient.get<unknown>(path);
  if (isRecord(body) && isRecord(body.data) && isRecord(body.data.data)) {
    return body.data.data as SubcategoryDetailResponse;
  }
  return null;
}
