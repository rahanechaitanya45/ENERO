import React, { useState } from 'react';
import { 
  Zap, 
  Plus, 
  SlidersHorizontal, 
  Settings, 
  RotateCcw, 
  Menu, 
  X,
  FileText
} from 'lucide-react';
import { TariffConfig } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddAppliance: () => void;
  onOpenTariffModal: () => void;
  onOpenAboutModal: () => void;
  onResetDemo: () => void;
  tariff: TariffConfig;
  totalApplianceCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onAddAppliance,
  onOpenTariffModal,
  onOpenAboutModal,
  onResetDemo,
  tariff,
  totalApplianceCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'appliances', label: `Appliances (${totalApplianceCount})` },
    { id: 'analysis', label: 'Consumers' },
    { id: 'simulator', label: 'Simulator' },
    { id: 'recommendations', label: 'Energy Plan' },
    { id: 'history', label: 'History' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single text element Brand wordmark with icon */}
          <button 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2 group text-left transition-opacity hover:opacity-90"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                ENERO
                <span className="text-[10px] uppercase font-semibold tracking-wider text-cyan-600 bg-cyan-50 border border-cyan-200/60 px-1.5 py-0.2 rounded">
                  ESTIMATOR
                </span>
              </span>
            </div>
          </button>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-100 text-cyan-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary actions & utility triggers */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onOpenTariffModal}
              title="Configure electricity tariff & slabs"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Tariff: {tariff.currency}{tariff.mode === 'flat' ? `${tariff.flatRate}/kWh` : 'Slabs'}
              </span>
            </button>

            <button
              onClick={onOpenAboutModal}
              title="About ENERO and calculation formulas"
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
            </button>

            <button
              onClick={onResetDemo}
              title="Reset with sample appliances"
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onAddAppliance}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Appliance</span>
            </button>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onAddAppliance}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-cyan-50 text-cyan-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <button
              onClick={() => {
                onOpenTariffModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 p-1.5 hover:text-slate-900 font-medium"
            >
              <Settings className="w-3.5 h-3.5" />
              Tariff ({tariff.currency}{tariff.mode === 'flat' ? `${tariff.flatRate}/kWh` : 'Slabs'})
            </button>
            <button
              onClick={() => {
                onOpenAboutModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 p-1.5 hover:text-slate-900 font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              About & Math
            </button>
            <button
              onClick={() => {
                onResetDemo();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 p-1.5 text-slate-500 hover:text-slate-900 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Demo Data
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
