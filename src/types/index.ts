export type ApplianceCategory = 
  | 'Cooling'
  | 'Heating'
  | 'Kitchen'
  | 'Entertainment'
  | 'Lighting'
  | 'Computing'
  | 'Utility'
  | 'Other';

export interface Appliance {
  id: string;
  name: string;
  category: ApplianceCategory;
  quantity: number;
  powerWatts: number;
  hoursPerDay: number;
  daysPerMonth: number;
  notes?: string;
  isPreset?: boolean;
}

export interface ApplianceWithCalculations extends Appliance {
  dailyKwh: number;
  monthlyKwh: number;
  estimatedCost: number;
  percentageOfTotal: number;
}

export interface TariffSlab {
  id: string;
  minUnits: number;
  maxUnits: number | null; // null means unbounded (e.g., 301+)
  ratePerKwh: number;
}

export interface TariffConfig {
  mode: 'flat' | 'slab';
  flatRate: number; // ₹ per kWh
  currency: string; // e.g. '₹', '$', '€'
  fixedMonthlyCharge: number; // e.g. ₹50
  taxPercent: number; // e.g. 5%
  providerName: string;
  slabs: TariffSlab[];
}

export type HomeType = 
  | 'Apartment'
  | 'Independent House'
  | 'Hostel/PG'
  | 'Small Office'
  | 'Other';

export interface HomeProfile {
  homeType: HomeType;
  occupants: number;
  provider: string;
  targetMonthlyBudget: number; // in currency
}

export interface BillSummary {
  totalMonthlyKwh: number;
  totalDailyKwh: number;
  energyCost: number;
  fixedCharges: number;
  taxes: number;
  totalEstimatedBill: number;
  targetBudget: number;
  budgetDelta: number;
  isOverBudget: boolean;
  topConsumer: ApplianceWithCalculations | null;
  energyScore: number;
  potentialSavingsMonthly: number;
  applianceCount: number;
}

export interface EnergyInsight {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  applianceName: string;
  title: string;
  description: string;
  potentialMonthlySavingKwh: number;
  potentialMonthlySavingCost: number;
  actionHint: string;
}

export interface HistorySnapshot {
  id: string;
  label: string; // e.g. "September 2026"
  date: string;
  totalKwh: number;
  estimatedBill: number;
  applianceCount: number;
  note?: string;
}

export interface SimulationAdjustment {
  applianceId: string;
  newHoursPerDay: number;
  newDaysPerMonth: number;
}
