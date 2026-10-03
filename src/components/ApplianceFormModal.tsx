import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  Sparkles, 
  AlertCircle, 
  HelpCircle,
  Clock,
  Layers,
  Check
} from 'lucide-react';
import { Appliance, ApplianceCategory, TariffConfig } from '../types';
import { PRESET_APPLIANCES, CATEGORY_COLORS } from '../data/presetAppliances';
import { getEffectiveRatePerKwh } from '../services/calculationService';

interface ApplianceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appliance: Appliance) => void;
  editingAppliance?: Appliance | null;
  tariff: TariffConfig;
  currentTotalKwh: number;
}

export const ApplianceFormModal: React.FC<ApplianceFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAppliance,
  tariff,
  currentTotalKwh,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ApplianceCategory>('Cooling');
  const [quantity, setQuantity] = useState<number>(1);
  const [powerWatts, setPowerWatts] = useState<number>(1500);
  const [hoursPerDay, setHoursPerDay] = useState<number>(6);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(30);
  const [notes, setNotes] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingAppliance) {
      setName(editingAppliance.name);
      setCategory(editingAppliance.category);
      setQuantity(editingAppliance.quantity);
      setPowerWatts(editingAppliance.powerWatts);
      setHoursPerDay(editingAppliance.hoursPerDay);
      setDaysPerMonth(editingAppliance.daysPerMonth);
      setNotes(editingAppliance.notes || '');
      setSelectedPreset('');
    } else {
      // Default to AC preset or clean default
      const defaultPreset = PRESET_APPLIANCES[0];
      setSelectedPreset(defaultPreset.name);
      setName(defaultPreset.name);
      setCategory(defaultPreset.category);
      setPowerWatts(defaultPreset.defaultWatts);
      setHoursPerDay(defaultPreset.typicalHoursPerDay);
      setDaysPerMonth(defaultPreset.typicalDaysPerMonth);
      setQuantity(1);
      setNotes('');
    }
    setErrors({});
  }, [editingAppliance, isOpen]);

  const handlePresetSelect = (presetName: string) => {
    setSelectedPreset(presetName);
    const found = PRESET_APPLIANCES.find((p) => p.name === presetName);
    if (found) {
      setName(found.name);
      setCategory(found.category);
      setPowerWatts(found.defaultWatts);
      setHoursPerDay(found.typicalHoursPerDay);
      setDaysPerMonth(found.typicalDaysPerMonth);
      setNotes(found.ecoTip || '');
    }
  };

  // Real-time calculated preview
  const liveDailyKwh = (powerWatts * quantity * hoursPerDay) / 1000;
  const liveMonthlyKwh = (powerWatts * quantity * hoursPerDay * daysPerMonth) / 1000;
  const effectiveRate = getEffectiveRatePerKwh(tariff, currentTotalKwh + liveMonthlyKwh);
  const liveEstimatedCost = Math.round(liveMonthlyKwh * effectiveRate);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter an appliance name.';
    }
    if (quantity < 1 || !Number.isInteger(Number(quantity))) {
      newErrors.quantity = 'Quantity must be at least 1 whole unit.';
    }
    if (powerWatts <= 0 || isNaN(powerWatts)) {
      newErrors.powerWatts = 'Power rating must be greater than 0 Watts.';
    }
    if (hoursPerDay < 0 || hoursPerDay > 24 || isNaN(hoursPerDay)) {
      newErrors.hoursPerDay = 'Please enter a valid usage time between 0 and 24 hours per day.';
    }
    if (daysPerMonth < 1 || daysPerMonth > 31 || isNaN(daysPerMonth)) {
      newErrors.daysPerMonth = 'Days per month must be between 1 and 31.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const savedAppliance: Appliance = {
      id: editingAppliance ? editingAppliance.id : `appliance-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      category,
      quantity: Number(quantity),
      powerWatts: Number(powerWatts),
      hoursPerDay: Number(hoursPerDay),
      daysPerMonth: Number(daysPerMonth),
      notes: notes.trim(),
      isPreset: selectedPreset === name,
    };

    onSave(savedAppliance);
    onClose();
  };

  const categories: ApplianceCategory[] = [
    'Cooling',
    'Heating',
    'Kitchen',
    'Entertainment',
    'Lighting',
    'Computing',
    'Utility',
    'Other',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100">
              <Zap className="w-4 h-4 fill-cyan-600 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingAppliance ? 'Edit Appliance' : 'Add New Appliance'}
              </h3>
              <p className="text-xs text-slate-500">
                Enter power rating and daily usage to calculate estimated cost
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

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            
            {/* Quick Preset Selector */}
            {!editingAppliance && (
              <div className="space-y-1.5 pb-2 border-b border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Smart Preset Suggestions</span>
                  <span className="text-[11px] text-cyan-700 font-semibold">Auto-fills typical watts</span>
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                >
                  <option value="">-- Choose from 20+ preset appliances --</option>
                  {PRESET_APPLIANCES.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.defaultWatts}W)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Appliance Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Appliance Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="e.g. Master Bedroom AC"
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 ${
                    errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-cyan-500'
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ApplianceCategory)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity and Power (Watts) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(Number(e.target.value));
                    if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }));
                  }}
                  className={`w-full px-3 py-2 text-sm font-mono bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 ${
                    errors.quantity ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-cyan-500'
                  }`}
                />
                {errors.quantity && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.quantity}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Power Rating (Watts) *
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="5"
                    value={powerWatts}
                    onChange={(e) => {
                      setPowerWatts(Number(e.target.value));
                      if (errors.powerWatts) setErrors((prev) => ({ ...prev, powerWatts: '' }));
                    }}
                    placeholder="1500"
                    className={`w-full px-3 py-2 pr-8 text-sm font-mono font-semibold bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 ${
                      errors.powerWatts ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-cyan-500'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                    W
                  </span>
                </div>
                {errors.powerWatts && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.powerWatts}
                  </p>
                )}
              </div>

            </div>

            {/* Usage: Hours per day & Days per month */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Hours Per Day *
                  </label>
                  <span className="text-[11px] font-mono text-cyan-800 font-semibold">{hoursPerDay} hrs</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.5"
                  value={hoursPerDay}
                  onChange={(e) => {
                    setHoursPerDay(Number(e.target.value));
                    if (errors.hoursPerDay) setErrors((prev) => ({ ...prev, hoursPerDay: '' }));
                  }}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={hoursPerDay}
                  onChange={(e) => {
                    setHoursPerDay(Number(e.target.value));
                    if (errors.hoursPerDay) setErrors((prev) => ({ ...prev, hoursPerDay: '' }));
                  }}
                  className={`w-full px-3 py-1.5 text-xs font-mono bg-white border rounded-lg ${
                    errors.hoursPerDay ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {errors.hoursPerDay && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.hoursPerDay}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Days Per Month *
                  </label>
                  <span className="text-[11px] font-mono text-cyan-800 font-semibold">{daysPerMonth} days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="31"
                  step="1"
                  value={daysPerMonth}
                  onChange={(e) => {
                    setDaysPerMonth(Number(e.target.value));
                    if (errors.daysPerMonth) setErrors((prev) => ({ ...prev, daysPerMonth: '' }));
                  }}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <input
                  type="number"
                  min="1"
                  max="31"
                  step="1"
                  value={daysPerMonth}
                  onChange={(e) => {
                    setDaysPerMonth(Number(e.target.value));
                    if (errors.daysPerMonth) setErrors((prev) => ({ ...prev, daysPerMonth: '' }));
                  }}
                  className={`w-full px-3 py-1.5 text-xs font-mono bg-white border rounded-lg ${
                    errors.daysPerMonth ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {errors.daysPerMonth && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.daysPerMonth}
                  </p>
                )}
              </div>

            </div>

            {/* Optional Notes / Model Details */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Notes / Energy Saver Tip
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Set thermostat at 24°C; 3-star rated"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            {/* LIVE CALCULATION PREVIEW BOX */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 mt-2 shadow-inner">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-cyan-400 uppercase tracking-wider text-[10px]">
                  Estimated Calculation Preview
                </span>
                <span className="font-mono text-[11px]">
                  {powerWatts}W × {quantity} × {hoursPerDay}h × {daysPerMonth}d ÷ 1000
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-slate-400 block">Monthly Consumption</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {Math.round(liveMonthlyKwh * 10) / 10} <span className="text-xs text-slate-400 font-sans">kWh</span>
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Estimated Cost</span>
                  <span className="text-xl font-bold font-mono text-cyan-400">
                    {tariff.currency}{liveEstimatedCost.toLocaleString()} <span className="text-xs text-slate-400 font-sans">/mo</span>
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
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
              <span>{editingAppliance ? 'Save Changes' : 'Add Appliance'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
