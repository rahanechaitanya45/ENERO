import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Flame, 
  Snowflake, 
  Fan, 
  Tv, 
  Lightbulb, 
  Bot, 
  RefreshCw,
  Clock
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { EnergyInsight, ApplianceWithCalculations, BillSummary, TariffConfig, HomeProfile } from '../types';

interface RecommendationsPlanProps {
  insights: EnergyInsight[];
  rankedAppliances: ApplianceWithCalculations[];
  summary: BillSummary;
  tariff: TariffConfig;
  homeProfile: HomeProfile;
  onNavigateToSimulator: () => void;
}

export const RecommendationsPlan: React.FC<RecommendationsPlanProps> = ({
  insights,
  rankedAppliances,
  summary,
  tariff,
  homeProfile,
  onNavigateToSimulator,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleRunAiAudit = async () => {
    setIsLoadingAi(true);
    setAiError(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });

      const promptContext = `
You are an expert home energy auditor for the ENERO application ("KNOW BEFORE THE BILL ⚡").
Analyze the following household energy model and generate 3 practical, safe, high-impact recommendations to reduce the estimated electricity bill.
IMPORTANT SAFETY RULE: Never give dangerous advice (e.g. never tell user to rewire, open high-voltage equipment, or tamper with circuit breakers).
Always use careful estimation language ("could potentially save", "estimated", "approximate").

HOUSEHOLD PROFILE:
- Home Type: ${homeProfile.homeType}
- Occupants: ${homeProfile.occupants}
- Provider: ${tariff.providerName}
- Target Monthly Budget: ${tariff.currency}${homeProfile.targetMonthlyBudget}
- Total Estimated Monthly Consumption: ${summary.totalMonthlyKwh} kWh
- Estimated Monthly Bill: ${tariff.currency}${summary.totalEstimatedBill}
- Energy Awareness Score: ${summary.energyScore}/100

APPLIANCES BREAKDOWN:
${rankedAppliances.map(a => `- ${a.name} (${a.category}): ${a.quantity} unit(s), ${a.powerWatts}W, ${a.hoursPerDay} hrs/day -> ${a.monthlyKwh} kWh/mo (${a.percentageOfTotal}% of bill)`).join('\n')}

Format your response cleanly in 3 concise, actionable priority sections (Priority 1: High Impact, Priority 2: Medium Impact, Priority 3: Quick Win). Include approximate estimated monthly savings for each.
Keep it encouraging, modern, and concise (under 250 words total).
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptContext,
      });

      if (response && response.text) {
        setAiAnalysis(response.text);
      } else {
        throw new Error('No analysis generated.');
      }
    } catch (err: any) {
      console.warn('AI audit fallback to rule-based', err);
      setAiError('AI Smart Audit is currently taking a breather. Your verified rule-based energy plan below is fully active!');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const getPriorityBadge = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High':
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-full">
            High Impact
          </span>
        );
      case 'Medium':
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
            Medium Impact
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
            Quick Win
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold tracking-wide mb-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>DATA-BACKED REDUCTION ROADMAP</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Your Personalized Energy Plan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Targeted strategies tailored to your exact appliance inventory and operating hours
          </p>
        </div>

        <button
          onClick={handleRunAiAudit}
          disabled={isLoadingAi}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-cyan-50 hover:bg-cyan-100/80 border border-cyan-200 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {isLoadingAi ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-600" />
              <span>Analyzing Household Loads...</span>
            </>
          ) : (
            <>
              <Bot className="w-3.5 h-3.5 text-cyan-700" />
              <span>Run AI Energy Audit</span>
            </>
          )}
        </button>
      </div>

      {/* AI Smart Energy Audit Card (if run) */}
      {aiAnalysis && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white border border-cyan-800/40 shadow-lg space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 fill-cyan-400" />
              </div>
              <span className="text-sm font-bold text-white">AI Energy Auditor Findings</span>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">ENERO Intelligence</span>
          </div>

          <div className="text-xs leading-relaxed text-slate-300 space-y-3 whitespace-pre-line">
            {aiAnalysis}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Based on live model: {summary.totalMonthlyKwh} kWh/mo</span>
            <button
              onClick={onNavigateToSimulator}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Test Scenarios in Simulator &rarr;
            </button>
          </div>
        </div>
      )}

      {aiError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          {aiError}
        </div>
      )}

      {/* VERIFIED RULE-BASED ENERGY PLAN (Prompt Section 20) */}
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={insight.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-black font-mono text-slate-400">
                  0{index + 1}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {insight.title}
                </h3>
              </div>
              <div>{getPriorityBadge(insight.priority)}</div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {insight.description}
            </p>

            {/* Potential Savings Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Estimated Monthly Reduction</span>
                <span className="font-mono font-bold text-slate-900">
                  ~{insight.potentialMonthlySavingKwh} kWh
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-semibold">Potential Cost Difference</span>
                <span className="font-mono font-bold text-emerald-900">
                  ~{tariff.currency}{insight.potentialMonthlySavingCost} / month
                </span>
              </div>
            </div>

            {/* Action Hint & Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{insight.actionHint}</span>
              </div>

              <button
                onClick={onNavigateToSimulator}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-cyan-800 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100/70 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shrink-0"
              >
                <span>Simulate in Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Safety & Compliance Pledge Banner */}
      <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-800 block">ENERO Electrical Safety Standard</span>
          <p className="leading-relaxed">
            All ENERO suggestions focus on behavioral timing, thermostat optimization, and appliance star ratings. Never attempt internal repairs, modifications, or opening electrical equipment yourself. For any electrical anomalies, always consult a certified electrician.
          </p>
        </div>
      </div>

    </div>
  );
};
