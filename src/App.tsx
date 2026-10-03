/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
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

import { 
  Appliance, 
  TariffConfig, 
  HomeProfile, 
  HistorySnapshot 
} from './types';
import { 
  calculateTotalSummary, 
  generateSmartInsights 
} from './services/calculationService';
import { storageService } from './services/storageService';
import { DEFAULT_APPLIANCES } from './data/defaultData';

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('landing');

  // Persistent Domain States
  const [appliances, setAppliances] = useState<Appliance[]>(() => storageService.getAppliances());
  const [tariff, setTariff] = useState<TariffConfig>(() => storageService.getTariff());
  const [homeProfile, setHomeProfile] = useState<HomeProfile>(() => storageService.getHomeProfile());
  const [history, setHistory] = useState<HistorySnapshot[]>(() => storageService.getHistory());

  // Modal Dialog States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isApplianceModalOpen, setIsApplianceModalOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Cross-view linking
  const [simulationTargetId, setSimulationTargetId] = useState<string | null>(null);

  // Sync to local storage whenever state changes
  useEffect(() => {
    storageService.saveAppliances(appliances);
  }, [appliances]);

  useEffect(() => {
    storageService.saveTariff(tariff);
  }, [tariff]);

  useEffect(() => {
    storageService.saveHomeProfile(homeProfile);
  }, [homeProfile]);

  useEffect(() => {
    storageService.saveHistory(history);
  }, [history]);

  // Central Calculation Engine
  const { summary, rankedAppliances } = useMemo(() => {
    return calculateTotalSummary(appliances, tariff, homeProfile);
  }, [appliances, tariff, homeProfile]);

  const smartInsights = useMemo(() => {
    return generateSmartInsights(rankedAppliances, tariff, summary.totalMonthlyKwh);
  }, [rankedAppliances, tariff, summary.totalMonthlyKwh]);

  // Appliance CRUD Handlers
  const handleOpenAddAppliance = () => {
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
    const reset = storageService.resetToDemo();
    setAppliances(reset.appliances);
    setTariff(reset.tariff);
    setHomeProfile(reset.homeProfile);
    setHistory(reset.history);
  };

  const handlePopulateStarterAppliances = (newAppliances: Appliance[]) => {
    setAppliances(newAppliances);
  };

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
      />

      {/* Content View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        
        {activeTab === 'landing' && (
          <LandingPage
            onStartWizard={() => setIsWizardOpen(true)}
            onExploreDashboard={() => setActiveTab('dashboard')}
            summary={summary}
            tariff={tariff}
          />
        )}

        {activeTab === 'dashboard' && (
          <EnergyDashboard
            summary={summary}
            rankedAppliances={rankedAppliances}
            tariff={tariff}
            homeProfile={homeProfile}
            onNavigateTab={setActiveTab}
            onOpenTariffModal={() => setIsTariffModalOpen(true)}
          />
        )}

        {activeTab === 'appliances' && (
          <ApplianceList
            appliances={rankedAppliances}
            tariff={tariff}
            onAddAppliance={handleOpenAddAppliance}
            onEditAppliance={handleEditAppliance}
            onDeleteAppliance={handleDeleteAppliance}
            onDuplicateAppliance={handleDuplicateAppliance}
            onResetDemo={handleResetDemoData}
          />
        )}

        {activeTab === 'analysis' && (
          <ApplianceAnalysis
            rankedAppliances={rankedAppliances}
            tariff={tariff}
            totalMonthlyKwh={summary.totalMonthlyKwh}
            onSimulateAppliance={handleSimulateApplianceFromAnalysis}
          />
        )}

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

      {/* Footer */}
      <Footer
        onNavigateTab={setActiveTab}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onOpenTariffModal={() => setIsTariffModalOpen(true)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applianceCount={appliances.length}
      />

    </div>
  );
}
