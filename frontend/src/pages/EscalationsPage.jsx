import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Phone,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  ExternalLink,
  Flame,
  Check
} from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import LeadDetailModal from '../components/LeadDetailModal';

export default function EscalationsPage() {
  const { leads, loading, refreshLeads, updateStatus } = useLeads();
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  // Filter leads that are escalated or have safety alerts
  const escalatedLeads = leads.filter(l => l.is_escalated || l.lead_status === 'escalated' || l.safety_alert);

  return (
    <div className="content-page">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Human Escalation & Safety Incident Queue</h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          High-priority customer handoffs requiring immediate dispatcher attention or safety protocol coordination.
        </p>
      </div>

      {/* Safety Protocol Emergency Checklist Box */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(185, 28, 28, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: '28px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <ShieldAlert size={22} color="#ef4444" />
          <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>Standard Operating Safety Protocol (Gas / CO / Electrical)</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
            <strong style={{ color: '#fff', fontSize: '0.84rem' }}>1. Evacuation Confirmation</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
              Confirm caller is outdoors in fresh air. Verify no light switches or electrical sparks occurred.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
            <strong style={{ color: '#fff', fontSize: '0.84rem' }}>2. Utility & 911 Coordination</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
              Local Gas Utility: <strong>Atmos Energy (866) 322-8667</strong> or 911 for emergency response.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
            <strong style={{ color: '#fff', fontSize: '0.84rem' }}>3. Technician Standby</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
              Hold technician dispatch until first responders or gas utility have issued all-clear entry.
            </p>
          </div>
        </div>
      </div>

      {/* Escalated Leads Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading escalation queue...
        </div>
      ) : escalatedLeads.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '60px 20px',
            textAlign: 'center'
          }}
        >
          <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>All Escalations Handled</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '4px' }}>
            There are currently no pending human escalations or unresolved safety alerts.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {escalatedLeads.map((lead) => (
            <div
              key={lead.id}
              style={{
                background: 'var(--bg-card)',
                border: lead.safety_alert ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', maxWidth: '65%' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: lead.safety_alert ? 'rgba(239, 68, 68, 0.2)' : 'rgba(244, 63, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {lead.safety_alert ? (
                    <ShieldAlert size={22} color="#ef4444" />
                  ) : (
                    <AlertTriangle size={20} color="#f43f5e" />
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>{lead.customer_name}</h4>
                    <span className="badge-status escalated">
                      {lead.lead_status}
                    </span>
                    {lead.safety_alert && (
                      <span className="badge-priority hot">CRITICAL SAFETY</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: 'var(--brand-cyan)', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} /> {lead.phone_number || 'No phone'}
                    </span>
                    {lead.service_address && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-dim)' }}>
                        <MapPin size={12} /> {lead.service_address}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    <strong>Reason:</strong> {lead.escalation_reason || lead.problem_description}
                  </p>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Assigned To: <strong style={{ color: '#fff' }}>{lead.escalated_to || 'Senior Dispatcher'}</strong> •
                    Reported: {new Date(lead.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={async () => {
                    await updateStatus(lead.id, 'in_progress');
                    refreshLeads();
                  }}
                >
                  <Check size={14} />
                  <span>Mark In Progress</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setSelectedLeadId(lead.id)}
                >
                  <span>View Details & Notes</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedLeadId && (
        <LeadDetailModal
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onStatusUpdated={refreshLeads}
          onOpenEscalate={() => {}}
        />
      )}
    </div>
  );
}
