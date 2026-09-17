import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useLeads(initialFilters = {}) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    priority: 'ALL',
    status: 'ALL',
    search: '',
    is_demo: undefined,
    ...initialFilters
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getLeads(filters);
      setLeads(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateStatus = async (id, status) => {
    try {
      await api.updateLeadStatus(id, status);
      setLeads(prev => prev.map(l => l.id === id ? { ...l, lead_status: status } : l));
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    }
  };

  const toggleContacted = async (id, currentVal) => {
    try {
      const newVal = !currentVal;
      await api.updateLeadContacted(id, newVal);
      setLeads(prev => prev.map(l => l.id === id ? { ...l, is_contacted: newVal } : l));
    } catch (err) {
      console.error('Error updating contacted:', err);
      throw err;
    }
  };

  const escalate = async (id, data) => {
    try {
      const res = await api.escalateLead(id, data);
      setLeads(prev => prev.map(l => l.id === id ? res.data : l));
      return res.data;
    } catch (err) {
      console.error('Error escalating lead:', err);
      throw err;
    }
  };

  return {
    leads,
    loading,
    error,
    filters,
    setFilters,
    refreshLeads: fetchLeads,
    updateStatus,
    toggleContacted,
    escalate
  };
}
