import { Appliance, TariffConfig, HomeProfile, HistorySnapshot } from '../types';

export const DEFAULT_APPLIANCES: Appliance[] = [
  {
    id: 'demo-ac-1',
    name: 'Air Conditioner',
    category: 'Cooling',
    quantity: 1,
    powerWatts: 1500,
    hoursPerDay: 6,
    daysPerMonth: 30,
    notes: 'Living room split AC',
    isPreset: true,
  },
  {
    id: 'demo-fan-1',
    name: 'Ceiling Fans',
    category: 'Cooling',
    quantity: 3,
    powerWatts: 75,
    hoursPerDay: 10,
    daysPerMonth: 30,
    notes: 'Bedrooms and living room',
    isPreset: true,
  },
  {
    id: 'demo-fridge-1',
    name: 'Refrigerator',
    category: 'Kitchen',
    quantity: 1,
    powerWatts: 200,
    hoursPerDay: 12,
    daysPerMonth: 30,
    notes: 'Double door frost-free (active cycle)',
    isPreset: true,
  },
  {
    id: 'demo-tv-1',
    name: 'Television',
    category: 'Entertainment',
    quantity: 1,
    powerWatts: 120,
    hoursPerDay: 5,
    daysPerMonth: 30,
    notes: '55" LED TV & set-top box',
    isPreset: true,
  },
  {
    id: 'demo-geyser-1',
    name: 'Geyser',
    category: 'Heating',
    quantity: 1,
    powerWatts: 2000,
    hoursPerDay: 1,
    daysPerMonth: 30,
    notes: 'Bathroom water heater',
    isPreset: true,
  },
];

export const DEFAULT_TARIFF: TariffConfig = {
  mode: 'flat',
  flatRate: 7.5,
  currency: '₹',
  fixedMonthlyCharge: 60,
  taxPercent: 5,
  providerName: 'Standard Municipal Grid',
  slabs: [
    { id: 'slab-1', minUnits: 0, maxUnits: 100, ratePerKwh: 4.5 },
    { id: 'slab-2', minUnits: 101, maxUnits: 300, ratePerKwh: 7.2 },
    { id: 'slab-3', minUnits: 301, maxUnits: null, ratePerKwh: 9.6 },
  ],
};

export const DEFAULT_HOME_PROFILE: HomeProfile = {
  homeType: 'Apartment',
  occupants: 3,
  provider: 'Tata Power / Generic Utility',
  targetMonthlyBudget: 2500,
};

export const DEFAULT_HISTORY: HistorySnapshot[] = [
  {
    id: 'hist-july',
    label: 'July',
    date: '2026-07-31',
    totalKwh: 371,
    estimatedBill: 2790,
    applianceCount: 5,
    note: 'Peak monsoon humidity AC load',
  },
  {
    id: 'hist-august',
    label: 'August',
    date: '2026-08-31',
    totalKwh: 349,
    estimatedBill: 2620,
    applianceCount: 5,
    note: 'Reduced fan speeds in evening',
  },
  {
    id: 'hist-september',
    label: 'September',
    date: '2026-09-30',
    totalKwh: 326,
    estimatedBill: 2450,
    applianceCount: 5,
    note: 'Baseline estimation with 6h AC',
  },
];
