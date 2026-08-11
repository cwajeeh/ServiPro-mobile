/** Normalized category for tasker onboarding UI. */
export type ServiceCategory = {
  id: string;
  name: string;
  /** Emoji / short text, or `https://` image URL */
  icon: string;
  backgroundColor?: string;
};

/** Subcategory under a service category (`/services/categories/:id/subcategories`). */
export type ServiceSubcategory = {
  id: string;
  name: string;
  icon?: string;
  backgroundColor?: string;
  startingPrice?: number;
  taskerCount?: string;
};

export type SubcategoryDetail = {
  id: number | string;
  title: string;
  description: string;
  category: string;
  starting_price: number;
};

export type TaskerInfo = {
  provider_id: string | null;
  name: string;
  rating: number;
  address: string | null;
  profile_image: string | null;
  price_hourly: number;
};

export type SubcategoryDetailResponse = {
  subcategory: SubcategoryDetail;
  taskers: TaskerInfo[];
};
