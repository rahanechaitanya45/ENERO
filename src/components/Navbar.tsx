import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Settings, 
  RotateCcw, 
  Menu, 
  X,
  FileText,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Layers,
  BarChart3,
  Sliders
} from 'lucide-react';
import { TariffConfig, UserSubscription } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { EneroLogo } from './EneroLogo';
import { subscriptionService } from '../services/subscriptionService';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddAppliance: () => void;
  onOpenTariffModal: () => void;
  onOpenAboutModal: () => void;
  onResetDemo: () => void;
  tariff: TariffConfig;
  totalApplianceCount: number;
  subscription: UserSubscription;
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
  subscription,
}) => {
  const { user, profile, signOut, isDemoMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isPremium = subscriptionService.isPremium(subscription);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initials for avatar
  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Navigation Links based on authentication status (Section 12)
  const loggedInLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'appliances', label: `My Appliances (${totalApplianceCount})` },
    { id: 'analysis', label: 'Consumers' },
    { id: 'simulator', label: 'Savings Simulator' },
    { id: 'recommendations', label: 'Insights' },
    { id: 'history', label: 'History' },
    { id: 'pricing', label: 'Pricing' },
  ];

  const loggedOutLinks = [
    { id: 'landing', label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'about', label: 'About' },
  ];

  const navLinks = user ? loggedInLinks : loggedOutLinks;

  const handleNavClick = (id: string) => {
    if (id === 'how-it-works' || id === 'features' || id === 'about') {
      setActiveTab('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      setActiveTab(id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Official ENERO Logo */}
          <button 
            onClick={() => setActiveTab(user ? 'dashboard' : 'landing')}
            className="flex items-center group text-left transition-opacity hover:opacity-90 cursor-pointer"
          >
            <EneroLogo variant="horizontal" size="sm" />
          </button>


          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
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

          {/* Zone 3: Primary actions & User Menu */}
          <div className="hidden sm:flex items-center gap-2.5">
            {user ? (
              /* Authenticated User Menu (Section 13) */
              <>
                <button
                  onClick={onOpenTariffModal}
                  title="Configure electricity tariff & slabs"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Tariff: {tariff.currency}{tariff.mode === 'flat' ? `${tariff.flatRate}/kWh` : 'Slabs'}
                  </span>
                </button>

                <button
                  onClick={onAddAppliance}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Appliance</span>
                </button>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                    aria-label="User menu"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 text-white font-bold text-xs flex items-center justify-center">
                      {initials}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu (Section 13) */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Account</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isPremium ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isPremium ? 'PREMIUM ⚡' : 'FREE BASIC'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 truncate block mt-1">
                          {user.email || displayName}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab('dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                        <span>Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profile & Subscription</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('pricing');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-cyan-600" />
                        <span>{isPremium ? 'Plan & Benefits' : 'Upgrade to Premium (₹599)'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('financial-snapshot');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>Financial Snapshot (Part B)</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenTariffModal();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Settings</span>
                      </button>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={() => {
                          signOut();
                          setUserDropdownOpen(false);
                          setActiveTab('landing');
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}

                </div>
              </>
            ) : (
              /* Logged Out User Actions (Section 12) */
              <>
                <button
                  onClick={onOpenAboutModal}
                  title="About ENERO and formulas"
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab('login')}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Log In
                </button>

                <button
                  onClick={() => setActiveTab('signup')}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <span>Get Started</span>
                  <Zap className="w-3.5 h-3.5 fill-white text-white" />
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            {user ? (
              <button
                onClick={onAddAppliance}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 rounded-lg"
              >
                Log In
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
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
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2 text-left text-sm font-medium rounded-lg transition-colors cursor-pointer ${
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
            {user ? (
              <>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 p-1.5 text-cyan-800 font-bold"
                >
                  <User className="w-3.5 h-3.5" />
                  {displayName} (Profile)
                </button>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                    setActiveTab('landing');
                  }}
                  className="flex items-center gap-1.5 p-1.5 text-rose-600 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setActiveTab('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 p-1.5 text-slate-900 font-bold"
                >
                  Create Account
                </button>
                <button
                  onClick={() => {
                    setActiveTab('login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 p-1.5 text-cyan-700 font-bold"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
