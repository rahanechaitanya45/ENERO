import { Appliance, TariffConfig, HomeProfile, HistorySnapshot } from '../types';
import { DEFAULT_APPLIANCES, DEFAULT_TARIFF, DEFAULT_HOME_PROFILE, DEFAULT_HISTORY } from '../data/defaultData';

const BASE_KEYS = {
  APPLIANCES: 'enero_user_appliances_',
  TARIFF: 'enero_user_tariff_',
  HOME_PROFILE: 'enero_user_home_profile_',
  HISTORY: 'enero_user_history_',
};

export const storageService = {
  getAppliances(userId: string = 'guest'): Appliance[] {
    try {
      const data = localStorage.getItem(`${BASE_KEYS.APPLIANCES}${userId}`);
      if (data) return JSON.parse(data);
    } catch {}

    // For demo user, return demo appliances; for guest/first-time return demo or empty
    if (userId === 'demo-user-vedant' || userId === 'guest') {
      return DEFAULT_APPLIANCES;
    }
    return [];
  },

  saveAppliances(appliances: Appliance[], userId: string = 'guest') {
    try {
      localStorage.setItem(`${BASE_KEYS.APPLIANCES}${userId}`, JSON.stringify(appliances));
    } catch (e) {
      console.error('Failed to save appliances to localStorage', e);
    }
  },

  getTariff(userId: string = 'guest'): TariffConfig {
    try {
      const data = localStorage.getItem(`${BASE_KEYS.TARIFF}${userId}`);
      return data ? JSON.parse(data) : DEFAULT_TARIFF;
    } catch {
      return DEFAULT_TARIFF;
    }
  },

  saveTariff(tariff: TariffConfig, userId: string = 'guest') {
    try {
      localStorage.setItem(`${BASE_KEYS.TARIFF}${userId}`, JSON.stringify(tariff));
    } catch (e) {
      console.error('Failed to save tariff to localStorage', e);
    }
  },

  getHomeProfile(userId: string = 'guest'): HomeProfile {
    try {
      const data = localStorage.getItem(`${BASE_KEYS.HOME_PROFILE}${userId}`);
      return data ? JSON.parse(data) : DEFAULT_HOME_PROFILE;
    } catch {
      return DEFAULT_HOME_PROFILE;
    }
  },

  saveHomeProfile(profile: HomeProfile, userId: string = 'guest') {
    try {
      localStorage.setItem(`${BASE_KEYS.HOME_PROFILE}${userId}`, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save home profile to localStorage', e);
    }
  },

  getHistory(userId: string = 'guest'): HistorySnapshot[] {
    try {
      const data = localStorage.getItem(`${BASE_KEYS.HISTORY}${userId}`);
      if (data) return JSON.parse(data);
    } catch {}

    if (userId === 'demo-user-vedant' || userId === 'guest') {
      return DEFAULT_HISTORY;
    }
    return [];
  },

  saveHistory(history: HistorySnapshot[], userId: string = 'guest') {
    try {
      localStorage.setItem(`${BASE_KEYS.HISTORY}${userId}`, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  },

  resetToDemo(userId: string = 'demo-user-vedant'): {
    appliances: Appliance[];
    tariff: TariffConfig;
    homeProfile: HomeProfile;
    history: HistorySnapshot[];
  } {
    try {
      localStorage.setItem(`${BASE_KEYS.APPLIANCES}${userId}`, JSON.stringify(DEFAULT_APPLIANCES));
      localStorage.setItem(`${BASE_KEYS.TARIFF}${userId}`, JSON.stringify(DEFAULT_TARIFF));
      localStorage.setItem(`${BASE_KEYS.HOME_PROFILE}${userId}`, JSON.stringify(DEFAULT_HOME_PROFILE));
      localStorage.setItem(`${BASE_KEYS.HISTORY}${userId}`, JSON.stringify(DEFAULT_HISTORY));
    } catch (e) {
      console.error('Failed to reset demo data', e);
    }
    return {
      appliances: DEFAULT_APPLIANCES,
      tariff: DEFAULT_TARIFF,
      homeProfile: DEFAULT_HOME_PROFILE,
      history: DEFAULT_HISTORY,
    };
  },

  clearAllUserData(userId: string): {
    appliances: Appliance[];
    tariff: TariffConfig;
    homeProfile: HomeProfile;
    history: HistorySnapshot[];
  } {
    const emptyAppliances: Appliance[] = [];
    try {
      localStorage.setItem(`${BASE_KEYS.APPLIANCES}${userId}`, JSON.stringify(emptyAppliances));
      localStorage.setItem(`${BASE_KEYS.HISTORY}${userId}`, JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear data', e);
    }
    return {
      appliances: emptyAppliances,
      tariff: DEFAULT_TARIFF,
      homeProfile: DEFAULT_HOME_PROFILE,
      history: [],
    };
  }
};

