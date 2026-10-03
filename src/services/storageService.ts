import { Appliance, TariffConfig, HomeProfile, HistorySnapshot } from '../types';
import { DEFAULT_APPLIANCES, DEFAULT_TARIFF, DEFAULT_HOME_PROFILE, DEFAULT_HISTORY } from '../data/defaultData';

const STORAGE_KEYS = {
  APPLIANCES: 'enero_appliances_v1',
  TARIFF: 'enero_tariff_v1',
  HOME_PROFILE: 'enero_home_profile_v1',
  HISTORY: 'enero_history_v1',
  HAS_SEEN_WIZARD: 'enero_wizard_seen_v1',
};

export const storageService = {
  getAppliances(): Appliance[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLIANCES);
      return data ? JSON.parse(data) : DEFAULT_APPLIANCES;
    } catch {
      return DEFAULT_APPLIANCES;
    }
  },

  saveAppliances(appliances: Appliance[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLIANCES, JSON.stringify(appliances));
    } catch (e) {
      console.error('Failed to save appliances to localStorage', e);
    }
  },

  getTariff(): TariffConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TARIFF);
      return data ? JSON.parse(data) : DEFAULT_TARIFF;
    } catch {
      return DEFAULT_TARIFF;
    }
  },

  saveTariff(tariff: TariffConfig) {
    try {
      localStorage.setItem(STORAGE_KEYS.TARIFF, JSON.stringify(tariff));
    } catch (e) {
      console.error('Failed to save tariff to localStorage', e);
    }
  },

  getHomeProfile(): HomeProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HOME_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_HOME_PROFILE;
    } catch {
      return DEFAULT_HOME_PROFILE;
    }
  },

  saveHomeProfile(profile: HomeProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.HOME_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save home profile to localStorage', e);
    }
  },

  getHistory(): HistorySnapshot[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : DEFAULT_HISTORY;
    } catch {
      return DEFAULT_HISTORY;
    }
  },

  saveHistory(history: HistorySnapshot[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  },

  resetToDemo(): {
    appliances: Appliance[];
    tariff: TariffConfig;
    homeProfile: HomeProfile;
    history: HistorySnapshot[];
  } {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLIANCES, JSON.stringify(DEFAULT_APPLIANCES));
      localStorage.setItem(STORAGE_KEYS.TARIFF, JSON.stringify(DEFAULT_TARIFF));
      localStorage.setItem(STORAGE_KEYS.HOME_PROFILE, JSON.stringify(DEFAULT_HOME_PROFILE));
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(DEFAULT_HISTORY));
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

  clearAllData(): {
    appliances: Appliance[];
    tariff: TariffConfig;
    homeProfile: HomeProfile;
    history: HistorySnapshot[];
  } {
    const emptyAppliances: Appliance[] = [];
    try {
      localStorage.setItem(STORAGE_KEYS.APPLIANCES, JSON.stringify(emptyAppliances));
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
