/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { LandingPage } from './components/LandingPage';
import { EnergyDashboard } from './components/EnergyDashboard';
import { ApplianceList } from './components/ApplianceList';
import { ApplianceAnalysis } from './components/ApplianceAnalysis';
import { SavingsSimulator } from './components/SavingsSimulator';
import { RecommendationsPlan } from './components/RecommendationsPlan';
import { EnergyHistoryView } from './components/EnergyHistoryView';
import { HomeSetupWizard } from './components/HomeSetupWizard';
import { ApplianceFormModal } from './components/ApplianceFormModal';
import { TariffSettingsModal } from './components/TariffSettingsModal';
import { AboutModal } from './components/AboutModal';
import { Footer } from './components/Footer';
import { MobileNavigation } from './components/MobileNavigation';

// Auth & Profile Components
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { EmailVerificationNotice } from './components/auth/EmailVerificationNotice';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { UserOnboardingWizard } from './components/auth/UserOnboardingWizard';
import { UserProfileView } from './components/profile/UserProfileView';
import { ChangePasswordModal } from './components/profile/ChangePasswordModal';

// Subscription, Pricing & Business Snapshot
import { PricingSection } from './components/PricingSection';
import { BusinessFinancialSnapshot } from './components/BusinessFinancialSnapshot';
import { PaymentCheckoutModal } from './components/PaymentCheckoutModal';
import { subscriptionService, SUBSCRIPTION_CONFIG } from './services/subscriptionService';

import { 
  Appliance, 
  TariffConfig, 
  HomeProfile, 
  HistorySnapshot, 
  HomeType,
  UserSubscription
} from './types';
import { 
  calculateTotalSummary, 
  generateSmartInsights 
} from './services/calculationService';
import { storageService } from './services/storageService';
import { DEFAULT_APPLIANCES } from './data/defaultData';
import { Zap, Loader2 } from 'lucide-react';

