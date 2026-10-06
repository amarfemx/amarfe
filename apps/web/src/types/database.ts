export type UserRole = 'customer' | 'courier' | 'florist' | 'admin';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  preferred_language: 'es' | 'en';
  country_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Occasion {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  icon?: string | null;
  is_active: boolean;
}

export interface City {
  id: string;
  country_id: string;
  name: string;
  state: string;
  timezone: string;
  center_lat: number;
  center_lng: number;
  is_active: boolean;
}
