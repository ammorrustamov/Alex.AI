import React, { useState } from 'react';
import { X, AlertTriangle, UserCheck, ShieldAlert } from 'lucide-react';

export default function EscalateModal({ lead, onClose, onConfirm }) {
  const [assignedTo, setAssignedTo] = useState('Senior Dispatcher Dave');
  const [reason, setReason] = useState(
    lead?.safety_alert
      ? 'CRITICAL SAFETY: Gas smell / hazardous condition reported by customer'
      : 'Complex HVAC system issue / customer requested live human agent'
  );
  const [urgency, setUrgency] = useState(lead?.lead_priority === 'HOT' ? 'urgent' : 'high');
  const [submitting, setSubmitting] = useState(false);

  if (!lead) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onConfirm(lead.id, {
        assigned_to: assignedTo,
        reason,
        urgency
      });
      onClose();
    } catch (err) {
      alert('Failed to escalate lead: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={18} color="#ef4444" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Escalate Lead to Human Staff</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Handoff from AI Receptionist Alex to On-Duty Personnel
              </span>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="lead-preview-field">
              <span className="field-label">Target Customer</span>
              <div className="field-value" style={{ fontWeight: 600 }}>
                {lead.customer_name} ({lead.phone_number || 'No phone'})
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Issue: {lead.problem_description || lead.hvac_service_type}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Assign To Dispatcher / Technician
              </label>
              <select
                className="select-input"
                style={{ width: '100%' }}
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="Senior Dispatcher Dave">Senior Dispatcher Dave (Emergency Desk)</option>
                <option value="Lead Tech Marcus (Truck #4)">Lead Tech Marcus (Truck #4 - Emergency Heat)</option>
                <option value="Safety Coordinator Sarah">Safety Coordinator Sarah (Hazards & Gas)</option>
                <option value="Estimator Jason">Estimator Jason (System Quotes & Replacements)</option>
                <option value="General On-Call Queue">General On-Call Queue</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Urgency Level
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['urgent', 'high', 'standard'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      border: '1px solid',
                      background: urgency === lvl ? (lvl === 'urgent' ? 'var(--hot-bg)' : 'var(--bg-card-hover)') : 'var(--bg-surface)',
                      borderColor: urgency === lvl ? (lvl === 'urgent' ? '#ef4444' : 'var(--brand-primary)') : 'var(--border-subtle)',
                      color: urgency === lvl ? '#fff' : 'var(--text-muted)'
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Escalation Reason & Context
              </label>
              <textarea
                className="chat-input"
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={submitting}>
              <AlertTriangle size={14} />
              <span>{submitting ? 'Escalating...' : 'Confirm Escalation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
