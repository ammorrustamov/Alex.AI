import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  MapPin,
  Clock,
  Calendar,
  Flame,
  Sun,
  Snowflake,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  Send,
  MessageSquare,
  Bot,
  User,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export default function LeadDetailModal({
  leadId,
  onClose,
  onStatusUpdated,
  onOpenEscalate
}) {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Dispatcher Mike');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchFullLead = async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const res = await api.getLeadById(leadId);
      setLead(res.data);
    } catch (err) {
      console.error('Error fetching full lead:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullLead();
  }, [leadId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmittingNote(true);
    try {
      await api.addLeadNote(leadId, { author: noteAuthor, note: newNote });
      setNewNote('');
      await fetchFullLead();
    } catch (err) {
      alert('Failed to save internal note: ' + err.message);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.updateLeadStatus(leadId, newStatus);
      setLead(prev => ({ ...prev, lead_status: newStatus }));
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleToggleContacted = async () => {
    try {
      const nextVal = !lead.is_contacted;
      await api.updateLeadContacted(leadId, nextVal);
      setLead(prev => ({ ...prev, is_contacted: nextVal }));
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      alert('Failed to update contacted state');
    }
  };

  if (!leadId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>
                  {loading ? 'Loading Lead Details...' : lead?.customer_name}
                </h3>
                {lead && (
                  <span className={`badge-priority ${lead.lead_priority?.toLowerCase()}`}>
                    {lead.lead_priority === 'HOT' && <Flame size={12} />}
                    {lead.lead_priority === 'WARM' && <Sun size={12} />}
                    {lead.lead_priority === 'COLD' && <Snowflake size={12} />}
                    {lead.lead_priority}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Lead ID: {leadId}
              </span>
            </div>
          </div>

          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {loading || !lead ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading lead details and conversation history...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Emergency Safety Alert Callout */}
              {lead.safety_alert && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    color: '#fca5a5',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <ShieldAlert size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.92rem' }}>
                      CRITICAL SAFETY INCIDENT REPORTED
                    </strong>
                    <p style={{ fontSize: '0.84rem', marginTop: '4px', lineHeight: 1.4 }}>
                      {lead.safety_notes || 'Customer reported dangerous conditions (gas smell, smoke, or carbon monoxide). Safety evacuation protocol was triggered.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Escalation Notice */}
              {lead.is_escalated && (
                <div
                  style={{
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={18} color="#f43f5e" />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fda4af' }}>
                        Escalated to: {lead.escalated_to || 'Human Dispatcher'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Reason: {lead.escalation_reason || 'Human agent requested'}
                      </div>
                    </div>
                  </div>
                  <span className="badge-status escalated">Escalated</span>
                </div>
              )}

              {/* Lead Details Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px'
                }}
              >
                <div className="lead-preview-field">
                  <span className="field-label">Customer Name</span>
                  <div className="field-value">{lead.customer_name}</div>
                </div>

                <div className="lead-preview-field">
                  <span className="field-label">Phone Number</span>
                  <div className="field-value" style={{ color: 'var(--brand-cyan)' }}>
                    {lead.phone_number || 'Not provided'}
                  </div>
                </div>

                <div className="lead-preview-field">
                  <span className="field-label">HVAC Service Category</span>
                  <div className="field-value">{lead.hvac_service_type || 'General Service'}</div>
                </div>

                <div className="lead-preview-field">
                  <span className="field-label">Preferred Service Window</span>
                  <div className="field-value">{lead.preferred_service_time || 'ASAP / Urgent'}</div>
                </div>

                <div className="lead-preview-field" style={{ gridColumn: 'span 2' }}>
                  <span className="field-label">Service Address</span>
                  <div className="field-value">{lead.service_address || 'No address captured yet'}</div>
                </div>

                <div className="lead-preview-field" style={{ gridColumn: 'span 2' }}>
                  <span className="field-label">When Problem Started</span>
                  <div className="field-value">{lead.problem_started || 'Not specified'}</div>
                </div>
              </div>

              {/* Problem Description */}
              <div className="lead-preview-field">
                <span className="field-label">Reported Problem Description</span>
                <div className="field-value" style={{ marginTop: '6px', lineHeight: 1.5 }}>
                  {lead.problem_description || 'No description recorded'}
                </div>
              </div>

              {/* AI Classification Rationale */}
              {lead.ai_classification_rationale && (
                <div
                  style={{
                    background: 'rgba(14, 165, 233, 0.07)',
                    border: '1px solid rgba(14, 165, 233, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px'
                  }}
                >
                  <span className="field-label" style={{ color: 'var(--brand-cyan)' }}>
                    🤖 AI Priority Rationale
                  </span>
                  <p style={{ fontSize: '0.84rem', color: '#e0f2fe', marginTop: '4px' }}>
                    {lead.ai_classification_rationale}
                  </p>
                </div>
              )}

              {/* Conversation Transcript */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <MessageSquare size={16} color="var(--brand-cyan)" />
                  <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>Customer & AI Receptionist Transcript</h4>
                </div>

                <div
                  style={{
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    maxHeight: '280px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {(lead.conversations || []).length === 0 ? (
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', textAlign: 'center' }}>
                      No conversation records logged for this lead.
                    </p>
                  ) : (
                    lead.conversations.map((msg, idx) => {
                      const isCustomer = msg.role === 'customer';
                      const isAlex = msg.role === 'alex_ai';

                      return (
                        <div
                          key={msg.id || idx}
                          style={{
                            display: 'flex',
                            gap: '10px',
                            maxWidth: '85%',
                            alignSelf: isCustomer ? 'flex-end' : 'flex-start',
                            flexDirection: isCustomer ? 'row-reverse' : 'row'
                          }}
                        >
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              background: isAlex ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : '#334155',
                              color: '#fff',
                              fontSize: '0.72rem'
                            }}
                          >
                            {isAlex ? <Bot size={14} /> : <User size={14} />}
                          </div>

                          <div>
                            <div
                              style={{
                                padding: '8px 12px',
                                borderRadius: '10px',
                                fontSize: '0.82rem',
                                lineHeight: '1.4',
                                background: isCustomer ? '#0284c7' : 'var(--bg-surface)',
                                color: '#fff',
                                border: isCustomer ? 'none' : '1px solid var(--border-subtle)'
                              }}
                            >
                              {msg.content}
                            </div>
                            <div
                              style={{
                                fontSize: '0.68rem',
                                color: 'var(--text-dim)',
                                marginTop: '2px',
                                textAlign: isCustomer ? 'right' : 'left'
                              }}
                            >
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Internal Staff Notes */}
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '10px' }}>
                  Internal Dispatcher & Staff Notes
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {(lead.notes || []).map((n) => (
                    <div
                      key={n.id}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 14px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <strong style={{ color: 'var(--brand-cyan)' }}>{n.author}</strong>
                        <span style={{ color: 'var(--text-dim)' }}>
                          {new Date(n.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '4px' }}>
                        {n.note}
                      </p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Add an internal dispatch note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingNote || !newNote.trim()}
                    style={{ padding: '8px 14px' }}
                  >
                    <Send size={14} />
                    <span>Add</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        {lead && (
          <div className="modal-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: 'auto' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Status:</span>
              <select
                className={`badge-status ${lead.lead_status}`}
                value={lead.lead_status}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="scheduled">Scheduled</option>
                <option value="escalated">Escalated</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleToggleContacted}
            >
              <UserCheck size={14} color={lead.is_contacted ? '#10b981' : 'currentColor'} />
              <span>{lead.is_contacted ? 'Mark Uncontacted' : 'Mark as Contacted'}</span>
            </button>

            {!lead.is_escalated && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  onClose();
                  onOpenEscalate(lead);
                }}
              >
                <AlertTriangle size={14} />
                <span>Escalate to Human</span>
              </button>
            )}

            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
