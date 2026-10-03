import React from 'react';
import { 
  Zap, 
  ArrowRight, 
  Layers, 
  Clock, 
  TrendingDown, 
  Sliders, 
  Sparkles, 
  ShieldCheck, 
  Home, 
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Flame,
  Snowflake,
  Fan,
  Check
} from 'lucide-react';
import { BillSummary, TariffConfig } from '../types';

interface LandingPageProps {
  onStartWizard: () => void;
  onExploreDashboard: () => void;
  onSelectPlan?: (plan: 'free' | 'premium') => void;
  summary: BillSummary;
  tariff: TariffConfig;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartWizard,
  onExploreDashboard,
  onSelectPlan,
  summary,
  tariff,
}) => {
  return (
    <div className="space-y-24 py-6 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-12 sm:pb-20">
        
        {/* Subtle background ambient gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-50/70 via-sky-50/40 to-transparent pointer-events-none -z-10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/80 text-cyan-800 text-xs font-semibold tracking-wide">
                <Zap className="w-3.5 h-3.5 fill-cyan-600 text-cyan-600" />
                <span>KNOW BEFORE THE BILL ⚡</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] text-balance">
                Know Before the Bill. <span className="text-cyan-600 inline-block">⚡</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl text-balance">
                Estimate your electricity bill, understand which appliances consume the most energy, and discover practical ways to reduce your monthly electricity expenses.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={onStartWizard}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md shadow-slate-900/10 active:scale-[0.98] group cursor-pointer"
                >
                  <span>Start My Energy Check</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={onExploreDashboard}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all hover:border-slate-300 shadow-sm cursor-pointer"
                >
                  <span>See How It Works</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Trust proof points */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No smart meters or hardware needed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Configurable tariff rates & slabs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% private in-browser calculations</span>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Visual - Realistic ENERO Dashboard Card */}
            <div className="lg:col-span-5 relative">
              
              {/* Outer decorative glow container */}
              <div className="relative mx-auto max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 space-y-5">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-xs">
                      <Zap className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                        ENERO Energy Snapshot
                      </span>
                      <span className="text-[11px] text-slate-400">Current Monthly Model</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Live Calculation
                  </span>
                </div>

                {/* 2x2 Metric Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">Estimated Monthly Usage</span>
                    <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                      {summary.totalMonthlyKwh || 326} <span className="text-sm font-sans font-normal text-slate-500">kWh</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-100">
                    <span className="text-xs text-cyan-800 block mb-1">Estimated Bill</span>
                    <div className="text-2xl font-bold font-mono tabular-nums text-cyan-950">
                      {tariff.currency}{summary.totalEstimatedBill ? summary.totalEstimatedBill.toLocaleString() : '2,450'}
                    </div>
                  </div>
                </div>

                {/* Consumer Callout */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Snowflake className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-amber-800 font-semibold block">
                        Top Consumer
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {summary.topConsumer ? summary.topConsumer.name : 'Air Conditioner'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-900 bg-white/80 px-2 py-1 rounded border border-amber-200/50">
                    {summary.topConsumer ? `${summary.topConsumer.percentageOfTotal}%` : '55% of bill'}
                  </span>
                </div>

                {/* Savings Callout */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-emerald-800 font-semibold block">
                      Potential Savings
                    </span>
                    <span className="text-lg font-bold font-mono text-emerald-900">
                      {tariff.currency}{summary.potentialSavingsMonthly || 420}/month
                    </span>
                  </div>
                  <button 
                    onClick={onExploreDashboard}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    Simulate &rarr;
                  </button>
                </div>

                {/* Live sample appliances mini row */}
                <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Calculated from {summary.applianceCount || 5} active appliances</span>
                  <button 
                    onClick={onExploreDashboard}
                    className="text-cyan-700 font-medium hover:underline text-xs"
                  >
                    Open Full View
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
          
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                The Electricity Surprise Problem
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                Most people only discover how much electricity they have used when the bill arrives.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                By the time the utility invoice drops in your mailbox or SMS, the month is already over. You are left guessing whether it was the AC, the continuous fans, the hot water geyser, or appliances left running.
              </p>
            </div>

            <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                The ENERO Solution
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                Understand your electricity beforehand.
              </h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                ENERO lets you estimate your consumption before the bill arrives by understanding the appliances you use and how long you use them. Test usage scenarios and see immediate savings before consuming the units.
              </p>
              <div className="pt-2">
                <button
                  onClick={onStartWizard}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <span>Build your home profile in 2 minutes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section (4 Steps) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Four Simple Steps to Total Clarity
          </h2>
          <p className="text-slate-600 text-base">
            No hardware to mount, no complicated meters to rewire. Pure data intelligence from your own usage habits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-4 group">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-slate-300 group-hover:text-cyan-600 transition-colors">
                01
              </span>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Add Your Appliances</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tell ENERO what appliances you use. Pick from dozens of pre-configured presets or add custom electronics.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-4 group">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-slate-300 group-hover:text-cyan-600 transition-colors">
                02
              </span>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Tell Us Your Usage</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enter quantity, estimated daily run-time (hours/day), and days per month. Wattages adjust to your exact models.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-4 group">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-slate-300 group-hover:text-cyan-600 transition-colors">
                03
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Get Your Estimate</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              ENERO calculates approximate monthly electricity consumption (kWh) and bill based on flat or tiered slab rates.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-4 group">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-slate-300 group-hover:text-cyan-600 transition-colors">
                04
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Reduce Your Bill</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              ENERO identifies major energy consumers and suggests ways to reduce usage using interactive What-If simulators.
            </p>
          </div>

        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-100/70 text-cyan-800 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="text-base font-bold text-slate-900">Estimate</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Know your approximate monthly electricity cost and breakdown before receiving your utility statement.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100/70 text-amber-800 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="text-base font-bold text-slate-900">Understand</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discover which appliances contribute most to your estimated consumption with transparent percentage rankings.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100/70 text-indigo-800 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="text-base font-bold text-slate-900">Simulate</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              See what could happen if you change your usage with real-time Before & After sliders and scenario comparisons.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold">
              4
            </div>
            <h4 className="text-base font-bold text-slate-900">Save</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive prioritized, non-hazardous tips to eliminate phantom draw and optimize heavy consumers.
            </p>
          </div>

        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 text-cyan-600 fill-cyan-600" />
            <span>Pricing Plans</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Transparent, Accessible Pricing
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Monitor essential appliances for free, or upgrade to ENERO Premium for unlimited appliances, Gemini AI smart audits, and What-If simulations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {/* FREE PLAN */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col justify-between space-y-6 shadow-xs hover:border-slate-300 transition-all">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Basic Monitoring
                </span>
                <h3 className="text-2xl font-bold text-slate-900">FREE</h3>
                <p className="text-xs text-slate-500">
                  Ideal for students, small apartments, and essential household devices.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black font-mono text-slate-900">₹0</span>
                <span className="text-sm font-semibold text-slate-500">/month</span>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Personal secure account & saved setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Appliance electricity calculator & bill estimate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 font-semibold" />
                  <span><strong>Up to 5 appliances</strong> monitored</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Standard rule-based energy insights</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan ? onSelectPlan('free') : onStartWizard()}
              className="w-full py-3 px-4 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer text-center block"
            >
              START FOR FREE
            </button>
          </div>

          {/* PREMIUM PLAN */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl border border-cyan-500/40 p-8 flex flex-col justify-between space-y-6 shadow-xl shadow-cyan-950/20 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-cyan-400 text-slate-950 px-3 py-1 rounded-full shadow-sm">
                <Sparkles className="w-3 h-3 fill-slate-950" />
                <span>MOST POPULAR</span>
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                  Advanced Energy Management
                </span>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>ENERO PREMIUM</span>
                  <span className="text-cyan-400">⚡</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Full control with AI audits, What-If simulator, and unlimited inventory.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black font-mono text-white">₹599</span>
                <span className="text-sm font-semibold text-slate-400">/month</span>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span><strong>Unlimited appliances</strong> inventory</span>
                </div>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span><strong>AI Energy Insights</strong> (Gemini smart audits)</span>
                </div>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span><strong>Interactive Savings Simulator</strong> (What-If lab)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Unlimited calculation history snapshots</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Target budget tracking & alert triggers</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan ? onSelectPlan('premium') : onStartWizard()}
              className="w-full py-3.5 px-4 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 rounded-xl transition-all shadow-md shadow-cyan-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>GET PREMIUM — ₹599/MONTH ⚡</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </section>

      {/* Final Call to Action Section (Prompt Section 36) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 text-white p-10 sm:p-16 border border-slate-800 relative overflow-hidden shadow-xl">
          
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <Zap className="w-4 h-4 fill-cyan-400" />
              <span>ENERO — KNOW BEFORE THE BILL</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Don't Wait for the Bill.
            </h2>

            <p className="text-lg text-slate-300">
              Understand your energy today. Take control of your household appliances and expenses.
            </p>

            <div className="pt-2">
              <button
                onClick={onStartWizard}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
              >
                <span>Calculate My Electricity Usage ⚡</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 pt-2">
              Free forever. No credit card, smart plugs, or utility account login required.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
