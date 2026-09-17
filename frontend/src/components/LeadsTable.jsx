import React from 'react';
import {
  Flame,
  Sun,
  Snowflake,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  UserCheck,
  UserX,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export default function LeadsTable({
  leads = [],
  loading,
  onSelectLead,
  onUpdateStatus,
  onToggleContacted,
  onOpenEscalate
}) {
  if (loading && leads.length === 0) {
    return (
      <div className="table-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading HVAC service leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="table-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No leads match the current filters.</p>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginTop: '6px' }}>
          Try clearing search filters or simulate a customer inquiry in the AI Receptionist tab.
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="leads-table">
        <thead>
          <tr>
            <th>Priority</th>
            <th>Customer & Contact</th>
            <th>HVAC Service & Issue</th>
            <th>Preferred Time</th>
            <th>Status</th>
            <th>Contacted</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const isHot = lead.lead_priority === 'HOT';
            const isWarm = lead.lead_priority === 'WARM';
            const isCold = lead.lead_priority === 'COLD';

            return (
              <tr key={lead.id}>
                {/* Priority */}
                <td>
                  <span className={`badge-priority ${lead.lead_priority?.toLowerCase()}`}>
                    {isHot && <Flame size={13} />}
                    {isWarm && <Sun size={13} />}
                    {isCold && <Snowflake size={13} />}
                    {lead.lead_priority}
                  </span>

                  {lead.safety_alert && (
                    <div style={{ marginTop: '4px' }}>
                      <span
                        className="badge-priority hot"
                        style={{ background: '#b91c1c', color: '#fff', fontSize: '0.65rem' }}
                        title="Critical Safety Hazard (Gas/CO/Fire)"
                      >
                        <ShieldAlert size={11} /> SAFETY
                      </span>
                    </div>
                  )}
                </td>

                {/* Customer Contact */}
                <td>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
                    {lead.customer_name}
                    {lead.is_demo && (
                      <span
                        style={{
                          marginLeft: '6px',
                          fontSize: '0.68rem',
                          background: 'rgba(255,255,255,0.08)',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          color: 'var(--text-dim)'
                        }}
                      >
                        DEMO
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--brand-cyan)', fontSize: '0.8rem', marginTop: '2px' }}>
                    <Phone size={12} />
                    <span>{lead.phone_number || 'No phone captured'}</span>
                  </div>

                  {lead.service_address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '2px' }}>
                      <MapPin size={12} />
                      <span style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lead.service_address}
                      </span>
                    </div>
                  )}
                </td>

                {/* HVAC Issue */}
                <td style={{ maxWidth: '280px' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      color: 'var(--text-muted)',
                      marginBottom: '4px'
                    }}
                  >
                    {lead.hvac_service_type || 'HVAC Repair'}
                  </div>

                  <div
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.35'
                    }}
                  >
                    {lead.problem_description || 'No description provided'}
                  </div>
                </td>

                {/* Preferred Time & Timing */}
                <td style={{ fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-main)', fontWeight: 500 }}>
                    <Clock size={12} color="var(--brand-cyan)" />
                    <span>{lead.preferred_service_time || 'ASAP / Flexible'}</span>
                  </div>

                  {lead.problem_started && (
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.74rem', marginTop: '2px' }}>
                      Started: {lead.problem_started}
                    </div>
                  )}
                </td>

                {/* Status Dropdown */}
                <td>
                  <select
                    className={`badge-status ${lead.lead_status}`}
                    value={lead.lead_status}
                    onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      outline: 'none',
                      padding: '4px 8px'
                    }}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="escalated">Escalated</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>

                {/* Contacted Toggle */}
                <td>
                  <button
                    type="button"
                    onClick={() => onToggleContacted(lead.id, lead.is_contacted)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: lead.is_contacted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: lead.is_contacted ? '#34d399' : 'var(--text-dim)'
                    }}
                    title="Click to toggle contacted status"
                  >
                    {lead.is_contacted ? (
                      <>
                        <UserCheck size={13} />
                        <span>Yes</span>
                      </>
                    ) : (
                      <>
                        <UserX size={13} />
                        <span>No</span>
                      </>
                    )}
                  </button>
                </td>

                {/* Actions */}
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    {!lead.is_escalated && lead.lead_status !== 'escalated' && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '4px 9px', fontSize: '0.74rem' }}
                        onClick={() => onOpenEscalate(lead)}
                        title="Escalate lead to human technician or dispatcher"
                      >
                        <AlertTriangle size={12} color="#f59e0b" />
                        <span>Escalate</span>
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '5px 11px', fontSize: '0.76rem' }}
                      onClick={() => onSelectLead(lead.id)}
                    >
                      <span>Details</span>
                      <ArrowUpRight size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
