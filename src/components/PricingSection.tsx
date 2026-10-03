import React from 'react';
import { 
  Check, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Bot, 
  Sliders, 
  History, 
  Wallet,
  Lock
} from 'lucide-react';
import { UserSubscription } from '../types';
import { subscriptionService, SUBSCRIPTION_CONFIG } from '../services/subscriptionService';

interface PricingSectionProps {
  subscription: UserSubscription;
  onSelectPlan: (plan: 'free' | 'premium') => void;
  onNavigateToDashboard: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  subscription,
  onSelectPlan,
  onNavigateToDashboard,
}) => {
  const isPremiumUser = subscriptionService.isPremium(subscription);

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold tracking-wide uppercase">
          <Zap className="w-3.5 h-3.5 text-cyan-600 fill-cyan-600" />
          <span>Transparent Plans</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
          Simple & Accessible Pricing
        </h1>
        
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Start for free to monitor essential household appliances, or unlock full AI analytics and the interactive Savings Simulator with ENERO Premium.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
        
        {/* FREE PLAN */}
        <div className={`bg-white rounded-3xl border p-8 flex flex-col justify-between space-y-8 transition-all ${
          !isPremiumUser ? 'border-slate-300 shadow-md ring-1 ring-slate-200' : 'border-slate-200 shadow-xs'
        }`}>
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Basic Monitoring
              </span>
              <h3 className="text-2xl font-bold text-slate-900">FREE</h3>
              <p className="text-xs text-slate-500">
                Essential appliance estimation for small households and students.
              </p>
            </div>

            {/* Price Tag */}
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black font-mono text-slate-900">₹0</span>
              <span className="text-sm font-semibold text-slate-500">/month</span>
            </div>

            {/* Feature List (Section 3) */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                What's included:
              </span>
              
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Personal secure account</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Appliance electricity calculator</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Basic electricity bill estimate</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Basic dashboard & distribution</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 font-semibold" />
                <span><strong>Up to 5 appliances</strong> monitored</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Standard rule-based energy insights</span>
              </div>
            </div>

          </div>

          {/* Action Button */}
          <div className="pt-6">
            {!isPremiumUser ? (
              <button
                type="button"
                onClick={onNavigateToDashboard}
                className="w-full py-3 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer text-center block"
              >
                CURRENT ACTIVE PLAN
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectPlan('free')}
                className="w-full py-3 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition-all cursor-pointer text-center block"
              >
                START FOR FREE
              </button>
            )}
          </div>
        </div>

        {/* PREMIUM PLAN */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl border border-cyan-500/40 p-8 flex flex-col justify-between space-y-8 shadow-xl shadow-cyan-950/20 relative overflow-hidden">
          
          {/* Most Popular Badge */}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-cyan-400 text-slate-950 px-3 py-1 rounded-full shadow-sm">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              <span>MOST POPULAR</span>
            </span>
          </div>

          <div className="space-y-6">
            
            {/* Header info */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                Advanced Energy Management
              </span>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>ENERO PREMIUM</span>
                <span className="text-cyan-400">⚡</span>
              </h3>
              <p className="text-xs text-slate-400">
                Complete control with AI audits, What-If simulation, and unlimited inventory.
              </p>
            </div>

            {/* Price Tag (Section 3: exactly ₹599/month) */}
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black font-mono text-white">₹599</span>
              <span className="text-sm font-semibold text-slate-400">/month</span>
            </div>

            {/* Feature List (Section 3) */}
            <div className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block mb-2">
                Everything in Free, plus:
              </span>
              
              <div className="flex items-center gap-2.5 text-white font-medium">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span><strong>Unlimited appliances</strong> inventory</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Advanced analytics & heavy load ranking</span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-medium">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span><strong>AI Energy Insights</strong> (Gemini smart audits)</span>
              </div>
              <div className="flex items-center gap-2.5 text-white font-medium">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span><strong>Interactive Savings Simulator</strong> (What-If lab)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Unlimited calculation history snapshots</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Target budget tracking & alert triggers</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Personalized multi-priority reduction plan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Advanced export & printable bill audits</span>
              </div>
            </div>

          </div>

          {/* Action Button */}
          <div className="pt-6">
            {isPremiumUser ? (
              <button
                type="button"
                onClick={onNavigateToDashboard}
                className="w-full py-3 px-4 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all cursor-pointer text-center block shadow-md shadow-cyan-400/20"
              >
                ACTIVE PREMIUM MEMBER ⚡
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectPlan('premium')}
                className="w-full py-3.5 px-4 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 rounded-xl transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>GET PREMIUM — ₹599/MONTH</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Trust & Guarantee Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Secure Payments via Razorpay</h4>
            <p className="text-[11px] text-slate-500">
              UPI, Credit/Debit cards, NetBanking supported. Cancel or renew anytime.
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Subscriptions are valid for 1 full month from the date of activation.
        </div>
      </div>

    </div>
  );
};
