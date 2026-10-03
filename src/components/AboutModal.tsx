import React from 'react';
import { 
  X, 
  Zap, 
  ShieldCheck, 
  Calculator, 
  HelpCircle, 
  CheckCircle2,
  FileText
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Zap className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">About ENERO</h3>
              <p className="text-xs text-slate-400">KNOW BEFORE THE BILL ⚡</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-600 leading-relaxed">
          
          {/* Mission */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Why ENERO Was Created</span>
            </h4>
            <p>
              Most households and tenants only discover how much power they have consumed when their utility bill lands at month's end. By then, it is too late to make changes.
            </p>
            <p>
              ENERO was engineered to solve this through <strong>predictive behavioral modeling</strong>: by entering your appliances, wattage, and average daily hours, you gain clarity on your estimated bill and discover exactly which equipment is driving your expenses.
            </p>
          </div>

          {/* Transparent Calculation Math */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-cyan-600" />
              <span>Transparent Calculation Formula</span>
            </span>
            <div className="p-3 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
              <div className="text-cyan-800 font-bold">Appliance Monthly kWh:</div>
              <div>= [ Power Rating (Watts) × Quantity × Hours/Day × Days/Month ] ÷ 1000</div>
              <div className="pt-2 text-cyan-800 font-bold">Estimated Electricity Bill:</div>
              <div>= [ Total Monthly kWh × Applicable Tariff Rate ] + Fixed Charges + Taxes</div>
            </div>
            <p className="text-[11px] text-slate-500">
              Units are in standard kilowatt-hours (kWh), equivalent to 1 official billing unit on most global utility meters.
            </p>
          </div>

          {/* Why No Hardware / ESP32 Needed */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900">
              Why We Don't Require Smart Plugs or IoT Hardware
            </h4>
            <p>
              Smart plugs and meter clamp sensors are expensive, require electricians, and fail across high-amperage appliances like 1.5-ton ACs or geysers. ENERO delivers 90%+ realistic insights using user-driven data that works instantly without hardware costs or invasive home setup.
            </p>
          </div>

          {/* Official Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 space-y-1.5">
            <span className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Official Regulatory Disclaimer</span>
            </span>
            <p className="text-[11px] text-amber-900 leading-normal">
              ENERO provides an estimated electricity consumption and bill. Actual electricity bills may vary depending on electricity-provider tariffs, slabs, fixed charges, taxes, subsidies, fuel adjustments, and other applicable charges. ENERO never promises guaranteed savings.
            </p>
          </div>

          {/* Privacy Note */}
          <div className="pt-1 flex items-center gap-2 text-slate-500 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All your data is stored securely in your local browser session. No personal tracking.</span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
