import React, { useState } from 'react';
import StatsCards from '../components/StatsCards';
import LeadsFilterBar from '../components/LeadsFilterBar';
import LeadsTable from '../components/LeadsTable';
import LeadDetailModal from '../components/LeadDetailModal';
import EscalateModal from '../components/EscalateModal';
import { useLeads } from '../hooks/useLeads';
import { useStats } from '../hooks/useStats';
import { Bot, Sparkles, PhoneCall, Plus } from 'lucide-react';

export default function DashboardPage({ onNavigateToSimulator }) {
  const {
    leads,
    loading: leadsLoading,
    filters,
    setFilters,
    refreshLeads,
    updateStatus,
    toggleContacted,
    escalate
  } = useLeads();

  const { stats, refreshStats } = useStats();

  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [escalatingLead, setEscalatingLead] = useState(null);

  const handlePriorityFilter = (priority) => {
    setFilters(prev => ({ ...prev, priority }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleRefreshAll = () => {
    refreshLeads();
    refreshStats();
  };

  const handleEscalateConfirm = async (id, data) => {
    await escalate(id, data);
    refreshStats();
  };

  const handleStatusUpdated = () => {
    refreshLeads();
    refreshStats();
  };

  return (
    <div className="content-page">
      {/* Top Banner / Call-to-Action */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
          border: '1px solid var(--border-highlight)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)'
            }}
          >
            <Bot size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>
              Alex AI Receptionist is Active & Answering
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Automatically qualifying leads, screening safety hazards, and assigning priority dispatch 24/7.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onNavigateToSimulator}
          style={{ padding: '10px 20px' }}
        >
          <Sparkles size={16} />
          <span>Launch AI Call & Chat Simulator</span>
        </button>
      </div>

      {/* KPI Stats Overview */}
      <StatsCards
        stats={stats}
        onFilterPriority={handlePriorityFilter}
        activePriority={filters.priority}
      />

      {/* Leads Filter Bar */}
      <LeadsFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefreshAll}
        loading={leadsLoading}
        counts={{
          totalLeads: stats?.totalLeads,
          hotLeads: stats?.hotLeads,
          warmLeads: stats?.warmLeads,
          coldLeads: stats?.coldLeads
        }}
      />

      {/* Leads Table */}
      <LeadsTable
        leads={leads}
        loading={leadsLoading}
        onSelectLead={(id) => setSelectedLeadId(id)}
        onUpdateStatus={async (id, status) => {
          await updateStatus(id, status);
          refreshStats();
        }}
        onToggleContacted={async (id, currentVal) => {
          await toggleContacted(id, currentVal);
          refreshStats();
        }}
        onOpenEscalate={(lead) => setEscalatingLead(lead)}
      />

      {/* Lead Detail Modal */}
      {selectedLeadId && (
        <LeadDetailModal
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onStatusUpdated={handleStatusUpdated}
          onOpenEscalate={(lead) => setEscalatingLead(lead)}
        />
      )}

      {/* Human Escalation Modal */}
      {escalatingLead && (
        <EscalateModal
          lead={escalatingLead}
          onClose={() => setEscalatingLead(null)}
          onConfirm={handleEscalateConfirm}
        />
      )}
    </div>
  );
}
