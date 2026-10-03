import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { 
  supabase, 
  isLiveSupabaseConfigured, 
  UserProfile, 
  localAuthService, 
  LocalUser 
} from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isLiveMode: boolean;
  isDemoMode: boolean;
  unverifiedEmail: string | null;
  clearUnverifiedEmail: () => void;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
  verifySimulatedEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      setLoading(true);

      if (isLiveSupabaseConfigured && supabase) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession && currentSession.user) {
            setSession(currentSession);
            setUser(currentSession.user);
            await fetchSupabaseProfile(currentSession.user.id, currentSession.user.email || '');
          }
        } catch (err) {
          console.warn('Error fetching Supabase session:', err);
        }

        // Listen to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          setSession(newSession);
          if (newSession && newSession.user) {
            setUser(newSession.user);
            await fetchSupabaseProfile(newSession.user.id, newSession.user.email || '');
          } else {
            setUser(null);
            setProfile(null);
          }
        });

        setLoading(false);
        return () => subscription.unsubscribe();
      } else {
        // Fallback / local storage session restoration
        const localSession = localAuthService.getCurrentSession();
        if (localSession) {
          setUser(localSession.user);
          setProfile(localSession.profile);
          setIsDemoMode(localSession.user.id === 'demo-user-vedant');
        }
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  // Helper to fetch or create user profile from Supabase database
  const fetchSupabaseProfile = async (userId: string, email: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        setProfile({
          id: data.id,
          userId: data.user_id,
          fullName: data.full_name || email.split('@')[0],
          email,
          homeType: data.home_type || 'Apartment',
          occupants: data.people_count || 3,
          electricityProvider: data.electricity_provider || 'Generic Utility',
          tariffRate: Number(data.tariff_rate) || 7.5,
          monthlyBudget: Number(data.monthly_budget) || 2500,
          hasCompletedOnboarding: true,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      } else {
        // Create initial profile if missing
        const newProf: UserProfile = {
          id: userId,
          userId,
          fullName: email.split('@')[0],
          email,
          homeType: 'Apartment',
          occupants: 3,
          electricityProvider: 'Generic Utility',
          tariffRate: 7.5,
          monthlyBudget: 2500,
          hasCompletedOnboarding: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await supabase.from('profiles').insert({
          id: userId,
          user_id: userId,
          full_name: newProf.fullName,
          home_type: newProf.homeType,
          people_count: newProf.occupants,
          electricity_provider: newProf.electricityProvider,
          tariff_rate: newProf.tariffRate,
          monthly_budget: newProf.monthlyBudget,
        });
        setProfile(newProf);
      }
    } catch (err) {
      console.error('Error fetching Supabase profile:', err);
    }
  };

  // Sign Up
  const signUp = async (email: string, password: string, fullName: string) => {
    // 1. Password policy validation: min 8 chars, 1 number, 1 uppercase
    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }
    if (!/[0-9]/.test(password)) {
      return { success: false, error: 'Password must contain at least one number.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { success: false, error: 'Password must contain at least one uppercase letter.' };
    }

    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            return { success: false, error: 'An account with this email already exists. Try signing in instead.' };
          }
          return { success: false, error: error.message };
        }

        if (data.user && !data.session) {
          setUnverifiedEmail(email);
          return { success: true, requiresVerification: true };
        }

        return { success: true, requiresVerification: false };
      } catch (err) {
        return { success: false, error: "We couldn't connect to ENERO. Please check your connection and try again." };
      }
    } else {
      // Local Auth Provider
      const users = localAuthService.getUsers();
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists. Try signing in instead.' };
      }

      const newUserId = `user-${Date.now()}`;
      const newProfile: UserProfile = {
        id: newUserId,
        userId: newUserId,
        fullName: fullName.trim(),
        email: email.trim(),
        homeType: 'Apartment',
        occupants: 3,
        electricityProvider: 'Generic Grid Provider',
        tariffRate: 7.50,
        monthlyBudget: 2500,
        hasCompletedOnboarding: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newLocalUser: LocalUser = {
        id: newUserId,
        email: email.trim(),
        fullName: fullName.trim(),
        passwordHash: password,
        isEmailVerified: false,
        profile: newProfile,
      };

      localAuthService.saveUsers([...users, newLocalUser]);
      setUnverifiedEmail(email);
      return { success: true, requiresVerification: true };
    }
  };

  // Sign In
  const signIn = async (email: string, password: string) => {
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setUnverifiedEmail(email);
            return { success: false, error: 'Please verify your email before continuing.' };
          }
          return { success: false, error: 'Email or password is incorrect. Please try again.' };
        }

        setUser(data.user);
        setSession(data.session);
        setIsDemoMode(false);
        await fetchSupabaseProfile(data.user.id, data.user.email || '');
        return { success: true };
      } catch {
        return { success: false, error: "We couldn't connect to ENERO. Please check your connection and try again." };
      }
    } else {
      // Local Auth Provider
      const users = localAuthService.getUsers();
      const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!matchedUser || matchedUser.passwordHash !== password) {
        return { success: false, error: 'Email or password is incorrect. Please try again.' };
      }

      if (!matchedUser.isEmailVerified) {
        setUnverifiedEmail(email);
        return { success: false, error: 'Please verify your email before continuing.' };
      }

      const mockUser = {
        id: matchedUser.id,
        email: matchedUser.email,
        app_metadata: {},
        user_metadata: { full_name: matchedUser.fullName },
        aud: 'authenticated',
        created_at: matchedUser.profile.createdAt,
      } as User;

      setUser(mockUser);
      setProfile(matchedUser.profile);
      setIsDemoMode(matchedUser.id === 'demo-user-vedant');
      localAuthService.saveCurrentSession({ user: mockUser, profile: matchedUser.profile });
      return { success: true };
    }
  };

  // Sign In with Google
  const signInWithGoogle = async () => {
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch {
        return { success: false, error: "We couldn't connect to Google sign-in. Try again." };
      }
    } else {
      // Demo Google Sign-In
      const googleUser = {
        id: 'google-user-sample',
        email: 'alex.energy@gmail.com',
        app_metadata: {},
        user_metadata: { full_name: 'Alex Rivera' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      const googleProfile: UserProfile = {
        id: 'google-user-sample',
        userId: 'google-user-sample',
        fullName: 'Alex Rivera',
        email: 'alex.energy@gmail.com',
        homeType: 'Apartment',
        occupants: 2,
        electricityProvider: 'Tata Power',
        tariffRate: 7.5,
        monthlyBudget: 2200,
        hasCompletedOnboarding: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(googleUser);
      setProfile(googleProfile);
      setIsDemoMode(false);
      localAuthService.saveCurrentSession({ user: googleUser, profile: googleProfile });
      return { success: true };
    }
  };

  // Demo Mode Account ("Vedant" from spec Section 8 & 19)
  const signInWithDemo = async () => {
    const demoUser = {
      id: 'demo-user-vedant',
      email: 'vedant@example.com',
      app_metadata: {},
      user_metadata: { full_name: 'Vedant Deshmukh' },
      aud: 'authenticated',
      created_at: '2026-09-01T00:00:00.000Z',
    } as User;

    const demoProfile: UserProfile = {
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
    };

    setUser(demoUser);
    setProfile(demoProfile);
    setIsDemoMode(true);
    localAuthService.saveCurrentSession({ user: demoUser, profile: demoProfile });
  };

  // Sign Out
  const signOut = async () => {
    if (isLiveSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localAuthService.saveCurrentSession(null);
    setUser(null);
    setProfile(null);
    setSession(null);
    setIsDemoMode(false);
    setUnverifiedEmail(null);
  };

  // Reset Password Request
  const resetPassword = async (email: string) => {
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch {
        return { success: false, error: "Unable to send reset email. Please check your connection." };
      }
    } else {
      // In local/demo mode, always return success to prevent email enumeration
      return { success: true };
    }
  };

  // Update Password
  const updatePassword = async (newPassword: string) => {
    if (newPassword.length < 8 || !/[0-9]/.test(newPassword) || !/[A-Z]/.test(newPassword)) {
      return { success: false, error: 'Password must have at least 8 characters, one number, and one uppercase letter.' };
    }

    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch {
        return { success: false, error: 'Failed to update password.' };
      }
    } else {
      if (user) {
        const users = localAuthService.getUsers();
        const updated = users.map(u => u.id === user.id ? { ...u, passwordHash: newPassword } : u);
        localAuthService.saveUsers(updated);
      }
      return { success: true };
    }
  };

  // Update User Profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return { success: false, error: 'Not authenticated' };

    const updatedProfile: UserProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: updatedProfile.fullName,
            home_type: updatedProfile.homeType,
            people_count: updatedProfile.occupants,
            electricity_provider: updatedProfile.electricityProvider,
            tariff_rate: updatedProfile.tariffRate,
            monthly_budget: updatedProfile.monthlyBudget,
            updated_at: updatedProfile.updatedAt,
          })
          .eq('user_id', user.id);

        if (error) return { success: false, error: error.message };
        setProfile(updatedProfile);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    } else {
      setProfile(updatedProfile);
      localAuthService.saveCurrentSession({ user, profile: updatedProfile });
      
      const users = localAuthService.getUsers();
      const updatedUsers = users.map(u => u.id === user.id ? { ...u, fullName: updatedProfile.fullName, profile: updatedProfile } : u);
      localAuthService.saveUsers(updatedUsers);
      return { success: true };
    }
  };

  const resendVerificationEmail = async (_email: string) => {
    // In live mode, supabase resends verification
    return true;
  };

  const verifySimulatedEmail = async (email: string) => {
    const users = localAuthService.getUsers();
    const updated = users.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, isEmailVerified: true } : u);
    localAuthService.saveUsers(updated);
    setUnverifiedEmail(null);

    // Auto sign in user after verification
    const verifiedUser = updated.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (verifiedUser) {
      const mockUser = {
        id: verifiedUser.id,
        email: verifiedUser.email,
        app_metadata: {},
        user_metadata: { full_name: verifiedUser.fullName },
        aud: 'authenticated',
        created_at: verifiedUser.profile.createdAt,
      } as User;

      setUser(mockUser);
      setProfile(verifiedUser.profile);
      localAuthService.saveCurrentSession({ user: mockUser, profile: verifiedUser.profile });
    }
  };

  const clearUnverifiedEmail = () => {
    setUnverifiedEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isLiveMode: isLiveSupabaseConfigured,
        isDemoMode,
        unverifiedEmail,
        clearUnverifiedEmail,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithDemo,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        resendVerificationEmail,
        verifySimulatedEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
