import { ProviderReviewResponse, ReviewResponse } from '@/types/review';
import { apiClient } from './client';

export async function fetchMyReviews(page = 1, pageSize = 10): Promise<ReviewResponse> {
  const { data } = await apiClient.get<ReviewResponse>('/reviews/my', {
    params: {
      page,
      pageSize,
    },
  });
  return data;
}

export async function fetchProviderReviews(
  providerId: number,
  page = 1,
  pageSize = 10
): Promise<ProviderReviewResponse> {
  const { data } = await apiClient.get<ProviderReviewResponse>(`/reviews/provider/${providerId}`, {
    params: {
      page,
      pageSize,
    },
  });
  return data;
}

export type ReviewQuestion = {
  id: number | string;
  question?: string;
  text?: string;
  [key: string]: unknown;
};

export type PostReviewPayload = {
  revieweeId: number;
  rating: number;
  comment: string;
  reviewAs: 'customer' | 'tasker' | string;
  taskId: number | string;
  images?: string[];
  answers?: { questionId: number | string; answer: string | number }[];
};

export async function fetchReviewQuestions(): Promise<ReviewQuestion[]> {
  const { data } = await apiClient.get<unknown>('/reviews/questions');
  if (Array.isArray(data)) return data as ReviewQuestion[];
  if (data && typeof data === 'object') {
    const d = data as { data?: unknown };
    if (Array.isArray(d.data)) return d.data as ReviewQuestion[];
    if (d.data && typeof d.data === 'object' && Array.isArray((d.data as { questions?: unknown }).questions)) {
      return (d.data as { questions: ReviewQuestion[] }).questions;
    }
  }
  return [];
}

export async function postReview(payload: PostReviewPayload) {
  const { data } = await apiClient.post('/reviews', payload);
  return data;
}
