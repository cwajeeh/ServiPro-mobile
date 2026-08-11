import { ProviderListResponse, ProviderProfileResponse, UpdateProviderProfilePayload } from '@/types/provider';
import { apiClient } from './client';

/**
 * Fetches the current provider's (Tasker's) profile from the proxy endpoint.
 */
export async function fetchMyProviderProfile(): Promise<ProviderProfileResponse> {
  const { data } = await apiClient.get<ProviderProfileResponse>('/provider/me');
  return data;
}

/**
 * Updates the current provider's (Tasker's) profile.
 */
export async function updateMyProviderProfile(payload: UpdateProviderProfilePayload): Promise<ProviderProfileResponse> {
  const { data } = await apiClient.patch<ProviderProfileResponse>('/provider/me', payload);
  return data;
}

/**
 * Fetches the list of providers with pagination and filters.
 */
export async function fetchProviders(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    categoryId?: string | number;
    subCategoryId?: string | number;
    minPrice?: number;
    maxPrice?: number;
  }
): Promise<ProviderListResponse> {
  const { data } = await apiClient.get<ProviderListResponse>('/provider', {
    params: {
      page,
      pageSize,
      categoryId: filters?.categoryId,
      subcategoryId: filters?.subCategoryId,
      // price_min: filters?.minPrice,
      // price_max: filters?.maxPrice,
    },
  });
  return data;
}

/**
 * Fetches the provider profile by ID.
 */
export async function fetchProviderById(id: string | number): Promise<ProviderProfileResponse> {
  const { data } = await apiClient.get<ProviderProfileResponse>(`/provider/${id}`);
  return data;
}
