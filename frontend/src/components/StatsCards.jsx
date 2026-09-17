import React from 'react';
import { Flame, Sun, Snowflake, PhoneCall, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function StatsCards({ stats, onFilterPriority, activePriority }) {
  if (!stats) return null;

  const cards = [
    {
      id: 'HOT',
      title: 'HOT Leads',
      value: stats.hotLeads ?? 0,
      subtext: 'Outages, high urgency, ready to book',
      icon: <Flame size={18} color="#ef4444" />,
      theme: 'hot',
      clickable: true
    },
    {
      id: 'WARM',
      title: 'WARM Leads',
      value: stats.warmLeads ?? 0,
      subtext: 'Quotes, estimates, tune-ups',
      icon: <Sun size={18} color="#f59e0b" />,
      theme: 'warm',
      clickable: true
    },
    {
      id: 'COLD',
      title: 'COLD Leads',
      value: stats.coldLeads ?? 0,
      subtext: 'General inquiries, browsing',
      icon: <Snowflake size={18} color="#38bdf8" />,
      theme: 'cold',
      clickable: true
    },
    {
      id: 'ESCALATED',
      title: 'Human Escalations',
      value: stats.escalatedCount ?? 0,
      subtext: 'Requires dispatcher intervention',
      icon: <PhoneCall size={18} color="#f43f5e" />,
      theme: 'escalated',
      clickable: false
    },
    {
      id: 'SAFETY',
      title: 'Safety Alerts',
      value: stats.safetyAlertsCount ?? 0,
      subtext: 'Gas odor / CO / Fire hazards',
      icon: <ShieldAlert size={18} color="#ef4444" />,
      theme: stats.safetyAlertsCount > 0 ? 'hot' : '',
      clickable: false
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`stat-card ${card.theme} ${card.clickable ? 'cursor-pointer' : ''}`}
          onClick={() => card.clickable && onFilterPriority && onFilterPriority(card.id === activePriority ? 'ALL' : card.id)}
          style={{ cursor: card.clickable ? 'pointer' : 'default' }}
        >
          <div className="stat-header">
            <span className="stat-title">{card.title}</span>
            <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {card.icon}
            </div>
          </div>
          <div className="stat-value">{card.value}</div>
          <div className="stat-subtext">{card.subtext}</div>
        </div>
      ))}
    </div>
  );
}
