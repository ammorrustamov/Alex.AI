import React, { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ReceptionistSimulatorPage from './pages/ReceptionistSimulatorPage';
import EscalationsPage from './pages/EscalationsPage';
import VoiceIntegrationsPage from './pages/VoiceIntegrationsPage';
import { useStats } from './hooks/useStats';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { stats, refreshStats } = useStats();

  return (
    <MainLayout
      activeTab={activeTab}
      onSelectTab={(tab) => {
        setActiveTab(tab);
        refreshStats();
      }}
      stats={stats}
    >
      {activeTab === 'dashboard' && (
        <DashboardPage
          onNavigateToSimulator={() => setActiveTab('simulator')}
        />
      )}

      {activeTab === 'simulator' && (
        <ReceptionistSimulatorPage
          onNavigateToDashboard={() => setActiveTab('dashboard')}
        />
      )}

      {activeTab === 'escalations' && (
        <EscalationsPage />
      )}

      {activeTab === 'voice' && (
        <VoiceIntegrationsPage />
      )}
    </MainLayout>
  );
}
