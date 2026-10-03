import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  Zap, 
  DollarSign, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Sparkles,
  Layers
} from 'lucide-react';
import { HomeProfile, HomeType, TariffConfig, Appliance } from '../types';
import { DEFAULT_APPLIANCES } from '../data/defaultData';

interface HomeSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  homeProfile: HomeProfile;
  onSaveHomeProfile: (profile: HomeProfile) => void;
  tariff: TariffConfig;
  onSaveTariff: (tariff: TariffConfig) => void;
  onPopulateStarterAppliances: (appliances: Appliance[]) => void;
  onFinish: () => void;
}

export const HomeSetupWizard: React.FC<HomeSetupWizardProps> = ({
  isOpen,
  onClose,
  homeProfile,
  onSaveHomeProfile,
  tariff,
  onSaveTariff,
  onPopulateStarterAppliances,
  onFinish,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Local state for Step 1
  const [homeType, setHomeType] = useState<HomeType>(homeProfile.homeType);
  const [occupants, setOccupants] = useState<number>(homeProfile.occupants);
  const [provider, setProvider] = useState<string>(homeProfile.provider);
  const [targetBudget, setTargetBudget] = useState<number>(homeProfile.targetMonthlyBudget);

  // Local state for Step 2
  const [tariffMode, setTariffMode] = useState<'flat' | 'slab'>(tariff.mode);
  const [flatRate, setFlatRate] = useState<number>(tariff.flatRate);
  const [fixedCharge, setFixedCharge] = useState<number>(tariff.fixedMonthlyCharge);
  const [taxPercent, setTaxPercent] = useState<number>(tariff.taxPercent);

  // Local state for Step 3
  const [starterTemplate, setStarterTemplate] = useState<'sample' | 'custom' | 'minimal'>('sample');

  const homeTypes: { type: HomeType; label: string; icon: string }[] = [
    { type: 'Apartment', label: 'Apartment', icon: '🏢' },
    { type: 'Independent House', label: 'Independent House', icon: '🏡' },
    { type: 'Hostel/PG', label: 'Hostel / PG', icon: '🛏️' },
    { type: 'Small Office', label: 'Small Office', icon: '💼' },
    { type: 'Other', label: 'Other', icon: '🏠' },
  ];

  const popularProviders = [
    'Tata Power',
    'Adani Electricity',
    'MSEDCL (Mahavitaran)',
    'BESCOM (Bangalore)',
    'BSES Yamuna / Rajdhani',
    'UPPCL',
    'TANGEDCO',
    'Torrent Power',
    'Skip / Other Provider',
  ];

  const handleNext = () => {
    if (step === 1) {
      onSaveHomeProfile({
        homeType,
        occupants,
        provider,
        targetMonthlyBudget: Number(targetBudget) || 2500,
      });
      setStep(2);
    } else if (step === 2) {
      onSaveTariff({
        ...tariff,
        mode: tariffMode,
        flatRate: Number(flatRate) || 7.5,
        fixedMonthlyCharge: Number(fixedCharge) || 0,
        taxPercent: Number(taxPercent) || 0,
      });
      setStep(3);
    } else if (step === 3) {
      if (starterTemplate === 'sample') {
        onPopulateStarterAppliances(DEFAULT_APPLIANCES);
      } else if (starterTemplate === 'minimal') {
        // Just fan + light + fridge
        const minimalList = DEFAULT_APPLIANCES.filter(a => a.category !== 'Cooling' && a.category !== 'Heating');
        onPopulateStarterAppliances(minimalList);
      }
      onFinish();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Wizard Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Zap className="w-4 h-4 fill-cyan-400 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Setup Your Energy Profile</h3>
              <p className="text-xs text-slate-400">Step {step} of 3: {step === 1 ? 'Home Information' : step === 2 ? 'Tariff & Rates' : 'Appliance Starter Pack'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div 
            className="bg-cyan-500 h-1 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Wizard Body */}
        <div className="p-6 space-y-6">

          {/* STEP 1: HOME INFORMATION */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Home Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Home Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {homeTypes.map((ht) => (
                    <button
                      key={ht.type}
                      type="button"
                      onClick={() => setHomeType(ht.type)}
                      className={`p-3 text-left rounded-xl border text-sm font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                        homeType === ht.type
                          ? 'border-cyan-600 bg-cyan-50/70 text-cyan-900 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-lg">{ht.icon}</span>
                      <span className="truncate">{ht.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of People */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Number of Occupants
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

              {/* Electricity Provider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Electricity Provider
                  </label>
                  <span className="text-[11px] text-slate-400 font-normal">Optional</span>
                </div>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                >
                  {popularProviders.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Monthly Target Budget */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Target Monthly Electricity Budget ({tariff.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {tariff.currency}
                  </span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-4 py-2 text-sm font-mono font-semibold bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                    placeholder="2500"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  ENERO will notify you if your estimated usage exceeds this target.
                </p>
              </div>

            </div>
          )}

          {/* STEP 2: TARIFF SETUP */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Billing Tariff Structure
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTariffMode('flat')}
                    className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer ${
                      tariffMode === 'flat'
                        ? 'border-cyan-600 bg-cyan-50/70 text-cyan-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-sm">Flat Rate Tariff</div>
                    <div className="text-xs text-slate-500 mt-1">Single rate per unit (e.g. ₹7.50/kWh)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTariffMode('slab')}
                    className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer ${
                      tariffMode === 'slab'
                        ? 'border-cyan-600 bg-cyan-50/70 text-cyan-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-sm">Tiered Slabs</div>
                    <div className="text-xs text-slate-500 mt-1">Slab-based (0–100, 101–300, 301+)</div>
                  </button>
                </div>
              </div>

              {tariffMode === 'flat' ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Flat Electricity Rate ({tariff.currency} per kWh / unit)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      {tariff.currency}
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="50"
                      value={flatRate}
                      onChange={(e) => setFlatRate(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 text-sm font-mono font-semibold bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Typical residential flat averages in India and emerging markets range between ₹6.50 – ₹9.00/kWh.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <span className="font-bold text-slate-800 block">Default Progressive Slabs:</span>
                  <div className="font-mono space-y-1 text-slate-600">
                    <div className="flex justify-between"><span>0 – 100 units:</span> <span className="font-semibold text-slate-900">{tariff.currency}4.50 / kWh</span></div>
                    <div className="flex justify-between"><span>101 – 300 units:</span> <span className="font-semibold text-slate-900">{tariff.currency}7.20 / kWh</span></div>
                    <div className="flex justify-between"><span>301+ units:</span> <span className="font-semibold text-slate-900">{tariff.currency}9.60 / kWh</span></div>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    You can customize slab thresholds and rates anytime in Tariff Settings.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Fixed Charges ({tariff.currency}/mo)
                  </label>
                  <input
                    type="number"
                    value={fixedCharge}
                    onChange={(e) => setFixedCharge(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg"
                    placeholder="60"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Duty / Taxes (%)
                  </label>
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg"
                    placeholder="5"
                  />
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: STARTER APPLIANCES */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">Choose Starter Appliances</h4>
                <p className="text-xs text-slate-600">
                  Select a template to pre-fill realistic values. You can easily add, edit, or remove appliances at any time.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setStarterTemplate('sample')}
                  className={`w-full p-3.5 text-left rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    starterTemplate === 'sample'
                      ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border border-cyan-600 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                    {starterTemplate === 'sample' && <div className="w-2.5 h-2.5 rounded-full bg-cyan-600" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm">Recommended Standard Home (5 appliances)</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Air Conditioner (1500W), 3 Ceiling Fans (75W), Refrigerator (200W), Smart TV (120W), Geyser (2000W).
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStarterTemplate('minimal')}
                  className={`w-full p-3.5 text-left rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    starterTemplate === 'minimal'
                      ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border border-cyan-600 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                    {starterTemplate === 'minimal' && <div className="w-2.5 h-2.5 rounded-full bg-cyan-600" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm">Compact / PG Essentials (3 appliances)</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Ceiling Fans, Refrigerator, Television (No heavy AC or Geyser load).
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStarterTemplate('custom')}
                  className={`w-full p-3.5 text-left rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    starterTemplate === 'custom'
                      ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border border-cyan-600 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                    {starterTemplate === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-cyan-600" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm">Keep Existing / Custom List</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Do not overwrite current appliances in your session.
                    </div>
                  </div>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Wizard Footer Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span>{step === 3 ? 'Complete Setup ⚡' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
