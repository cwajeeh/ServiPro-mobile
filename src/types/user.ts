import { ApiUserRole } from './auth';

export interface UserProfile {
  id: number;
  email: string;
  phone: string;
  countryCode: string;
  isoCode: string;
  address: string;
  first_name: string;
  last_name: string;
  soleTrader: boolean;
  lat: number;
  lng: number;
  created_at: string;
  updated_at: string;
  location_enabled: boolean;
  profile_image: string | null;
  notifications_enabled: boolean;
  wallet_balance: string;
  is_online: boolean;
  role: ApiUserRole;
  description: string | null;
  avgRating: number;
  reviewCount: number;
}

export interface UserProfileResponse {
  statusCode: number;
  data: UserProfile;
  message: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  countryCode?: string;
  isoCode?: string;
  address?: string;
  profile_image?: string;
  description?: string;
}
