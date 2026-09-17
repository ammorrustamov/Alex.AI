import React from 'react';
import { Search, Filter, RefreshCw, Flame, Sun, Snowflake, X } from 'lucide-react';

export default function LeadsFilterBar({
  filters,
  onFilterChange,
  onRefresh,
  loading,
  counts = {}
}) {
  return (
    <div className="filter-bar">
      <div className="filter-group-left">
        {/* Priority Tabs */}
        <div className="priority-tabs">
          <button
            type="button"
            className={`priority-tab ${filters.priority === 'ALL' ? 'active' : ''}`}
            onClick={() => onFilterChange({ priority: 'ALL' })}
          >
            All Leads <span className="nav-pill">{counts.totalLeads ?? 0}</span>
          </button>

          <button
            type="button"
            className={`priority-tab hot ${filters.priority === 'HOT' ? 'active' : ''}`}
            onClick={() => onFilterChange({ priority: 'HOT' })}
          >
            <Flame size={14} /> HOT
            <span className="nav-pill urgent">{counts.hotLeads ?? 0}</span>
          </button>

          <button
            type="button"
            className={`priority-tab warm ${filters.priority === 'WARM' ? 'active' : ''}`}
            onClick={() => onFilterChange({ priority: 'WARM' })}
          >
            <Sun size={14} /> WARM
            <span className="nav-pill">{counts.warmLeads ?? 0}</span>
          </button>

          <button
            type="button"
            className={`priority-tab cold ${filters.priority === 'COLD' ? 'active' : ''}`}
            onClick={() => onFilterChange({ priority: 'COLD' })}
          >
            <Snowflake size={14} /> COLD
            <span className="nav-pill">{counts.coldLeads ?? 0}</span>
          </button>
        </div>

        {/* Status Dropdown */}
        <select
          className="select-input"
          value={filters.status || 'ALL'}
          onChange={(e) => onFilterChange({ status: e.target.value })}
        >
          <option value="ALL">All Statuses</option>
          <option value="new">New (Unassigned)</option>
          <option value="contacted">Contacted</option>
          <option value="in_progress">In Progress</option>
          <option value="scheduled">Scheduled</option>
          <option value="escalated">Escalated to Human</option>
          <option value="closed">Closed / Archived</option>
        </select>

        {/* Demo Data Filter Toggle */}
        <select
          className="select-input"
          value={filters.is_demo === undefined ? 'ALL' : filters.is_demo.toString()}
          onChange={(e) => {
            const val = e.target.value;
            onFilterChange({ is_demo: val === 'ALL' ? undefined : val === 'true' });
          }}
        >
          <option value="ALL">All Sources (Live & Demo)</option>
          <option value="false">Live Customer Leads Only</option>
          <option value="true">Demo HVAC Leads Only</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Search Box */}
        <div className="search-input-wrapper">
          <Search size={16} className="search-input-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search name, phone, address, issue..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh leads list"
        >
          <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}
