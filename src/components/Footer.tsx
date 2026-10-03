import React from 'react';
import { Zap, Heart, Shield, HelpCircle } from 'lucide-react';

interface FooterProps {
  onNavigateTab: (tab: string) => void;
  onOpenAboutModal: () => void;
  onOpenTariffModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateTab,
  onOpenAboutModal,
  onOpenTariffModal,
}) => {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 text-xs no-print mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Zap className="w-4 h-4 fill-cyan-400" />
              </div>
              <span className="text-base font-bold tracking-tight text-white">
                ENERO
              </span>
            </div>
            <p className="text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              KNOW BEFORE THE BILL ⚡
            </p>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Helping households, apartments, students, and businesses understand their electricity before the utility bill arrives.
            </p>
          </div>

          {/* Nav links */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Application
            </span>
            <ul className="space-y-1.5 text-slate-300">
              <li>
                <button onClick={() => onNavigateTab('dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  Energy Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('appliances')} className="hover:text-white transition-colors cursor-pointer">
                  Appliance Inventory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('simulator')} className="hover:text-white transition-colors cursor-pointer">
                  Savings Simulator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('recommendations')} className="hover:text-white transition-colors cursor-pointer">
                  Personalized Energy Plan
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('history')} className="hover:text-white transition-colors cursor-pointer">
                  Usage History
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('pricing')} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer">
                  Plans & Pricing (₹599/mo)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('financial-snapshot')} className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">
                  Financial Snapshot (Part B)
                </button>
              </li>
            </ul>
          </div>

          {/* Tools & Legal */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Transparency
            </span>
            <ul className="space-y-1.5 text-slate-300">
              <li>
                <button onClick={onOpenAboutModal} className="hover:text-white transition-colors cursor-pointer">
                  Calculation Formula
                </button>
              </li>
              <li>
                <button onClick={onOpenTariffModal} className="hover:text-white transition-colors cursor-pointer">
                  Tariff Configuration
                </button>
              </li>
              <li>
                <button onClick={onOpenAboutModal} className="hover:text-white transition-colors cursor-pointer">
                  Regulatory Disclaimer
                </button>
              </li>
              <li>
                <span className="text-slate-500">Local Browser Storage Only</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} ENERO. All rights reserved. Calculations are approximate estimates.
          </div>
          <div>
            Built with modern precision for energy-conscious homes ⚡
          </div>
        </div>
      </div>
    </footer>
  );
};
