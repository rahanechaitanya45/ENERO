import { UserProfile, HomeType } from '../types';

const PROFILE_KEY_PREFIX = 'enero_user_profile_';

export const profileService = {
  getProfile(userId: string, email: string = '', displayName: string = ''): UserProfile {
    try {
      const data = localStorage.getItem(`${PROFILE_KEY_PREFIX}${userId}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load profile from localStorage', e);
    }

    // Default demo profile for Vedant
    if (userId === 'demo-user-vedant') {
      const demoProfile: UserProfile = {
        id: 'demo-user-vedant',
        userId: 'demo-user-vedant',
        fullName: 'Vedant Deshmukh',
        email: email || 'vedant@example.com',
        homeType: 'Apartment',
        occupants: 4,
        electricityProvider: 'Tata Power Residential',
        tariffRate: 7.50,
        monthlyBudget: 2500,
        hasCompletedOnboarding: true,
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
      };
      this.saveProfile(demoProfile);
      return demoProfile;
    }

    // New profile initialized from Firebase user details
    const derivedName = displayName || (email ? email.split('@')[0] : 'ENERO User');
    const newProfile: UserProfile = {
      id: userId,
      userId,
      fullName: derivedName,
      email: email || '',
      homeType: 'Apartment',
      occupants: 3,
      electricityProvider: 'Tata Power',
      tariffRate: 7.50,
      monthlyBudget: 2500,
      hasCompletedOnboarding: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveProfile(newProfile);
    return newProfile;
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(`${PROFILE_KEY_PREFIX}${profile.userId}`, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  },

  updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const current = this.getProfile(userId);
    const updated: UserProfile = {
      ...current,
      ...updates,
      userId,
      updatedAt: new Date().toISOString(),
    };
    this.saveProfile(updated);
    return updated;
  },
};
