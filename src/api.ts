import type { OutingPlan, Request, Message, UserProfile } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Plans
  async getPlans(category?: string, city?: string, state?: string): Promise<OutingPlan[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (city && city !== 'all') params.append('city', city);
    if (state && state !== 'all') params.append('state', state);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<OutingPlan[]>(`/plans/${query}`);
  },

  async createPlan(data: {
    host_id: string;
    title: string;
    category: string;
    venue: string;
    area_neighborhood: string;
    scheduled_time: string;
    slots_total: number;
    split_vibe: string;
    city?: string;
    state?: string;
    is_beacon?: boolean;
    expires_at?: string;
    squad_type?: 'all' | 'girls_only' | 'balanced';
  }): Promise<OutingPlan> {
    return fetchJson<OutingPlan>('/plans/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async checkInMember(planId: string, userId: string): Promise<{ status: string; time: string; is_host?: boolean }> {
    return fetchJson<{ status: string; time: string; is_host?: boolean }>(`/plans/${planId}/check-in/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  // Auth & Onboarding
  async googleAuth(email: string, fullName: string, avatarUrl?: string): Promise<UserProfile> {
    return fetchJson<UserProfile>('/auth/google/', {
      method: 'POST',
      body: JSON.stringify({ email, full_name: fullName, avatar_url: avatarUrl }),
    });
  },

  async completeOnboarding(
    userId: string,
    data: { city: string; state?: string; interests: string[]; username?: string; bio?: string; avatar_url?: string | null }
  ): Promise<UserProfile> {
    return fetchJson<UserProfile>('/auth/onboarding/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, ...data }),
    });
  },

  // Profiles
  async getProfile(userId: string): Promise<UserProfile> {
    return fetchJson<UserProfile>(`/profiles/${userId}/`);
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return fetchJson<UserProfile>(`/profiles/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Requests
  async getUserRequests(applicantId: string): Promise<Record<string, 'pending' | 'accepted' | 'declined'>> {
    const reqs = await fetchJson<Request[]>(`/requests/?applicant_id=${applicantId}`);
    const mapping: Record<string, 'pending' | 'accepted' | 'declined'> = {};
    reqs.forEach((r) => {
      mapping[r.plan_id] = r.status;
    });
    return mapping;
  },

  async getPlanRequests(planId: string): Promise<Request[]> {
    return fetchJson<Request[]>(`/requests/?plan_id=${planId}`);
  },

  async submitJoinRequest(planId: string, applicantId: string, pitchMessage: string): Promise<Request> {
    return fetchJson<Request>('/requests/', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        applicant_id: applicantId,
        pitch_message: pitchMessage,
      }),
    });
  },

  async acceptRequest(requestId: string): Promise<{ status: string; slots_claimed: number }> {
    return fetchJson<{ status: string; slots_claimed: number }>(`/requests/${requestId}/accept/`, {
      method: 'POST',
    });
  },

  async declineRequest(requestId: string): Promise<{ status: string; slots_claimed: number }> {
    return fetchJson<{ status: string; slots_claimed: number }>(`/requests/${requestId}/decline/`, {
      method: 'POST',
    });
  },

  // Messages (Squad Room)
  async getPlanMessages(planId: string): Promise<Message[]> {
    return fetchJson<Message[]>(`/messages/?plan_id=${planId}`);
  },

  async sendMessage(planId: string, senderId: string, content: string): Promise<Message> {
    return fetchJson<Message>('/messages/', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        sender_id: senderId,
        content: content,
      }),
    });
  },

  // Rating & Social Karma
  async rateMember(userId: string, attendance: number, vibe: number): Promise<any> {
    return fetchJson<any>(`/profiles/${userId}/rate/`, {
      method: 'POST',
      body: JSON.stringify({ attendance, vibe }),
    });
  },
};
