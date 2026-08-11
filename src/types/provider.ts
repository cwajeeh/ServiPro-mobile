export interface ProviderPortfolioItem {
  id: number;
  image_url: string;
}

export interface ProviderSkillItem {
  id: number;
  skill_name: string;
}

export interface ProviderCertificateItem {
  id: number;
  status: string;
  file_url: string;
  issue_date: string;
  description: string;
  expiry_date: string;
  certificate_name: string;
  certificate_type: string;
}

export interface ProviderSubcategoryItem {
  id: number;
  name: string;
  isSelected: boolean;
}

export interface ProviderProfileData {
  providerid: number;
  price_hourly: number;
  userid: number;
  first_name: string;
  last_name: string;
  email: string;
  description: string;
  phone: string;
  countrycode: string;
  isocode: string;
  address: string;
  profile_image: string;
  rating: string;
  categoryid: number;
  categoryname: string;
  portfolio: ProviderPortfolioItem[];
  skills: ProviderSkillItem[];
  certificates: ProviderCertificateItem[];
  subcategories: ProviderSubcategoryItem[];
}

export interface ProviderProfileResponse {
  statusCode: number;
  data: ProviderProfileData;
  message: string;
}

export interface UpdateProviderProfilePayload {
  price_hourly?: number;
  description?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  countryCode?: string;
  isoCode?: string;
  address?: string;
  lat?: number;
  lng?: number;
  profile_image?: string;
  subcategories?: number[];
  active_subcategory_id?: number;
  skills?: {
    id?: number;
    skill_name: string;
  }[];
  certificates?: {
    id?: number;
    certificate_name: string;
    certificate_type: string;
    description: string;
    issue_date: string;
    expiry_date: string;
    file_url: string;
  }[];
  portfolio?: {
    id?: number;
    image_url: string;
  }[];
}

export interface ProviderListItem {
  id: number;
  category: string | null;
  image: string | null;
  address: string;
  name: string;
  experience_years: number;
  price_hourly: number;
  avg_rating: number;
}

export interface CategoryListItem {
  id: number;
  name: string;
  icon: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProviderListResponse {
  statusCode: number;
  data: {
    providers: ProviderListItem[];
    categories: CategoryListItem[];
    pagination: PaginationInfo;
  };
  message: string;
}
