import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// If live credentials are supplied, create genuine client
let client: SupabaseClient | null = null;
if (isLiveSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
  }
}

export const supabase = client;

/**
 * Interface representing ENERO User Profile
 */
export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  homeType: 'Apartment' | 'Independent House' | 'Hostel/PG' | 'Small Office' | 'Other';
  occupants: number;
  electricityProvider: string;
  tariffRate: number;
  monthlyBudget: number;
  hasCompletedOnboarding: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Local auth user store for seamless offline/preview operation
 */
const LOCAL_USERS_KEY = 'enero_local_auth_users_v1';
const LOCAL_SESSION_KEY = 'enero_local_auth_session_v1';

export interface LocalUser {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string; // simulated hash
  isEmailVerified: boolean;
  profile: UserProfile;
}

export const localAuthService = {
  getUsers(): LocalUser[] {
    try {
      const data = localStorage.getItem(LOCAL_USERS_KEY);
      if (data) return JSON.parse(data);
    } catch {}

    // Pre-populate with demo user "Vedant" as referenced in Section 8 of prompt
    const demoUser: LocalUser = {
      id: 'demo-user-vedant',
      email: 'vedant@example.com',
      fullName: 'Vedant Deshmukh',
      passwordHash: 'DemoPass123',
      isEmailVerified: true,
      profile: {
        id: 'demo-user-vedant',
        userId: 'demo-user-vedant',
        fullName: 'Vedant Deshmukh',
        email: 'vedant@example.com',
        homeType: 'Apartment',
        occupants: 4,
        electricityProvider: 'Tata Power Residential',
        tariffRate: 7.50,
        monthlyBudget: 2500,
        hasCompletedOnboarding: true,
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
      },
    };
    this.saveUsers([demoUser]);
    return [demoUser];
  },

  saveUsers(users: LocalUser[]) {
    try {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save local users', e);
    }
  },

  getCurrentSession(): { user: User; profile: UserProfile } | null {
    try {
      const data = localStorage.getItem(LOCAL_SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  saveCurrentSession(sessionData: { user: User; profile: UserProfile } | null) {
    try {
      if (sessionData) {
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionData));
      } else {
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }
    } catch (e) {
      console.error('Failed to save session', e);
    }
  },
};
