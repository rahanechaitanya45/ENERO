import React, { useState } from 'react';
import { 
  Zap, 
  ArrowRight, 
  ArrowLeft, 
  Home, 
  Users, 
  Settings, 
  Layers, 
  Check, 
  Sparkles,
  Building2,
  Briefcase
} from 'lucide-react';
import { HomeType, TariffConfig, Appliance } from '../../types';
import { DEFAULT_APPLIANCES } from '../../data/defaultData';
import { useAuth } from '../../contexts/AuthContext';

interface UserOnboardingWizardProps {
  userName: string;
  tariff: TariffConfig;
  onSaveProfileAndTariff: (homeType: HomeType, occupants: number, provider: string, tariffRate: number, budget: number) => void;
  onAddInitialAppliances: (appliances: Appliance[]) => void;
  onComplete: () => void;
}

export const UserOnboardingWizard: React.FC<UserOnboardingWizardProps> = ({
  userName,
  tariff,
  onSaveProfileAndTariff,
  onAddInitialAppliances,
  onComplete,
}) => {
  const { updateProfile } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 2 Home
  const [homeType, setHomeType] = useState<HomeType>('Apartment');
  const [occupants, setOccupants] = useState<number>(3);
  const [provider, setProvider] = useState<string>('Tata Power / Regional Grid');

  // Step 3 Electricity
  const [tariffRate, setTariffRate] = useState<number>(tariff.flatRate || 7.5);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(2500);

  // Step 4 Appliances template
  const [selectedPack, setSelectedPack] = useState<'standard' | 'bachelor' | 'blank'>('standard');

  const homeTypeChoices: { type: HomeType; label: string; icon: string }[] = [
    { type: 'Apartment', label: 'Apartment / Flat', icon: '🏢' },
    { type: 'Independent House', label: 'Independent House / Villa', icon: '🏡' },
    { type: 'Hostel/PG', label: 'Hostel / Shared PG', icon: '🛏️' },
    { type: 'Small Office', label: 'Small Office / Workspace', icon: '💼' },
    { type: 'Other', label: 'Other Residence', icon: '🏠' },
  ];

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      // Finalize and save
      onSaveProfileAndTariff(homeType, occupants, provider, Number(tariffRate) || 7.5, Number(monthlyBudget) || 2500);

      await updateProfile({
        homeType,
        occupants,
        electricityProvider: provider,
        tariffRate: Number(tariffRate) || 7.5,
        monthlyBudget: Number(monthlyBudget) || 2500,
        hasCompletedOnboarding: true,
      });

      if (selectedPack === 'standard') {
        onAddInitialAppliances(DEFAULT_APPLIANCES);
      } else if (selectedPack === 'bachelor') {
        onAddInitialAppliances(DEFAULT_APPLIANCES.filter(a => a.category !== 'Cooling' && a.category !== 'Heating'));
      } else {
        onAddInitialAppliances([]);
      }

      onComplete();
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Zap className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold block">
                ENERO Onboarding
              </span>
              <span className="text-xs text-slate-400">Step {step} of 4</span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {Math.round((step / 4) * 100)}%
          </span>
        </div>

        {/* Step Progress Line */}
        <div className="w-full bg-slate-100 h-1">
          <div 
            className="bg-cyan-500 h-1 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Wizard Steps */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="text-center space-y-4 py-4 animate-in fade-in duration-150">
              <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto text-3xl">
                👋
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome to ENERO, {userName || 'Friend'}!
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Let's understand your energy usage in a few simple steps. We'll set up your home profile and typical appliances to calculate your first electricity estimate.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md shadow-slate-900/10 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Let's Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: HOME */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 block mb-1">Step 2: Home</span>
                <h3 className="text-xl font-bold text-slate-900">Tell us about your home</h3>
                <p className="text-xs text-slate-500">Helps us benchmark typical power consumption for your household size</p>
              </div>

              {/* Home Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Home Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {homeTypeChoices.map((ht) => (
                    <button
                      key={ht.type}
                      type="button"
                      onClick={() => setHomeType(ht.type)}
                      className={`p-3 text-left rounded-xl border text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                        homeType === ht.type
                          ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950 font-bold shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-lg">{ht.icon}</span>
                      <span className="truncate">{ht.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Occupants */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Number of People Living Here
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setOccupants(num)}
                      className={`flex-1 py-2 text-center rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                        occupants === num
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {num === 5 ? '5+' : num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Electricity Utility Provider
                </label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="e.g. Tata Power, Adani, BESCOM, MSEDCL"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: ELECTRICITY & BUDGET */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 block mb-1">Step 3: Electricity & Budget</span>
                <h3 className="text-xl font-bold text-slate-900">Set your tariff and target budget</h3>
                <p className="text-xs text-slate-500">You can adjust this anytime in your settings</p>
              </div>

              {/* Tariff Rate */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Electricity Rate ({tariff.currency} per kWh / unit)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">
                    {tariff.currency}
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="50"
                    value={tariffRate}
                    onChange={(e) => setTariffRate(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 text-sm font-mono font-bold bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-cyan-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Residential power tariffs in India and urban grids typically range between ₹6.50 – ₹9.00 per unit.
                </p>
              </div>

              {/* Monthly Budget */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Monthly Target Electricity Budget ({tariff.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">
                    {tariff.currency}
                  </span>
                  <input
                    type="number"
                    step="100"
                    min="200"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 text-sm font-mono font-bold bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-cyan-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  ENERO notifies you if your active consumption model exceeds this budget.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: APPLIANCES */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 block mb-1">Step 4: Appliances</span>
                <h3 className="text-xl font-bold text-slate-900">Choose your starting inventory</h3>
                <p className="text-xs text-slate-500">You can customize, add, or delete appliances anytime on the dashboard</p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setSelectedPack('standard')}
                  className={`w-full p-4 text-left rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    selectedPack === 'standard'
                      ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border border-cyan-600 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                    {selectedPack === 'standard' && <div className="w-2.5 h-2.5 rounded-full bg-cyan-600" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Recommended Standard Home (5 Appliances)</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Includes Split AC (1500W), 3 Ceiling Fans (75W), Frost-Free Refrigerator (200W), Smart TV (120W), and Water Heater Geyser (2000W).
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPack('bachelor')}
                  className={`w-full p-4 text-left rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    selectedPack === 'bachelor'
                      ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border border-cyan-600 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                    {selectedPack === 'bachelor' && <div className="w-2.5 h-2.5 rounded-full bg-cyan-600" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Essentials / Compact Pack (3 Appliances)</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Ceiling Fans, Refrigerator, and TV (No heavy AC or Geyser load).
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPack('blank')}
                  className={`w-full p-4 text-left rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    selectedPack === 'blank'
                      ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border border-cyan-600 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                    {selectedPack === 'blank' && <div className="w-2.5 h-2.5 rounded-full bg-cyan-600" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Start from Scratch (Blank)</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Add appliances manually one-by-one from the dashboard.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span>{step === 4 ? 'Calculate My Energy ⚡' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