function EneroAppContent() {
  const { 
    user, 
    profile, 
    loading: authLoading, 
    unverifiedEmail, 
    clearUnverifiedEmail,
    isDemoMode,
    signOut
  } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('landing');

  // User-scoped data identifier: Firebase UID as unique ID (Section 10)
  const currentUserId = user ? user.uid : 'guest';

  // Persistent Domain States - Scoped strictly to current Firebase UID
  const [appliances, setAppliances] = useState<Appliance[]>(() => 
    storageService.getAppliances(currentUserId)
  );
  const [tariff, setTariff] = useState<TariffConfig>(() => 
    storageService.getTariff(currentUserId)
  );
  const [homeProfile, setHomeProfile] = useState<HomeProfile>(() => 
    storageService.getHomeProfile(currentUserId)
  );
  const [history, setHistory] = useState<HistorySnapshot[]>(() => 
    storageService.getHistory(currentUserId)
  );
  const [subscription, setSubscription] = useState<UserSubscription>(() => 
    subscriptionService.getSubscription(currentUserId)
  );

  // Modal Dialog States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isApplianceModalOpen, setIsApplianceModalOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Cross-view linking
  const [simulationTargetId, setSimulationTargetId] = useState<string | null>(null);

  // Reload user data whenever logged-in user changes (Strict Row-Level Isolation by Firebase UID)
  useEffect(() => {
    if (!authLoading) {
      const uId = user ? user.uid : 'guest';
      setAppliances(storageService.getAppliances(uId));
      setTariff(storageService.getTariff(uId));
      setHomeProfile(storageService.getHomeProfile(uId));
      setHistory(storageService.getHistory(uId));
      setSubscription(subscriptionService.getSubscription(uId));
    }
  }, [user?.uid, authLoading]);

  // Sync to user-scoped storage whenever state changes
  useEffect(() => {
    if (!authLoading) {
      storageService.saveAppliances(appliances, currentUserId);
    }
  }, [appliances, currentUserId, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      storageService.saveTariff(tariff, currentUserId);
    }
  }, [tariff, currentUserId, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      storageService.saveHomeProfile(homeProfile, currentUserId);
    }
  }, [homeProfile, currentUserId, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      storageService.saveHistory(history, currentUserId);
    }
  }, [history, currentUserId, authLoading]);

  // Protected route enforcement (Section 6 & 16)
  const protectedTabs = [
    'dashboard', 
    'appliances', 
    'analysis', 
    'simulator', 
    'recommendations', 
    'history', 
    'profile'
  ];

  useEffect(() => {
    if (!authLoading && !user && protectedTabs.includes(activeTab)) {
      setActiveTab('login');
    }
  }, [user, activeTab, authLoading]);

  // Central Calculation Engine
  const { summary, rankedAppliances } = useMemo(() => {
    return calculateTotalSummary(appliances, tariff, homeProfile);
  }, [appliances, tariff, homeProfile]);

  const smartInsights = useMemo(() => {
    return generateSmartInsights(rankedAppliances, tariff, summary.totalMonthlyKwh);
  }, [rankedAppliances, tariff, summary.totalMonthlyKwh]);

  // Appliance CRUD Handlers
  const handleOpenAddAppliance = () => {
    if (!user) {
      setActiveTab('login');
      return;
    }
    const check = subscriptionService.canAddAppliance(appliances.length, subscription);
    if (!check.allowed) {
      setIsCheckoutModalOpen(true);
      return;
    }
    setEditingAppliance(null);
    setIsApplianceModalOpen(true);
  };

  const handleEditAppliance = (app: Appliance) => {
    setEditingAppliance(app);
    setIsApplianceModalOpen(true);
  };

  const handleSaveAppliance = (app: Appliance) => {
    setAppliances((prev) => {
      const exists = prev.some((item) => item.id === app.id);
      if (exists) {
        return prev.map((item) => (item.id === app.id ? app : item));
      }
      return [app, ...prev];
    });
  };

  const handleDeleteAppliance = (id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDuplicateAppliance = (app: Appliance) => {
    const clone: Appliance = {
      ...app,
      id: `appliance-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${app.name} (Copy)`,
    };
    setAppliances((prev) => [clone, ...prev]);
  };

  // Simulation Handlers
  const handleSimulateApplianceFromAnalysis = (applianceId: string) => {
    setSimulationTargetId(applianceId);
    setActiveTab('simulator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplySimulatedScenario = (adjustedHours: Record<string, number>) => {
    setAppliances((prev) =>
      prev.map((app) => {
        if (adjustedHours[app.id] !== undefined) {
          return {
            ...app,
            hoursPerDay: adjustedHours[app.id],
          };
        }
        return app;
      })
    );
  };

  const handleSaveScenarioToHistory = (label: string, kwh: number, bill: number) => {
    const newSnapshot: HistorySnapshot = {
      id: `hist-${Date.now()}`,
      label,
      date: new Date().toISOString().split('T')[0],
      totalKwh: kwh,
      estimatedBill: bill,
      applianceCount: appliances.length,
      note: 'Simulated usage reduction scenario',
    };
    setHistory((prev) => [newSnapshot, ...prev]);
  };

  const handleSaveCurrentAsSnapshot = (label: string, note?: string) => {
    const newSnapshot: HistorySnapshot = {
      id: `hist-${Date.now()}`,
      label,
      date: new Date().toISOString().split('T')[0],
      totalKwh: summary.totalMonthlyKwh,
      estimatedBill: summary.totalEstimatedBill,
      applianceCount: appliances.length,
      note: note || `Recorded at ${tariff.currency}${summary.totalEstimatedBill}`,
    };
    setHistory((prev) => [newSnapshot, ...prev]);
  };

  const handleDeleteSnapshot = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const handleResetDemoData = () => {
    const reset = storageService.resetToDemo(currentUserId);
    setAppliances(reset.appliances);
    setTariff(reset.tariff);
    setHomeProfile(reset.homeProfile);
    setHistory(reset.history);
  };

  const handleClearUserData = () => {
    const cleared = storageService.clearAllUserData(currentUserId);
    setAppliances(cleared.appliances);
    setHistory(cleared.history);
  };

  const handlePopulateStarterAppliances = (newAppliances: Appliance[]) => {
    setAppliances(newAppliances);
  };

  const handleSaveProfileAndTariffFromOnboarding = (
    homeType: HomeType,
    occupants: number,
    provider: string,
    tariffRate: number,
    budget: number
  ) => {
    setHomeProfile({
      homeType,
      occupants,
      provider,
      targetMonthlyBudget: budget,
    });
    setTariff((prev) => ({
      ...prev,
      flatRate: tariffRate,
      providerName: provider,
    }));
  };

  // Loading Screen (Section 11 & 15)
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25 animate-pulse">
          <Zap className="w-7 h-7 fill-white" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-slate-900 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
            <span>Loading your energy data...</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono">Restoring secure session</p>
        </div>
      </div>
    );
  }

  // Email verification required screen (Section 4)
  if (unverifiedEmail) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <DisclaimerBanner />
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAddAppliance={handleOpenAddAppliance}
          onOpenTariffModal={() => setIsTariffModalOpen(true)}
          onOpenAboutModal={() => setIsAboutModalOpen(true)}
          onResetDemo={handleResetDemoData}
          tariff={tariff}
          totalApplianceCount={appliances.length}
          subscription={subscription}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <EmailVerificationNotice
            email={unverifiedEmail}
            onVerifiedContinue={() => {
              clearUnverifiedEmail();
              setActiveTab('onboarding');
            }}
          />
        </main>
      </div>
    );
  }

  // First-time Onboarding flow (Section 7)
  if (user && profile && !profile.hasCompletedOnboarding && activeTab === 'onboarding') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <DisclaimerBanner />
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAddAppliance={handleOpenAddAppliance}
          onOpenTariffModal={() => setIsTariffModalOpen(true)}
          onOpenAboutModal={() => setIsAboutModalOpen(true)}
          onResetDemo={handleResetDemoData}
          tariff={tariff}
          totalApplianceCount={appliances.length}
          subscription={subscription}
        />
        <main className="flex-1">
          <UserOnboardingWizard
            userName={profile.fullName}
            tariff={tariff}
            onSaveProfileAndTariff={handleSaveProfileAndTariffFromOnboarding}
            onAddInitialAppliances={handlePopulateStarterAppliances}
            onComplete={() => setActiveTab('dashboard')}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Top Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Navigation Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddAppliance={handleOpenAddAppliance}
        onOpenTariffModal={() => setIsTariffModalOpen(true)}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onResetDemo={handleResetDemoData}
        tariff={tariff}
        totalApplianceCount={appliances.length}
        subscription={subscription}
      />

      {/* Content View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        
        {/* PUBLIC ROUTE: Landing Page */}
        {activeTab === 'landing' && (
          <LandingPage
            onStartWizard={() => {
              if (user) {
                setIsWizardOpen(true);
              } else {
                setActiveTab('signup');
              }
            }}
            onExploreDashboard={() => {
              if (user) {
                setActiveTab('dashboard');
              } else {
                setActiveTab('login');
              }
            }}
            onSelectPlan={(plan) => {
              if (plan === 'premium') {
                if (!user) {
                  setActiveTab('signup');
                } else {
                  setIsCheckoutModalOpen(true);
                }
              } else {
                if (user) {
                  setActiveTab('dashboard');
                } else {
                  setActiveTab('signup');
                }
              }
            }}
            summary={summary}
            tariff={tariff}
          />
        )}

        {/* AUTH ROUTE: Login */}
        {activeTab === 'login' && (
          <LoginPage
            onNavigateToSignUp={() => setActiveTab('signup')}
            onNavigateToForgotPassword={() => setIsForgotPasswordOpen(true)}
            onSuccess={() => {
              if (profile && !profile.hasCompletedOnboarding) {
                setActiveTab('onboarding');
              } else {
                setActiveTab('dashboard');
              }
            }}
          />
        )}

        {/* AUTH ROUTE: Sign Up */}
        {activeTab === 'signup' && (
          <SignUpPage
            onNavigateToLogin={() => setActiveTab('login')}
            onSuccessVerificationRequired={() => {
              // handled automatically by unverifiedEmail state
            }}
            onSuccessImmediate={() => {
              setActiveTab('onboarding');
            }}
          />
        )}

        {/* PUBLIC ROUTE: Transparent Pricing & Business Model */}
        {activeTab === 'pricing' && (
          <PricingSection
            subscription={subscription}
            onSelectPlan={(plan) => {
              if (plan === 'premium') {
                if (!user) {
                  setActiveTab('signup');
                } else {
                  setIsCheckoutModalOpen(true);
                }
              } else {
                setActiveTab(user ? 'dashboard' : 'landing');
              }
            }}
            onNavigateToDashboard={() => setActiveTab(user ? 'dashboard' : 'landing')}
          />
        )}

        {/* PUBLIC/INTERNAL ROUTE: Part B Financial Snapshot */}
        {activeTab === 'financial-snapshot' && (
          <BusinessFinancialSnapshot
            onBack={() => setActiveTab(user ? 'dashboard' : 'landing')}
          />
        )}

        {/* PROTECTED ROUTE: Dashboard 🔐 */}
        {activeTab === 'dashboard' && (
          <EnergyDashboard
            summary={summary}
            rankedAppliances={rankedAppliances}
            tariff={tariff}
            homeProfile={homeProfile}
            subscription={subscription}
            onOpenUpgradeModal={() => setIsCheckoutModalOpen(true)}
            onNavigateTab={setActiveTab}
            onOpenTariffModal={() => setIsTariffModalOpen(true)}
            onAddAppliance={handleOpenAddAppliance}
            onLoadDemo={handleResetDemoData}
          />
        )}

        {/* PROTECTED ROUTE: Appliances 🔐 */}
        {activeTab === 'appliances' && (
          <ApplianceList
            appliances={rankedAppliances}
            tariff={tariff}
            subscription={subscription}
            onOpenUpgradeModal={() => setIsCheckoutModalOpen(true)}
            onAddAppliance={handleOpenAddAppliance}
            onEditAppliance={handleEditAppliance}
            onDeleteAppliance={handleDeleteAppliance}
            onDuplicateAppliance={handleDuplicateAppliance}
            onResetDemo={handleResetDemoData}
          />
        )}

        {/* PROTECTED ROUTE: Analysis / Biggest Consumers 🔐 */}
        {activeTab === 'analysis' && (
          <ApplianceAnalysis
            rankedAppliances={rankedAppliances}
            tariff={tariff}
            totalMonthlyKwh={summary.totalMonthlyKwh}
            onSimulateAppliance={handleSimulateApplianceFromAnalysis}
          />
        )}

        {/* PROTECTED ROUTE: Savings Simulator 🔐 */}
        {activeTab === 'simulator' && (
          <SavingsSimulator
            appliances={appliances}
            rankedAppliances={rankedAppliances}
            tariff={tariff}
            preselectedApplianceId={simulationTargetId}
            onApplyScenarioToLive={handleApplySimulatedScenario}
            onSaveScenarioToHistory={handleSaveScenarioToHistory}
          />
        )}

        {/* PROTECTED ROUTE: Recommendations Plan 🔐 */}
        {activeTab === 'recommendations' && (
          <RecommendationsPlan
            insights={smartInsights}
            rankedAppliances={rankedAppliances}
            summary={summary}
            tariff={tariff}
            homeProfile={homeProfile}
            onNavigateToSimulator={() => setActiveTab('simulator')}
          />
        )}

        {/* PROTECTED ROUTE: History 🔐 */}
        {activeTab === 'history' && (
          <EnergyHistoryView
            history={history}
            currentSummary={summary}
            tariff={tariff}
            onSaveCurrentAsSnapshot={handleSaveCurrentAsSnapshot}
            onDeleteSnapshot={handleDeleteSnapshot}
            onResetHistory={handleResetDemoData}
          />
        )}

        {/* PROTECTED ROUTE: Profile 🔐 */}
        {activeTab === 'profile' && (
          <UserProfileView
            tariff={tariff}
            subscription={subscription}
            onOpenChangePassword={() => setIsChangePasswordOpen(true)}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onClearUserData={handleClearUserData}
            onOpenUpgradeModal={() => setIsCheckoutModalOpen(true)}
            onOpenFinancialSnapshot={() => setActiveTab('financial-snapshot')}
          />
        )}

      </main>

      {/* Modals & Dialogs */}
      <HomeSetupWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        homeProfile={homeProfile}
        onSaveHomeProfile={setHomeProfile}
        tariff={tariff}
        onSaveTariff={setTariff}
        onPopulateStarterAppliances={handlePopulateStarterAppliances}
        onFinish={() => setActiveTab('dashboard')}
      />

      <ApplianceFormModal
        isOpen={isApplianceModalOpen}
        onClose={() => {
          setIsApplianceModalOpen(false);
          setEditingAppliance(null);
        }}
        onSave={handleSaveAppliance}
        editingAppliance={editingAppliance}
        tariff={tariff}
        currentTotalKwh={summary.totalMonthlyKwh}
      />

      <TariffSettingsModal
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
        tariff={tariff}
        onSaveTariff={setTariff}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onNavigateToLogin={() => setActiveTab('login')}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <PaymentCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        userId={currentUserId}
        userEmail={user?.email || 'user@enero.app'}
        onPaymentSuccess={(newSub) => {
          setSubscription(newSub);
          setActiveTab('dashboard');
        }}
      />

      {/* Footer */}
      <Footer
        onNavigateTab={(tab) => {
          if (!user && protectedTabs.includes(tab)) {
            setActiveTab('login');
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onOpenTariffModal={() => {
          if (!user) {
            setActiveTab('login');
          } else {
            setIsTariffModalOpen(true);
          }
        }}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (!user && protectedTabs.includes(tab)) {
            setActiveTab('login');
          } else {
            setActiveTab(tab);
          }
        }}
        applianceCount={appliances.length}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EneroAppContent />
    </AuthProvider>
  );
}
