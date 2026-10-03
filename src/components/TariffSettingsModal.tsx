import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Plus, 
  Trash2, 
  Check, 
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { TariffConfig, TariffSlab } from '../types';
import { DEFAULT_TARIFF } from '../data/defaultData';

interface TariffSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariff: TariffConfig;
  onSaveTariff: (tariff: TariffConfig) => void;
}

export const TariffSettingsModal: React.FC<TariffSettingsModalProps> = ({
  isOpen,
  onClose,
  tariff,
  onSaveTariff,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'flat' | 'slab'>(tariff.mode);
  const [flatRate, setFlatRate] = useState<number>(tariff.flatRate);
  const [currency, setCurrency] = useState<string>(tariff.currency);
  const [fixedMonthlyCharge, setFixedMonthlyCharge] = useState<number>(tariff.fixedMonthlyCharge);
  const [taxPercent, setTaxPercent] = useState<number>(tariff.taxPercent);
  const [providerName, setProviderName] = useState<string>(tariff.providerName);
  const [slabs, setSlabs] = useState<TariffSlab[]>(tariff.slabs || DEFAULT_TARIFF.slabs);

  const handleAddSlab = () => {
    const lastSlab = slabs[slabs.length - 1];
    const newMin = lastSlab ? (lastSlab.maxUnits !== null ? lastSlab.maxUnits + 1 : lastSlab.minUnits + 100) : 0;
    const newSlab: TariffSlab = {
      id: `slab-${Date.now()}`,
      minUnits: newMin,
      maxUnits: newMin + 150,
      ratePerKwh: lastSlab ? lastSlab.ratePerKwh + 2 : 6,
    };
    setSlabs([...slabs, newSlab]);
  };

  const handleUpdateSlab = (index: number, field: keyof TariffSlab, value: any) => {
    const updated = [...slabs];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setSlabs(updated);
  };

  const handleRemoveSlab = (index: number) => {
    if (slabs.length <= 1) return;
    setSlabs(slabs.filter((_, i) => i !== index));
  };

  const handleResetToDefault = () => {
    setMode(DEFAULT_TARIFF.mode);
    setFlatRate(DEFAULT_TARIFF.flatRate);
    setCurrency(DEFAULT_TARIFF.currency);
    setFixedMonthlyCharge(DEFAULT_TARIFF.fixedMonthlyCharge);
    setTaxPercent(DEFAULT_TARIFF.taxPercent);
    setProviderName(DEFAULT_TARIFF.providerName);
    setSlabs(DEFAULT_TARIFF.slabs);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTariff({
      mode,
      flatRate: Number(flatRate) || 7.5,
      currency,
      fixedMonthlyCharge: Number(fixedMonthlyCharge) || 0,
      taxPercent: Number(taxPercent) || 0,
      providerName: providerName.trim() || 'Residential Grid',
      slabs,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100">
              <Settings className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Electricity Tariff & Slabs
              </h3>
              <p className="text-xs text-slate-500">
                Configure rates, progressive tiers, fixed meter rent & taxes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* Tariff Mode Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Billing Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('flat')}
                  className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    mode === 'flat'
                      ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="block font-bold">Flat Rate per kWh</span>
                  <span className="text-[11px] font-normal text-slate-500">Simple uniform rate for all units</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('slab')}
                  className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    mode === 'slab'
                      ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="block font-bold">Progressive Slab Tiers</span>
                  <span className="text-[11px] font-normal text-slate-500">Rate increases as usage steps up</span>
                </button>
              </div>
            </div>

            {/* Currency Symbol and Provider Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Currency Symbol
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-cyan-500"
                >
                  <option value="₹">₹ (INR - Indian Rupee)</option>
                  <option value="$">$ (USD - Dollar)</option>
                  <option value="€">€ (EUR - Euro)</option>
                  <option value="£">£ (GBP - Pound)</option>
                  <option value="AED">AED (Dirham)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Provider / Utility Name
                </label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="e.g. Tata Power / Grid"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Flat Rate Setup */}
            {mode === 'flat' ? (
              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Flat Electricity Tariff ({currency} / kWh)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">
                    {currency}
                  </span>
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    value={flatRate}
                    onChange={(e) => setFlatRate(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 text-sm font-mono font-bold bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-cyan-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Every 1 kWh (1 unit) consumed is calculated at this fixed rate.
                </p>
              </div>
            ) : (
              /* Slab Setup */
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Tiered Slabs ({currency} / unit)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSlab}
                    className="text-[11px] font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Tier</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {slabs.map((slab, idx) => (
                    <div key={slab.id || idx} className="flex items-center gap-2 text-xs">
                      <div className="w-16">
                        <span className="text-[10px] text-slate-400 block">From</span>
                        <input
                          type="number"
                          value={slab.minUnits}
                          onChange={(e) => handleUpdateSlab(idx, 'minUnits', Number(e.target.value))}
                          className="w-full px-2 py-1 font-mono bg-white border border-slate-200 rounded-lg text-center"
                        />
                      </div>
                      <span className="text-slate-400 mt-3">—</span>
                      <div className="w-20">
                        <span className="text-[10px] text-slate-400 block">To</span>
                        <input
                          type="text"
                          value={slab.maxUnits === null ? 'Max' : slab.maxUnits}
                          onChange={(e) => {
                            const val = e.target.value.toLowerCase() === 'max' ? null : Number(e.target.value);
                            handleUpdateSlab(idx, 'maxUnits', val);
                          }}
                          placeholder="Max"
                          className="w-full px-2 py-1 font-mono bg-white border border-slate-200 rounded-lg text-center"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-400 block">Rate ({currency})</span>
                        <input
                          type="number"
                          step="0.1"
                          value={slab.ratePerKwh}
                          onChange={(e) => handleUpdateSlab(idx, 'ratePerKwh', Number(e.target.value))}
                          className="w-full px-2 py-1 font-mono font-bold bg-white border border-slate-200 rounded-lg text-right"
                        />
                      </div>
                      {slabs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlab(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 mt-3"
                          title="Remove tier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fixed Charges & Taxes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Fixed Meter Charge ({currency}/mo)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={fixedMonthlyCharge}
                  onChange={(e) => setFixedMonthlyCharge(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono font-semibold bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Electricity Duty & Tax (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono font-semibold bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Tariff</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
