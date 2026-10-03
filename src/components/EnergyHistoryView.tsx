import React, { useState } from 'react';
import { 
  Calendar, 
  TrendingDown, 
  Plus, 
  Trash2, 
  BarChart3, 
  Check, 
  RotateCcw,
  Sparkles,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { HistorySnapshot, BillSummary, TariffConfig } from '../types';

interface EnergyHistoryViewProps {
  history: HistorySnapshot[];
  currentSummary: BillSummary;
  tariff: TariffConfig;
  onSaveCurrentAsSnapshot: (label: string, note?: string) => void;
  onDeleteSnapshot: (id: string) => void;
  onResetHistory: () => void;
}

export const EnergyHistoryView: React.FC<EnergyHistoryViewProps> = ({
  history,
  currentSummary,
  tariff,
  onSaveCurrentAsSnapshot,
  onDeleteSnapshot,
  onResetHistory,
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    onSaveCurrentAsSnapshot(newLabel.trim(), newNote.trim());
    setNewLabel('');
    setNewNote('');
    setIsAdding(false);
  };

  const chartData = history.map((h) => ({
    name: h.label,
    kwh: h.totalKwh,
    bill: h.estimatedBill,
  }));

  // Calculate overall improvement trend
  const first = history[0];
  const last = history[history.length - 1];
  const isImproving = first && last && last.totalKwh < first.totalKwh;
  const kwhDelta = first && last ? first.totalKwh - last.totalKwh : 0;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            My Energy History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track month-by-month estimates and check whether your energy consumption is improving
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Save Current as Snapshot</span>
          </button>
        </div>
      </div>

      {/* Snapshot creation drawer */}
      {isAdding && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl bg-cyan-50/60 border border-cyan-200/80 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-900">
              Save Active Model Snapshot ({currentSummary.totalMonthlyKwh} kWh / {tariff.currency}{currentSummary.totalEstimatedBill})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Snapshot label (e.g. October, Winter AC Off, Post-Solar)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-cyan-500"
            />
            <input
              type="text"
              placeholder="Optional notes (e.g. installed BLDC fans)"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-800 rounded-xl shadow-2xs cursor-pointer"
            >
              Save to History
            </button>
          </div>
        </form>
      )}

      {/* Trend Summary Metric Banner */}
      {history.length >= 2 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isImproving ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
            }`}>
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {isImproving
                  ? `Consumption Trend: Down by ${Math.round(kwhDelta)} kWh since ${first.label}`
                  : `Tracking ${history.length} snapshots across seasons`}
              </span>
              <p className="text-[11px] text-slate-500">
                Regularly recording monthly estimates keeps you accountable before the official bill arrives.
              </p>
            </div>
          </div>

          <button
            onClick={onResetHistory}
            className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Snapshots</span>
          </button>
        </div>
      )}

      {/* Historical Trend Charts */}
      {history.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Estimated Monthly Trend (kWh & Cost)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {history.length} recorded checkpoints
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit=" kWh" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs space-y-1 shadow-lg">
                          <span className="font-bold text-cyan-400 block">{data.name}</span>
                          <div className="font-mono">Estimated: {data.kwh} kWh</div>
                          <div className="font-mono text-emerald-400 font-bold">
                            Bill: {tariff.currency}{data.bill.toLocaleString()}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="kwh" 
                  stroke="#0284c7" 
                  strokeWidth={2.5} 
                  dot={{ fill: '#0284c7', r: 4 }} 
                  activeDot={{ r: 6, fill: '#0369a1' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {/* Historical Snapshots Table / Cards (Prompt Section 24) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-3">
          Saved Energy Snapshots
        </span>

        {history.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-500">
            No history saved yet. Click "Save Current as Snapshot" to preserve this month's estimate.
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    <Calendar className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.label}</h4>
                    {item.note && (
                      <p className="text-xs text-slate-500">{item.note}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs font-mono self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-slate-900 font-bold block">{item.totalKwh} kWh</span>
                    <span className="text-[10px] text-slate-400">consumption</span>
                  </div>

                  <div className="text-right">
                    <span className="text-cyan-800 font-bold block">
                      {tariff.currency}{item.estimatedBill.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">estimated</span>
                  </div>

                  <button
                    onClick={() => onDeleteSnapshot(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete snapshot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
