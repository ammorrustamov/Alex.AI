const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error?.message || `HTTP Error ${response.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Leads
  getLeads: (params = {}) => {
    const query = new URLSearchParams();
    if (params.priority && params.priority !== 'ALL') query.append('priority', params.priority);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.is_demo !== undefined) query.append('is_demo', params.is_demo);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/leads${queryString}`);
  },

  getLeadById: (id) => request(`/leads/${id}`),

  createLead: (leadData) => request('/leads', {
    method: 'POST',
    body: JSON.stringify(leadData)
  }),

  updateLeadStatus: (id, status) => request(`/leads/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  updateLeadContacted: (id, isContacted) => request(`/leads/${id}/contacted`, {
    method: 'PATCH',
    body: JSON.stringify({ is_contacted: isContacted })
  }),

  escalateLead: (id, data) => request(`/leads/${id}/escalate`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  addLeadNote: (id, { author, note }) => request(`/leads/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ author, note })
  }),

  // Analytics & Stats
  getStats: () => request('/stats'),

  // Conversational AI Receptionist
  sendMessage: ({ leadId, message, currentLead }) => request('/chat/message', {
    method: 'POST',
    body: JSON.stringify({ leadId, message, currentLead })
  }),

  resetChat: () => request('/chat/reset', {
    method: 'POST'
  }),

  // Health & System Information
  getHealth: () => request('/health')
};
