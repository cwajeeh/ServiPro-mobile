/** App navigation role (maps from API `role.name`). */
export type UserRole = 'customer' | 'tasker';

export type ApiRoleName = 'CUSTOMER' | 'TASKER' | string;

export type ApiUserRole = {
  id: number;
  name: ApiRoleName;
  created_at?: string;
  updated_at?: string;
};

export type ApiUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  countryCode?: string;
  isoCode?: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
  is_active?: boolean;
  provider: boolean;
  role: ApiUserRole;
  sole_trader?: boolean;
};

export type ApiAuthTokens = {
  access_token: string;
  refresh_token: string;
};

export type LoginResponseBody = {
  statusCode: number;
  data?: {
    user: ApiUser;
    tokens: ApiAuthTokens;
  };
  message?: string;
};
