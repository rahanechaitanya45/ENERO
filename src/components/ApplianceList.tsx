import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Copy, 
  Zap, 
  Clock, 
  Snowflake, 
  Flame, 
  Tv, 
  Utensils, 
  Lightbulb, 
  Laptop, 
  Wrench, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { ApplianceWithCalculations, ApplianceCategory, TariffConfig, Appliance, UserSubscription } from '../types';
import { CATEGORY_COLORS } from '../data/presetAppliances';
import { Sparkles, ArrowRight } from 'lucide-react';
import { subscriptionService, SUBSCRIPTION_CONFIG } from '../services/subscriptionService';

interface ApplianceListProps {
  appliances: ApplianceWithCalculations[];
  tariff: TariffConfig;
  subscription?: UserSubscription;
  onOpenUpgradeModal?: () => void;
  onAddAppliance: () => void;
  onEditAppliance: (appliance: Appliance) => void;
  onDeleteAppliance: (id: string) => void;
  onDuplicateAppliance: (appliance: Appliance) => void;
  onResetDemo: () => void;
}

export const ApplianceList: React.FC<ApplianceListProps> = ({
  appliances,
  tariff,
  subscription,
  onOpenUpgradeModal,
  onAddAppliance,
  onEditAppliance,
  onDeleteAppliance,
  onDuplicateAppliance,
  onResetDemo,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'kwh_desc' | 'kwh_asc' | 'name' | 'watts'>('kwh_desc');

  const isPremium = subscriptionService.isPremium(subscription);
  const quota = subscriptionService.canAddAppliance(appliances.length, subscription);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Appliances' },
    { id: 'Cooling', label: 'Cooling' },
    { id: 'Heating', label: 'Heating' },
    { id: 'Kitchen', label: 'Kitchen' },
    { id: 'Entertainment', label: 'Entertainment' },
    { id: 'Lighting', label: 'Lighting' },
    { id: 'Computing', label: 'Computing' },
    { id: 'Utility', label: 'Utility' },
    { id: 'Other', label: 'Other' },
  ];

  const getCategoryIcon = (category: ApplianceCategory) => {
    switch (category) {
      case 'Cooling':
        return <Snowflake className="w-4 h-4 text-cyan-600" />;
      case 'Heating':
        return <Flame className="w-4 h-4 text-amber-600" />;
      case 'Kitchen':
        return <Utensils className="w-4 h-4 text-orange-600" />;
      case 'Entertainment':
        return <Tv className="w-4 h-4 text-indigo-600" />;
      case 'Lighting':
        return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      case 'Computing':
        return <Laptop className="w-4 h-4 text-blue-600" />;
      default:
        return <Zap className="w-4 h-4 text-emerald-600" />;
    }
  };

  const filteredAppliances = useMemo(() => {
    return appliances
      .filter((app) => {
        const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'kwh_desc') return b.monthlyKwh - a.monthlyKwh;
        if (sortBy === 'kwh_asc') return a.monthlyKwh - b.monthlyKwh;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'watts') return (b.powerWatts * b.quantity) - (a.powerWatts * a.quantity);
        return 0;
      });
  }, [appliances, selectedCategory, searchQuery, sortBy]);

  const totalFilteredKwh = filteredAppliances.reduce((sum, a) => sum + a.monthlyKwh, 0);
  const totalFilteredCost = filteredAppliances.reduce((sum, a) => sum + a.estimatedCost, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Household Appliances
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your connected equipment, power ratings, and daily usage hours
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Plan Quota Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plan:</span>
            {isPremium ? (
              <span className="font-bold text-cyan-700 flex items-center gap-1">
                <span>Premium ⚡</span>
                <span className="text-slate-400 font-normal">(Unlimited)</span>
              </span>
            ) : (
              <span className="font-semibold text-slate-700">
                Free Basic ({appliances.length}/{SUBSCRIPTION_CONFIG.FREE_MAX_APPLIANCES})
              </span>
            )}
          </div>

          <button
            onClick={onAddAppliance}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Appliance</span>
          </button>
        </div>
      </div>

      {/* Free Plan Cap Warning Banner if at limit */}
      {!isPremium && appliances.length >= SUBSCRIPTION_CONFIG.FREE_MAX_APPLIANCES && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-200/60 text-amber-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-amber-950">
                Free Plan Limit Reached (5 of 5 Appliances Monitored)
              </h4>
              <p className="text-[11px] text-amber-800">
                You've reached the free tier limit. Upgrade to ENERO Premium for ₹599/month to track unlimited appliances and run AI audits.
              </p>
            </div>
          </div>

          {onOpenUpgradeModal && (
            <button
              onClick={onOpenUpgradeModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <span>Get Unlimited — ₹599/mo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search appliances, room or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="kwh_desc">Highest Consumption (kWh)</option>
              <option value="kwh_asc">Lowest Consumption (kWh)</option>
              <option value="watts">Power Rating (Watts)</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Category Filter Pills (Functional Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Appliance Cards Grid */}
      {filteredAppliances.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No appliances found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try clearing your search query or switching categories.'
                : 'Your appliance list is empty. Add your household appliances to estimate your bill.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={onAddAppliance}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
            >
              + Add First Appliance
            </button>
            <button
              onClick={onResetDemo}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Load Demo Appliances
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppliances.map((app) => {
            const catColor = CATEGORY_COLORS[app.category] || CATEGORY_COLORS.Other;
            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 group relative"
              >
                {/* Card Top: Category and Actions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      {getCategoryIcon(app.category)}
                      <span>{app.category}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDuplicateAppliance(app)}
                        title="Duplicate appliance"
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditAppliance(app)}
                        title="Edit appliance"
                        className="p-1.5 text-slate-400 hover:text-cyan-700 rounded-lg hover:bg-cyan-50 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteAppliance(app.id)}
                        title="Delete appliance"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Appliance Title & Units */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-800 transition-colors">
                      {app.name}
                    </h3>
                    {app.notes && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5" title={app.notes}>
                        {app.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Specs Pill-less Metadata */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Units</span>
                    <span className="font-mono font-semibold text-slate-800">{app.quantity} {app.quantity > 1 ? 'units' : 'unit'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rating</span>
                    <span className="font-mono font-semibold text-slate-800">{app.powerWatts} W</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Daily</span>
                    <span className="font-mono font-semibold text-slate-800">{app.hoursPerDay} hrs/d</span>
                  </div>
                </div>

                {/* Card Footer: Calculated Monthly kWh and Estimated Cost */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Monthly Estimated</span>
                    <div className="text-base font-bold font-mono text-slate-900">
                      {app.monthlyKwh} <span className="text-xs font-sans font-normal text-slate-500">kWh</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Est. Cost</span>
                    <div className="text-base font-bold font-mono text-cyan-800">
                      {tariff.currency}{Math.round(app.estimatedCost).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Share of total bill indicator bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Share of total usage</span>
                    <span className="font-mono font-bold text-slate-700">{app.percentageOfTotal}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(2, app.percentageOfTotal))}%` }}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Running Total Banner at Bottom (Prompt Section 13) */}
      {filteredAppliances.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Zap className="w-5 h-5 fill-cyan-400 text-cyan-400" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400 block">
                Running Total ({filteredAppliances.length} appliances)
              </span>
              <p className="text-xs text-slate-400">
                Sum of active appliances before fixed meter charges and taxes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-[11px] text-slate-400 block">Combined kWh</span>
              <span className="text-xl font-bold font-mono text-white">
                {Math.round(totalFilteredKwh * 10) / 10} <span className="text-xs font-sans text-slate-400 font-normal">kWh/mo</span>
              </span>
            </div>

            <div className="border-l border-slate-800 pl-6">
              <span className="text-[11px] text-slate-400 block">Estimated Energy Cost</span>
              <span className="text-xl font-bold font-mono text-cyan-400">
                {tariff.currency}{Math.round(totalFilteredCost).toLocaleString()} <span className="text-xs font-sans text-slate-400 font-normal">/mo</span>
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
