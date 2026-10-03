import React from 'react';
import { 
  Home, 
  Layers, 
  BarChart3, 
  Sliders, 
  History, 
  User,
  LogIn,
  Zap,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  applianceCount: number;
}

interface NavTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  setActiveTab,
  applianceCount,
}) => {
  const { user } = useAuth();

  const authenticatedTabs: NavTab[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'appliances', label: 'Appliances', icon: Layers, badge: applianceCount },
    { id: 'simulator', label: 'Simulator', icon: Sliders },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const unauthenticatedTabs: NavTab[] = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: Info },
    { id: 'login', label: 'Log In', icon: LogIn },
    { id: 'signup', label: 'Sign Up', icon: Zap },
  ];

  const tabs: NavTab[] = user ? authenticatedTabs : unauthenticatedTabs;


  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden no-print safe-area-pb">
      <div className={`grid ${user ? 'grid-cols-5' : 'grid-cols-4'} h-14`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center relative transition-colors cursor-pointer ${
                isActive ? 'text-cyan-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 text-[9px] font-mono font-bold bg-cyan-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[55px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
