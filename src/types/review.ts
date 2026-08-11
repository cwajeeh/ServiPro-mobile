export interface Reviewer {
  id: number;
  first_name: string;
  last_name: string;
  profile_image: string | null;
}

export interface TaskInfo {
  id: number;
  title: string;
}

export interface Review {
  id: number;
  reviewer: Reviewer;
  task: TaskInfo;
  rating: number;
  images: string[];
  comment: string;
  reviewAs: string;
  createdAt: string;
}

export interface RatingBreakdown {
  [key: string]: number;
}

export interface OverallRating {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: RatingBreakdown;
}

export interface Pagination {
  page: string;
  pageSize: string;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ReviewData {
  reviews: Review[];
  overallRating: OverallRating;
  pagination: Pagination;
}

export interface ReviewResponse {
  statusCode: number;
  data: ReviewData;
  message: string;
}

export interface ProviderReview {
  reviewerName: string;
  rating: number;
  comment: string;
  images: string[];
  taskTitle: string;
  createdAt: string;
}

export interface ProviderReviewData {
  reviews: ProviderReview[];
  avgRating: number;
  pagination: Pagination;
}

export interface ProviderReviewResponse {
  statusCode: number;
  data: ProviderReviewData;
  message: string;
}
