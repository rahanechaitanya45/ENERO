import React from 'react';
import { 
  Zap, 
  TrendingDown, 
  ArrowRight, 
  Sliders, 
  Flame, 
  Snowflake, 
  Tv, 
  Utensils, 
  Lightbulb, 
  Laptop, 
  Layers,
  BarChart2
} from 'lucide-react';
import { ApplianceWithCalculations, TariffConfig } from '../types';
import { CATEGORY_COLORS } from '../data/presetAppliances';

interface ApplianceAnalysisProps {
  rankedAppliances: ApplianceWithCalculations[];
  tariff: TariffConfig;
  totalMonthlyKwh: number;
  onSimulateAppliance: (applianceId: string) => void;
}

export const ApplianceAnalysis: React.FC<ApplianceAnalysisProps> = ({
  rankedAppliances,
  tariff,
  totalMonthlyKwh,
  onSimulateAppliance,
}) => {
  const topConsumer = rankedAppliances.length > 0 ? rankedAppliances[0] : null;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Your Biggest Energy Consumers
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Appliances ranked by monthly consumption to identify where electricity is concentrated
        </p>
      </div>

      {/* Top Consumer Callout Banner (Prompt Section 17) */}
      {topConsumer && (
        <div className="bg-gradient-to-r from-cyan-900 to-slate-900 text-white rounded-2xl p-6 border border-cyan-800/50 shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Primary Energy Drain Identified
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                ENERO Insight: Your {topConsumer.name} is currently your largest estimated energy consumer.
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Accounting for <strong className="text-white font-mono">{topConsumer.percentageOfTotal}%</strong> of your total household electricity ({topConsumer.monthlyKwh} kWh / month, ~{tariff.currency}{Math.round(topConsumer.estimatedCost)}). Targeting usage habits on this appliance yields the fastest return.
              </p>
            </div>

            <button
              onClick={() => onSimulateAppliance(topConsumer.id)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-400/20 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Simulate Reducing {topConsumer.name}</span>
            </button>
          </div>
        </div>
      )}

      {/* Ranked Consumers List (Prompt Section 17) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Rank & Appliance Name
          </span>
          <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="w-24 text-right">Consumption</span>
            <span className="w-20 text-right">Share</span>
            <span className="w-24 text-right">Est. Cost</span>
            <span className="w-24 text-right hidden sm:block">Action</span>
          </div>
        </div>

        {rankedAppliances.length === 0 ? (
          <p className="text-center py-10 text-xs text-slate-500">
            No appliances entered to rank. Please add your appliances first.
          </p>
        ) : (
          <div className="space-y-3">
            {rankedAppliances.map((app, index) => {
              const rankFormatted = (index + 1).toString().padStart(2, '0');
              const isFirst = index === 0;

              return (
                <div
                  key={app.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isFirst 
                      ? 'bg-cyan-50/40 border-cyan-200/90' 
                      : 'bg-white border-slate-200/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Left: Rank + Name + Specs */}
                    <div className="flex items-center gap-3">
                      <span className={`text-base font-black font-mono ${isFirst ? 'text-cyan-600' : 'text-slate-400'}`}>
                        {rankFormatted}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{app.name}</h4>
                          <span className="text-[11px] text-slate-500 font-medium">({app.category})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {app.quantity} {app.quantity > 1 ? 'units' : 'unit'} · {app.powerWatts}W · {app.hoursPerDay} hrs/day
                        </div>
                      </div>
                    </div>

                    {/* Right: Metrics + Action button */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="w-24 text-left sm:text-right">
                        <span className="text-xs font-mono font-bold text-slate-900 block">
                          {app.monthlyKwh} <span className="text-[10px] font-sans font-normal text-slate-500">kWh</span>
                        </span>
                        <span className="text-[10px] text-slate-400">monthly</span>
                      </div>

                      <div className="w-20 text-left sm:text-right">
                        <span className="text-xs font-mono font-bold text-slate-900 block">
                          {app.percentageOfTotal}%
                        </span>
                        <span className="text-[10px] text-slate-400">of bill</span>
                      </div>

                      <div className="w-24 text-left sm:text-right">
                        <span className="text-xs font-mono font-bold text-cyan-800 block">
                          {tariff.currency}{Math.round(app.estimatedCost).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">/month</span>
                      </div>

                      <div className="w-24 text-right">
                        <button
                          onClick={() => onSimulateAppliance(app.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 rounded-lg transition-colors cursor-pointer"
                        >
                          Simulate
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Horizontal Load bar */}
                  <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFirst ? 'bg-cyan-600' : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(3, app.percentageOfTotal))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
