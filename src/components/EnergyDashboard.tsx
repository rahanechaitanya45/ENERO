import React, { useState } from 'react';
import { 
  Zap, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  Lightbulb, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  PieChart as PieChartIcon,
  Printer,
  ChevronRight,
  Plus
} from 'lucide-react';

import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { BillSummary, ApplianceWithCalculations, TariffConfig, HomeProfile, UserSubscription } from '../types';
import { CATEGORY_COLORS } from '../data/presetAppliances';
import { subscriptionService } from '../services/subscriptionService';

interface EnergyDashboardProps {
  summary: BillSummary;
  rankedAppliances: ApplianceWithCalculations[];
  tariff: TariffConfig;
  homeProfile: HomeProfile;
  subscription?: UserSubscription;
  onOpenUpgradeModal?: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenTariffModal: () => void;
  onAddAppliance?: () => void;
  onLoadDemo?: () => void;
}


const DONUT_COLORS = [
  '#0284c7', // Sky / Cyan
  '#0d9488', // Teal
  '#f59e0b', // Amber
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#64748b', // Slate
];

export const EnergyDashboard: React.FC<EnergyDashboardProps> = ({
  summary,
  rankedAppliances,
  tariff,
  homeProfile,
  subscription,
  onOpenUpgradeModal,
  onNavigateTab,
  onOpenTariffModal,
  onAddAppliance,
  onLoadDemo,
}) => {
  const isPremium = subscriptionService.isPremium(subscription);
  const [viewMode, setViewMode] = useState<'monthly' | 'daily'>('monthly');

  // Prepare chart data for top 5 appliances + "Others"
  const chartData = React.useMemo(() => {
    if (rankedAppliances.length === 0) return [];
    
    if (rankedAppliances.length <= 5) {
      return rankedAppliances.map((app) => ({
        name: app.name,
        value: app.monthlyKwh,
        percentage: app.percentageOfTotal,
        cost: app.estimatedCost,
      }));
    }

    const top5 = rankedAppliances.slice(0, 5).map((app) => ({
      name: app.name,
      value: app.monthlyKwh,
      percentage: app.percentageOfTotal,
      cost: app.estimatedCost,
    }));

    const othersKwh = rankedAppliances.slice(5).reduce((sum, a) => sum + a.monthlyKwh, 0);
    const othersCost = rankedAppliances.slice(5).reduce((sum, a) => sum + a.estimatedCost, 0);
    const othersPercentage = summary.totalMonthlyKwh > 0 ? (othersKwh / summary.totalMonthlyKwh) * 100 : 0;

    return [
      ...top5,
      {
        name: 'Other Appliances',
        value: Math.round(othersKwh * 10) / 10,
        percentage: Math.round(othersPercentage * 10) / 10,
        cost: Math.round(othersCost),
      },
    ];
  }, [rankedAppliances, summary.totalMonthlyKwh]);

  // Category breakdown for summary cards
  const categoryBreakdown = React.useMemo(() => {
    const map: Record<string, { kwh: number; cost: number; count: number }> = {};
    rankedAppliances.forEach((app) => {
      if (!map[app.category]) {
        map[app.category] = { kwh: 0, cost: 0, count: 0 };
      }
      map[app.category].kwh += app.monthlyKwh;
      map[app.category].cost += app.estimatedCost;
      map[app.category].count += app.quantity;
    });
    return Object.entries(map).sort((a, b) => b[1].kwh - a[1].kwh);
  }, [rankedAppliances]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12 print-page">
      
      {/* Top Header & Breadcrumb Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>{homeProfile.homeType}</span>
            <span aria-hidden="true">·</span>
            <span>{homeProfile.occupants} {homeProfile.occupants === 1 ? 'person' : 'occupants'}</span>
            <span aria-hidden="true">·</span>
            <span>{tariff.providerName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Energy Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Daily vs Monthly switch */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly View
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Average
            </button>
          </div>

          <button
            onClick={handlePrint}
            title="Print or save as PDF report"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer no-print"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Subscription Status Pill / Upgrade Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isPremium 
          ? 'bg-gradient-to-r from-slate-900 to-slate-950 text-white border-cyan-500/30 shadow-sm'
          : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            isPremium ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-100 text-slate-700'
          }`}>
            <Zap className={`w-4 h-4 ${isPremium ? 'fill-cyan-400' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {isPremium ? 'ENERO Premium Active ⚡' : 'Free Basic Plan'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isPremium ? 'bg-cyan-400 text-slate-950' : 'bg-slate-100 text-slate-600'
              }`}>
                {isPremium ? 'UNLIMITED INVENTORY' : `${rankedAppliances.length}/5 APPLIANCES`}
              </span>
            </div>
            <p className={`text-[11px] ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>
              {isPremium
                ? 'Unlimited appliance tracking, Gemini AI audits, and What-If simulation enabled.'
                : 'Free basic electricity estimation. Upgrade to Premium for ₹599/month for AI audits & unlimited equipment.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isPremium && onOpenUpgradeModal && (
            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>Upgrade to Premium (₹599)</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigateTab('pricing')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
              isPremium ? 'text-cyan-400 hover:text-cyan-300 bg-slate-800' : 'text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200'
            }`}
          >
            {isPremium ? 'Plan Benefits' : 'View Plans'}
          </button>
        </div>
      </div>

      {/* First-Time User Empty State (Prompt Section 18) */}
      {rankedAppliances.length === 0 && (

        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-200/80 text-cyan-600 flex items-center justify-center mx-auto shadow-sm">
            <Zap className="w-8 h-8 fill-cyan-600" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Let's calculate your electricity usage ⚡
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You haven't added any appliances yet. Add your air conditioner, fans, refrigerator, or lighting to calculate your first estimated electricity bill.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {onAddAppliance && (
              <button
                onClick={onAddAppliance}
                className="px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md shadow-slate-900/10 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Your First Appliance</span>
              </button>
            )}
            {onLoadDemo && (
              <button
                onClick={onLoadDemo}
                className="px-5 py-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Load Common Home Essentials
              </button>
            )}
          </div>
        </div>
      )}

      {/* TOP 4 KEY METRIC CARDS (Prompt Section 16) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        
        {/* Card 1: Estimated Monthly / Daily Usage */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {viewMode === 'monthly' ? 'Estimated Monthly Usage' : 'Daily Average Usage'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
              {viewMode === 'monthly' ? summary.totalMonthlyKwh : summary.totalDailyKwh}
              <span className="text-sm font-sans font-normal text-slate-500 ml-1.5">
                {viewMode === 'monthly' ? 'kWh/mo' : 'kWh/day'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Based on {summary.applianceCount} active units in household
            </p>
          </div>
        </div>

        {/* Card 2: Estimated Monthly Bill */}
        <div className="bg-gradient-to-br from-cyan-50/80 to-white rounded-2xl border border-cyan-200/80 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-800">
              {viewMode === 'monthly' ? 'Estimated Monthly Bill' : 'Est. Daily Energy Cost'}
            </span>
            <button
              onClick={onOpenTariffModal}
              className="text-[11px] text-cyan-700 font-semibold hover:underline"
            >
              Tariff Settings
            </button>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-950">
              {tariff.currency}
              {viewMode === 'monthly' 
                ? summary.totalEstimatedBill.toLocaleString()
                : Math.round(summary.totalEstimatedBill / 30).toLocaleString()}
              <span className="text-sm font-sans font-normal text-slate-500 ml-1.5">
                {viewMode === 'monthly' ? 'est.' : '/day'}
              </span>
            </div>
            <p className="text-[11px] text-cyan-800 mt-1 flex items-center gap-1 font-medium">
              <span>Incl. {tariff.currency}{summary.fixedCharges} fixed + {tariff.currency}{summary.taxes} tax</span>
            </p>
          </div>
        </div>

        {/* Card 3: Daily Average Benchmark */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Daily Average
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
              {summary.totalDailyKwh}
              <span className="text-sm font-sans font-normal text-slate-500 ml-1.5">kWh/day</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              ~{(summary.totalDailyKwh / Math.max(1, homeProfile.occupants)).toFixed(1)} kWh per occupant / day
            </p>
          </div>
        </div>

        {/* Card 4: Potential Savings */}
        <div className="bg-gradient-to-br from-emerald-50/80 to-white rounded-2xl border border-emerald-200/80 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Potential Savings
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-emerald-950">
              {tariff.currency}{summary.potentialSavingsMonthly}
              <span className="text-sm font-sans font-normal text-emerald-700 ml-1.5">/month</span>
            </div>
            <button
              onClick={() => onNavigateTab('simulator')}
              className="text-[11px] text-emerald-700 font-semibold hover:underline flex items-center gap-1 mt-1 cursor-pointer"
            >
              <span>Explore in Savings Simulator</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* BUDGET COMPARISON & TARGET ALERT (Prompt Section 21) */}
      <div className={`rounded-2xl p-5 border transition-all ${
        summary.isOverBudget 
          ? 'bg-amber-50/70 border-amber-200/90 text-amber-950'
          : 'bg-emerald-50/70 border-emerald-200/90 text-emerald-950'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {summary.isOverBudget ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <h3 className="text-base font-bold">
                {summary.isOverBudget
                  ? `Your current estimated bill is approximately ${tariff.currency}${summary.budgetDelta} above your target budget.`
                  : `Your estimated bill is comfortably within your target budget by ${tariff.currency}${summary.budgetDelta}.`}
              </h3>
            </div>
            <p className="text-xs opacity-80 pl-7">
              {summary.isOverBudget
                ? 'Try reducing usage of your highest-consuming appliance and use the Savings Simulator to explore scenarios.'
                : 'Great energy discipline! You can still explore fine-tuning appliance operating schedules for even deeper savings.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 pl-7 sm:pl-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">Target Budget</span>
              <span className="text-sm font-bold font-mono">
                {tariff.currency}{homeProfile.targetMonthlyBudget.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => onNavigateTab('simulator')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                summary.isOverBudget
                  ? 'bg-amber-600 text-white hover:bg-amber-700 border-amber-600'
                  : 'bg-white text-emerald-800 hover:bg-emerald-100/60 border-emerald-200'
              }`}
            >
              Simulate Scenarios &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* ENERGY AWARENESS SCORE & TOP CONSUMER HIGHLIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Energy Awareness Score (Prompt Section 23) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Motivational Rating
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Energy Awareness Score
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Out of 100</span>
          </div>

          <div className="flex items-center gap-6 py-2">
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              {/* Circular Gauge Representation */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={summary.energyScore >= 75 ? 'text-emerald-500' : summary.energyScore >= 50 ? 'text-cyan-500' : 'text-amber-500'}
                  strokeDasharray={`${summary.energyScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black font-mono text-slate-900 leading-none">
                  {summary.energyScore}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">/100</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="font-semibold text-slate-900">
                {summary.energyScore >= 80 ? '🌟 Highly Efficient Profile' : summary.energyScore >= 65 ? '⚡ Balanced Usage Pattern' : '⚠️ Heavy Concentrated Loads'}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Calculated dynamically from load concentration, budget alignment, and occupant ratios.
              </p>
              <p className="text-[10px] text-slate-400 italic">
                *Product awareness metric only, not a certified laboratory benchmark.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigateTab('recommendations')}
              className="text-cyan-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Personalized Recommendations</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Top Consumer Insight Card (Prompt Section 17) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Primary Energy Load
              </span>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                {summary.topConsumer ? `${summary.topConsumer.percentageOfTotal}% of total` : '0%'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {summary.topConsumer ? summary.topConsumer.name : 'No appliance recorded'}
            </h3>
          </div>

          {summary.topConsumer ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {summary.topConsumer.quantity} unit · {summary.topConsumer.powerWatts}W · {summary.topConsumer.hoursPerDay} hrs/day
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {summary.topConsumer.monthlyKwh} kWh/mo
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, summary.topConsumer.percentageOfTotal)}%` }}
                />
              </div>

              <p className="text-xs text-slate-600 pt-1">
                <strong className="text-slate-900">ENERO Insight:</strong> Your {summary.topConsumer.name} is currently your largest estimated energy consumer. Trimming just 1 hour of runtime daily could save approximately <span className="font-mono font-bold text-emerald-700">{tariff.currency}{Math.round((summary.topConsumer.powerWatts * summary.topConsumer.quantity * 1 * 30 / 1000) * tariff.flatRate)}/month</span>.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Add appliances to discover your biggest consumer.</p>
          )}

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              onClick={() => onNavigateTab('analysis')}
              className="text-slate-700 font-semibold hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Ranked Consumers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('simulator')}
              className="text-cyan-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Simulate Reduction</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* WHERE YOUR ENERGY GOES (Prompt Section 16 - Donut Chart) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-cyan-600" />
              <span>Where Your Energy Goes</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of estimated electricity consumption by appliance
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total: {summary.totalMonthlyKwh} kWh / month
          </span>
        </div>

        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Interactive Donut Chart */}
            <div className="lg:col-span-6 h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]} 
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-lg space-y-1">
                            <span className="font-bold text-cyan-400 block">{data.name}</span>
                            <div className="flex justify-between gap-4 font-mono">
                              <span>Consumption:</span>
                              <span className="font-semibold">{data.value} kWh</span>
                            </div>
                            <div className="flex justify-between gap-4 font-mono text-slate-300">
                              <span>Share of total:</span>
                              <span className="font-semibold">{data.percentage}%</span>
                            </div>
                            <div className="flex justify-between gap-4 font-mono text-emerald-400">
                              <span>Est. Cost:</span>
                              <span className="font-semibold">{tariff.currency}{Math.round(data.cost)}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Structured Data Table List */}
            <div className="lg:col-span-6 space-y-3">
              {chartData.map((item, idx) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                    />
                    <span className="text-xs font-semibold text-slate-900 truncate max-w-[160px] sm:max-w-[220px]">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-600">{item.value} kWh</span>
                    <span className="font-bold text-slate-900 w-12 text-right">{item.percentage}%</span>
                    <span className="text-cyan-800 font-bold w-16 text-right">
                      {tariff.currency}{Math.round(item.cost)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          <p className="text-center py-10 text-xs text-slate-500">
            No appliances entered yet to render distribution chart.
          </p>
        )}
      </div>

    </div>
  );
};
