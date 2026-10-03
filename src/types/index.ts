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

export type SubscriptionPlan = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'expired' | 'pending';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'Successful' | 'Failed';

export interface UserSubscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  amount: number; // 599 for premium, 0 for free
  currency: string; // 'INR'
  paymentId?: string;
  orderId?: string;
  startedAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  pendingPaymentId?: string;
}

export interface PaymentRecord {
  id: string; // payment_id
  payment_id?: string;
  userId: string; // user_id
  user_id?: string;
  userEmail?: string;
  plan: 'premium' | string;
  amount: number; // 599
  currency: string; // 'INR'
  paymentMethod: string; // 'UPI_QR' | string
  payment_method?: string;
  utr?: string;
  screenshot_url?: string;
  status: PaymentStatus;
  date: string;
  submitted_at?: string;
  verified_at?: string;
  verified_by?: string;
  subscription_start?: string;
  subscription_end?: string;
  orderId?: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  userId: string; // Firebase UID
  fullName: string;
  email: string;
  homeType: HomeType;
  occupants: number;
  electricityProvider: string;
  tariffRate: number;
  monthlyBudget: number;
  hasCompletedOnboarding: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}


