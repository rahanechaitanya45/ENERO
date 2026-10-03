import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ArrowRight, 
  TrendingDown, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Zap, 
  Info,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Appliance, ApplianceWithCalculations, TariffConfig } from '../types';
import { simulateUsageAdjustment } from '../services/calculationService';

interface SavingsSimulatorProps {
  appliances: Appliance[];
  rankedAppliances: ApplianceWithCalculations[];
  tariff: TariffConfig;
  preselectedApplianceId?: string | null;
  onApplyScenarioToLive: (adjustedHours: Record<string, number>) => void;
  onSaveScenarioToHistory: (label: string, kwh: number, bill: number) => void;
}

export const SavingsSimulator: React.FC<SavingsSimulatorProps> = ({
  appliances,
  rankedAppliances,
  tariff,
  preselectedApplianceId,
  onApplyScenarioToLive,
  onSaveScenarioToHistory,
}) => {
  // Map of applianceId -> { hoursPerDay: number }
  const [adjustments, setAdjustments] = useState<Record<string, { hoursPerDay: number }>>({});
  const [selectedApplianceId, setSelectedApplianceId] = useState<string>('');
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string>('');

  // Initialize or handle preselection
  useEffect(() => {
    if (appliances.length > 0) {
      const defaultId = preselectedApplianceId && appliances.some(a => a.id === preselectedApplianceId)
        ? preselectedApplianceId
        : appliances[0].id;
      setSelectedApplianceId(defaultId);
    }
  }, [preselectedApplianceId, appliances]);

  const currentAppliance = appliances.find((a) => a.id === selectedApplianceId);
  const currentAdjustment = currentAppliance 
    ? (adjustments[currentAppliance.id]?.hoursPerDay ?? currentAppliance.hoursPerDay)
    : 0;

  // Run simulation calculation
  const simulation = simulateUsageAdjustment(appliances, adjustments, tariff);

  const handleHourSliderChange = (applianceId: string, hours: number) => {
    setAdjustments((prev) => ({
      ...prev,
      [applianceId]: { hoursPerDay: hours },
    }));
  };

  const handleResetSimulation = () => {
    setAdjustments({});
    setSavedSuccessMessage('');
  };

  const handleQuickPreset = (presetType: 'ac_minus_1' | 'fans_minus_2' | 'geyser_half' | 'eco_all') => {
    const newAdj: Record<string, { hoursPerDay: number }> = { ...adjustments };

    if (presetType === 'ac_minus_1') {
      appliances.filter(a => a.category === 'Cooling' && a.name.toLowerCase().includes('ac')).forEach(a => {
        newAdj[a.id] = { hoursPerDay: Math.max(0, a.hoursPerDay - 1) };
      });
    } else if (presetType === 'fans_minus_2') {
      appliances.filter(a => a.name.toLowerCase().includes('fan')).forEach(a => {
        newAdj[a.id] = { hoursPerDay: Math.max(0, a.hoursPerDay - 2) };
      });
    } else if (presetType === 'geyser_half') {
      appliances.filter(a => a.category === 'Heating' || a.name.toLowerCase().includes('geyser')).forEach(a => {
        newAdj[a.id] = { hoursPerDay: Math.max(0.25, a.hoursPerDay * 0.5) };
      });
    } else if (presetType === 'eco_all') {
      appliances.forEach(a => {
        if (a.hoursPerDay > 2) {
          newAdj[a.id] = { hoursPerDay: Math.round((a.hoursPerDay * 0.8) * 10) / 10 };
        }
      });
    }

    setAdjustments(newAdj);
  };

  const handleApplyToLive = () => {
    const hoursMap: Record<string, number> = {};
    Object.entries(adjustments).forEach(([id, adj]) => {
      hoursMap[id] = adj.hoursPerDay;
    });
    onApplyScenarioToLive(hoursMap);
    
    // Confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}

    setSavedSuccessMessage('Simulated usage applied to your live appliances successfully!');
    setTimeout(() => setSavedSuccessMessage(''), 4000);
  };

  const handleSaveToHistory = () => {
    const label = `Simulated Optimization (${simulation.kwhSaved} kWh saved)`;
    onSaveScenarioToHistory(label, simulation.simulatedKwh, simulation.simulatedBill);
    setSavedSuccessMessage('Scenario saved to your Energy History snapshots!');
    setTimeout(() => setSavedSuccessMessage(''), 4000);
  };

  if (appliances.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
        <h3 className="text-lg font-bold text-slate-900">No Appliances Available for Simulation</h3>
        <p className="text-xs text-slate-500">
          Please add appliances to your home setup to test What-If usage scenarios.
        </p>
      </div>
    );
  }

  // Active appliance individual calculation
  const originalApplianceKwh = currentAppliance 
    ? (currentAppliance.powerWatts * currentAppliance.quantity * currentAppliance.hoursPerDay * currentAppliance.daysPerMonth) / 1000
    : 0;
  const simulatedApplianceKwh = currentAppliance
    ? (currentAppliance.powerWatts * currentAppliance.quantity * currentAdjustment * currentAppliance.daysPerMonth) / 1000
    : 0;
  const applianceKwhDiff = Math.max(0, originalApplianceKwh - simulatedApplianceKwh);
  const applianceCostDiff = Math.round(applianceKwhDiff * tariff.flatRate);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200/80 text-cyan-800 text-[11px] font-semibold tracking-wide mb-1">
            <Sparkles className="w-3 h-3 text-cyan-600" />
            <span>INTERACTIVE WHAT-IF LAB</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            What If I Use Less? ⚡
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test different operating schedules and see live before-and-after bill differences
          </p>
        </div>

        {Object.keys(adjustments).length > 0 && (
          <button
            onClick={handleResetSimulation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Simulation</span>
          </button>
        )}
      </div>

      {/* Success Notification */}
      {savedSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{savedSuccessMessage}</span>
        </div>
      )}

      {/* QUICK PRESET BUTTONS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Quick One-Click Scenarios
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickPreset('ac_minus_1')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-cyan-50 hover:text-cyan-800 border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            ❄ 1 Hour Less AC Daily
          </button>
          <button
            onClick={() => handleQuickPreset('fans_minus_2')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-cyan-50 hover:text-cyan-800 border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            🌀 2 Hours Less Fan Runtime
          </button>
          <button
            onClick={() => handleQuickPreset('geyser_half')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-cyan-50 hover:text-cyan-800 border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            🔥 30-Min Shorter Geyser Cycle
          </button>
          <button
            onClick={() => handleQuickPreset('eco_all')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-cyan-50 hover:text-cyan-800 border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            🌱 20% Whole-Home Trim
          </button>
        </div>
      </div>

      {/* DYNAMIC BEFORE VS AFTER OVERALL COMPARISON (Prompt Section 22) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
              Whole-House Comparison
            </span>
            <h3 className="text-xl font-bold text-white">Your Potential Improvement</h3>
          </div>
          <span className="text-xs text-slate-400 italic">
            *Scenario simulation estimate. Actual provider slabs may vary.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* CURRENT */}
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Current Baseline
            </span>
            <div>
              <span className="text-xs text-slate-400 block">Monthly Consumption</span>
              <span className="text-2xl font-black font-mono text-white">
                {simulation.originalKwh} <span className="text-xs font-sans text-slate-400 font-normal">kWh</span>
              </span>
            </div>
            <div className="pt-1 border-t border-slate-700/60">
              <span className="text-xs text-slate-400 block">Estimated Bill</span>
              <span className="text-2xl font-black font-mono text-slate-300">
                {tariff.currency}{simulation.originalBill.toLocaleString()}
              </span>
            </div>
          </div>

          {/* SIMULATED */}
          <div className="p-5 rounded-2xl bg-cyan-950/60 border border-cyan-800/60 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
              After Simulation
            </span>
            <div>
              <span className="text-xs text-cyan-200/70 block">Simulated Consumption</span>
              <span className="text-2xl font-black font-mono text-white">
                {simulation.simulatedKwh} <span className="text-xs font-sans text-cyan-200/70 font-normal">kWh</span>
              </span>
            </div>
            <div className="pt-1 border-t border-cyan-900/60">
              <span className="text-xs text-cyan-200/70 block">Simulated Bill</span>
              <span className="text-2xl font-black font-mono text-cyan-400">
                {tariff.currency}{simulation.simulatedBill.toLocaleString()}
              </span>
            </div>
          </div>

          {/* POTENTIAL DIFFERENCE */}
          <div className="p-5 rounded-2xl bg-emerald-950/70 border border-emerald-700/60 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
              Potential Difference
            </span>
            <div>
              <span className="text-xs text-emerald-300/70 block">Monthly Energy Saved</span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                -{simulation.kwhSaved} <span className="text-xs font-sans text-emerald-300/70 font-normal">kWh</span>
              </span>
            </div>
            <div className="pt-1 border-t border-emerald-900/60">
              <span className="text-xs text-emerald-300/70 block">Estimated Cost Saved</span>
              <span className="text-2xl font-black font-mono text-white">
                {tariff.currency}{simulation.costSaved.toLocaleString()} <span className="text-xs font-sans text-emerald-400 font-normal">/month</span>
              </span>
              <div className="text-[11px] text-emerald-300/80 font-mono mt-0.5">
                (~{tariff.currency}{simulation.annualizedSaved.toLocaleString()} / year)
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Highlight Callout (Prompt Section 19 & 37) */}
        {simulation.kwhSaved > 0 && (
          <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="leading-relaxed">
              <strong className="text-cyan-400">ENERO Scenario:</strong> You could reduce your estimated consumption by approximately <span className="font-mono font-bold text-white">{simulation.kwhSaved} kWh/month</span> under this scenario.
            </p>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSaveToHistory}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-700/80 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Save as Snapshot
              </button>
              <button
                onClick={handleApplyToLive}
                className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Apply to Live Profile
              </button>
            </div>
          </div>
        )}

      </div>

      {/* APPLIANCE SLIDER WORKBENCH (Prompt Section 19) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Adjust Individual Appliance Usage
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an appliance below and drag the slider to simulate fewer daily hours
            </p>
          </div>

          {/* Appliance Selector Dropdown */}
          <div className="w-full sm:w-72">
            <select
              value={selectedApplianceId}
              onChange={(e) => setSelectedApplianceId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-cyan-500"
            >
              {appliances.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name} ({app.quantity}x {app.powerWatts}W)
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentAppliance && (
          <div className="space-y-6">
            
            {/* Active appliance card header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900">{currentAppliance.name}</h4>
                <p className="text-xs text-slate-500">
                  {currentAppliance.quantity} unit(s) · {currentAppliance.powerWatts} Watts · Category: {currentAppliance.category}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Baseline</span>
                  <span className="font-bold text-slate-800">{currentAppliance.hoursPerDay} hrs/day</span>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-[10px] text-cyan-700 uppercase font-bold block">Simulated</span>
                  <span className="font-bold text-cyan-900">{currentAdjustment} hrs/day</span>
                </div>
              </div>
            </div>

            {/* Interactive Slider */}
            <div className="space-y-3 p-5 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700">Daily Operating Time</span>
                <span className="text-sm font-mono font-bold text-cyan-700">
                  {currentAdjustment} hours / day
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="24"
                step="0.5"
                value={currentAdjustment}
                onChange={(e) => handleHourSliderChange(currentAppliance.id, Number(e.target.value))}
                className="w-full accent-cyan-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0 hrs (Off)</span>
                <span>6 hrs</span>
                <span>12 hrs</span>
                <span>18 hrs</span>
                <span>24 hrs (Continuous)</span>
              </div>
            </div>

            {/* Appliance-Level Before → After Callout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-400 block mb-0.5">Current Usage</span>
                <span className="text-lg font-bold font-mono text-slate-800">
                  {Math.round(originalApplianceKwh * 10) / 10} kWh
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  ~{tariff.currency}{Math.round(originalApplianceKwh * tariff.flatRate)}/mo
                </span>
              </div>

              <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-100 text-xs">
                <span className="text-cyan-800 font-semibold block mb-0.5">Simulated Usage</span>
                <span className="text-lg font-bold font-mono text-cyan-950">
                  {Math.round(simulatedApplianceKwh * 10) / 10} kWh
                </span>
                <span className="text-[11px] text-cyan-800 block mt-0.5">
                  ~{tariff.currency}{Math.round(simulatedApplianceKwh * tariff.flatRate)}/mo
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-xs">
                <span className="text-emerald-800 font-semibold block mb-0.5">Net Appliance Difference</span>
                <span className="text-lg font-bold font-mono text-emerald-900">
                  {Math.round(applianceKwhDiff * 10) / 10} kWh
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                  Save ~{tariff.currency}{applianceCostDiff}/mo
                </span>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
