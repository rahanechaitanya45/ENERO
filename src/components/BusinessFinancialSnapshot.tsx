import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Layers, 
  Target, 
  ShieldAlert, 
  BarChart3, 
  ArrowLeft,
  Building,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { EneroLogo } from './EneroLogo';

interface BusinessFinancialSnapshotProps {
  onBack: () => void;
}

export const BusinessFinancialSnapshot: React.FC<BusinessFinancialSnapshotProps> = ({ onBack }) => {
  const startupCosts = [
    { head: 'Development Cost', amount: 55000, type: 'Fixed' },
    { head: 'Cloud & Server Cost (1 Year)', amount: 12000, type: 'Variable' },
    { head: 'Marketing & Promotion', amount: 20000, type: 'Fixed' },
    { head: 'Installation & Setup', amount: 15000, type: 'Variable' },
    { head: 'Miscellaneous', amount: 8000, type: 'Fixed' },
  ];

  const totalStartupCost = 110000;

  const projections = [
    { month: 'Month 1', customers: 10, revenue: 5990 },
    { month: 'Month 2', customers: 20, revenue: 11980 },
    { month: 'Month 3', customers: 30, revenue: 17970 },
    { month: 'Month 4', customers: 40, revenue: 23960 },
    { month: 'Month 5', customers: 50, revenue: 29950 },
    { month: 'Month 6', customers: 60, revenue: 35940 },
  ];

  const total6MonthRevenue = 125790;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 pb-16">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Internal Business Document · Confidential
        </span>
      </div>

      {/* Main Snapshot Header replicating Part B Document */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <EneroLogo variant="horizontal" size="lg" showTagline={true} />
          </div>

          <div className="text-left md:text-right space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
              PART B
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              FINANCIAL SNAPSHOT
            </h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              SMART ENERGY MONITORING SYSTEM
            </p>
          </div>
        </div>

        {/* 2x2 Grid from the Business Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SECTION 1: STARTUP COSTS */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
            <div className="bg-[#0b3b82] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white text-[#0b3b82] font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold tracking-wide uppercase">
                  Startup Costs
                </h3>
              </div>
              <span className="text-[11px] text-sky-200">Estimate initial costs</span>
            </div>

            <div className="p-4 space-y-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold text-left">
                    <th className="pb-2">Cost Head</th>
                    <th className="pb-2 text-right">Estimated Cost (₹)</th>
                    <th className="pb-2 text-right">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {startupCosts.map((c) => (
                    <tr key={c.head} className="text-slate-700">
                      <td className="py-2 font-medium">{c.head}</td>
                      <td className="py-2 text-right font-mono font-semibold">₹{c.amount.toLocaleString()}</td>
                      <td className="py-2 text-right text-slate-500">{c.type}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-300 font-bold text-slate-900 bg-slate-50">
                    <td className="py-2.5 px-1 uppercase tracking-wider text-[11px]">Total Startup Cost</td>
                    <td className="py-2.5 px-1 text-right font-mono text-sm text-[#0b3b82]">
                      ₹{totalStartupCost.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-1 text-right text-slate-400">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: PRICING STRATEGY */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs flex flex-col justify-between">
            <div>
              <div className="bg-[#0b3b82] text-white px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white text-[#0b3b82] font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-sm font-bold tracking-wide uppercase">
                    Pricing Strategy
                  </h3>
                </div>
                <span className="text-[11px] text-sky-200">Model & justification</span>
              </div>

              <div className="p-4 space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold">
                    <div className="flex items-center gap-2 text-slate-800">
                      <Calendar className="w-4 h-4 text-[#0b3b82]" />
                      <span>Monthly Subscription</span>
                    </div>
                    <span className="font-mono text-slate-900">₹599 / customer / month</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold">
                    <div className="flex items-center gap-2 text-slate-800">
                      <span className="w-4 h-4 text-center">👤</span>
                      <span>Basic Monitoring</span>
                    </div>
                    <span className="font-mono text-emerald-700">Free</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-200 font-semibold">
                    <div className="flex items-center gap-2 text-cyan-950">
                      <span className="w-4 h-4 text-center">👑</span>
                      <span>Premium Features</span>
                    </div>
                    <span className="font-mono text-cyan-900">₹599 / month</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-950 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Justification:</span>
                  </span>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Affordable subscription pricing provides continuous revenue while keeping the service accessible to customers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: BREAK-EVEN ANALYSIS */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
            <div className="bg-[#0b3b82] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white text-[#0b3b82] font-black text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-bold tracking-wide uppercase">
                  Break-Even Analysis
                </h3>
              </div>
              <span className="text-[11px] text-sky-200">Basic cost vs sales</span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 text-slate-500">Initial Cost</td>
                    <td className="py-2 text-right font-mono font-bold text-slate-900">₹1,10,000</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-500">Monthly Subscription</td>
                    <td className="py-2 text-right font-mono font-bold text-slate-900">₹599</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-500">Customer-Months for Break-even</td>
                    <td className="py-2 text-right font-mono font-bold text-slate-900">≈ 184</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-2 text-slate-900">Expected Break-even</td>
                    <td className="py-2 text-right font-mono text-[#0b3b82]">Around 6 – 7 months</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-emerald-950 leading-snug">
                  Reach break-even and start generating profit in 6–7 months!
                </h4>
                <span className="text-[10px] text-emerald-700 block font-semibold uppercase tracking-wider">
                  PROJECTED BREAK-EVEN
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: 6-MONTH REVENUE PROJECTION */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
            <div className="bg-[#0b3b82] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white text-[#0b3b82] font-black text-xs flex items-center justify-center">
                  4
                </span>
                <h3 className="text-sm font-bold tracking-wide uppercase">
                  6-Month Revenue Projection
                </h3>
              </div>
              <span className="text-[11px] text-sky-200">Expected sales & income</span>
            </div>

            <div className="p-4 space-y-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold text-left">
                    <th className="pb-1.5">Month</th>
                    <th className="pb-1.5 text-center">Active Customers</th>
                    <th className="pb-1.5 text-right">Monthly Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projections.map((p) => (
                    <tr key={p.month} className="text-slate-700">
                      <td className="py-1.5 font-medium">{p.month}</td>
                      <td className="py-1.5 text-center font-mono">{p.customers}</td>
                      <td className="py-1.5 text-right font-mono font-semibold">₹{p.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-300 font-bold text-slate-900 bg-emerald-50">
                    <td className="py-2 px-1 uppercase tracking-wider text-[11px]">Total</td>
                    <td className="py-2 px-1 text-center font-mono">-</td>
                    <td className="py-2 px-1 text-right font-mono text-sm text-emerald-800">
                      ₹{total6MonthRevenue.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 rounded-xl bg-emerald-700 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">
                    Total Estimated 6-Month Revenue
                  </span>
                  <span className="text-lg font-black font-mono">₹{total6MonthRevenue.toLocaleString()}</span>
                </div>
                <TrendingUp className="w-6 h-6 text-emerald-200" />
              </div>
            </div>
          </div>

        </div>

        {/* Chart representation */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Projected Customer & Revenue Growth Trajectory
          </span>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit=" ₹" />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#0b3b82" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
