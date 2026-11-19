export interface OutingPlan {
  id: string;
  host_id: string;
  title: string;
  category: string;
  venue: string;
  area_neighborhood: string;
  city?: string;
  state?: string;
  scheduled_time: string;
  slots_total: number;
  slots_claimed: number;
  split_vibe: string;
  notes?: string | null;
  status?: string;
  is_beacon?: boolean;
  expires_at?: string | null;
  squad_type?: 'all' | 'girls_only' | 'balanced';
  host?: {
    id?: string;
    full_name: string;
    username: string;
    avatar_url?: string | null;
    bio?: string | null;
    outings_attended?: number;
    outings_flaked?: number;
  };
}

export interface Request {
  id: string;
  plan_id: string;
  applicant_id: string;
  pitch_message: string;
  status: 'pending' | 'accepted' | 'declined';
  checked_in?: boolean;
  checked_in_at?: string | null;
  applicant?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url?: string | null;
    bio?: string | null;
    outings_attended?: number;
    outings_flaked?: number;
    strike_count?: number;
  };
}

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    id?: string;
    full_name: string;
    username?: string;
    avatar_url?: string | null;
  };
}

export interface UserProfile {
  id: string;
  phone?: string | null;
  full_name: string;
  username: string;
  avatar_url?: string | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  safety_contact_name?: string | null;
  safety_contact_phone?: string | null;
  outings_attended: number;
  outings_flaked: number;
  strike_count?: number;
  suspended_until?: string | null;
  fcm_token?: string | null;
  email?: string | null;
  interests?: string[];
  onboarded?: boolean;
}

export type CategoryId = 
  | 'all' 
  | 'screen_stage' 
  | 'food_cafes' 
  | 'sports_turf' 
  | 'gigs_nightlife' 
  | 'arcades_gaming' 
  | 'outdoors_trips' 
  | 'expos_culture';

export type TabType = 'discover' | 'my_plans' | 'squads' | 'profile';
