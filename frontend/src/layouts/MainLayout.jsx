import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Bot,
  AlertTriangle,
  Radio,
  Phone,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Server,
  Building2,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function MainLayout({
  activeTab,
  onSelectTab,
  stats,
  children
}) {
  const [health, setHealth] = useState(null);
  const [dismissSafetyBanner, setDismissSafetyBanner] = useState(false);

  useEffect(() => {
    api.getHealth()
      .then(res => setHealth(res))
      .catch(() => {});
  }, []);

  const hasSafetyAlert = (stats?.safetyAlertsCount || 0) > 0;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="brand-logo-icon">
            <Bot size={22} />
          </div>
          <div>
            <div className="brand-title">AlexDesk AI</div>
            <div className="brand-subtitle">HVAC Lead Dispatch</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab('dashboard')}
          >
            <div className="nav-label-group">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </div>
            {stats?.totalLeads !== undefined && (
              <span className="nav-pill">{stats.totalLeads}</span>
            )}
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => onSelectTab('simulator')}
          >
            <div className="nav-label-group">
              <Bot size={18} />
              <span>AI Receptionist</span>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                background: 'rgba(14, 165, 233, 0.2)',
                color: 'var(--brand-cyan)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700
              }}
            >
              LIVE
            </span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'escalations' ? 'active' : ''}`}
            onClick={() => onSelectTab('escalations')}
          >
            <div className="nav-label-group">
              <AlertTriangle size={18} />
              <span>Escalations</span>
            </div>
            {(stats?.escalatedCount || 0) > 0 && (
              <span className="nav-pill urgent">{stats.escalatedCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'voice' ? 'active' : ''}`}
            onClick={() => onSelectTab('voice')}
          >
            <div className="nav-label-group">
              <Radio size={18} />
              <span>Voice / Twilio</span>
            </div>
          </button>
        </nav>

        {/* Sidebar Business Card Footer */}
        <div className="sidebar-footer">
          <div className="business-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} color="var(--brand-cyan)" />
              <div className="business-name">{health?.company?.name || 'Apex Comfort HVAC'}</div>
            </div>
            <div className="business-status">
              <span className="status-dot-pulse" />
              <span>Alex Receptionist Online</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              DB: {health?.databaseMode === 'postgres' ? 'PostgreSQL 16' : 'PostgreSQL Local Engine'}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <h1 style={{ fontSize: '1.1rem', color: '#fff' }}>
              {activeTab === 'dashboard' && 'Lead Management & Dispatch Center'}
              {activeTab === 'simulator' && 'AI Receptionist Live Simulator'}
              {activeTab === 'escalations' && 'Human Escalation & Safety Incident Queue'}
              {activeTab === 'voice' && 'Telephony & Twilio Voice Integration Hub'}
            </h1>
            <div className="header-title-badge">
              <span>Apex Comfort Heating & Air</span>
            </div>
          </div>

          <div className="header-right">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                color: '#fca5a5'
              }}
            >
              <ShieldAlert size={14} color="#ef4444" />
              <span>Emergency Gas Utility: (866) 322-8667</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                color: 'var(--brand-cyan)'
              }}
            >
              <Phone size={13} />
              <span>Office: (555) 349-2665</span>
            </div>
          </div>
        </header>

        {/* Global Emergency Alert Ticker (Active when safety incidents exist) */}
        {hasSafetyAlert && !dismissSafetyBanner && (
          <div className="emergency-banner">
            <div className="emergency-banner-content">
              <ShieldAlert size={18} />
              <span>
                <strong>CRITICAL SAFETY ALERT ACTIVE:</strong> {stats.safetyAlertsCount} emergency incident(s) reported (gas odor / carbon monoxide hazard). Immediate evacuation protocol applies.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '3px 9px', fontSize: '0.74rem', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff' }}
                onClick={() => onSelectTab('escalations')}
              >
                View Incident Queue
              </button>
              <button
                type="button"
                onClick={() => setDismissSafetyBanner(true)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
