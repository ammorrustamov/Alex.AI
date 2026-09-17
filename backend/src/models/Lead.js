const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

class Lead {
  static async findAll({ priority, status, search, isDemo, limit = 100, offset = 0 } = {}) {
    // In PostgreSQL or fallback mode
    const isPostgres = (await db.testConnection()) === 'postgres';

    if (isPostgres) {
      let queryText = 'SELECT * FROM leads WHERE 1=1';
      const params = [];
      let paramIdx = 1;

      if (priority && priority !== 'ALL') {
        queryText += ` AND lead_priority = $${paramIdx++}`;
        params.push(priority.toUpperCase());
      }

      if (status && status !== 'ALL') {
        queryText += ` AND lead_status = $${paramIdx++}`;
        params.push(status.toLowerCase());
      }

      if (isDemo !== undefined && isDemo !== null && isDemo !== '') {
        queryText += ` AND is_demo = $${paramIdx++}`;
        params.push(isDemo === 'true' || isDemo === true);
      }

      if (search && search.trim()) {
        const term = `%${search.trim().toLowerCase()}%`;
        queryText += ` AND (
          LOWER(customer_name) LIKE $${paramIdx} OR
          LOWER(phone_number) LIKE $${paramIdx} OR
          LOWER(service_address) LIKE $${paramIdx} OR
          LOWER(problem_description) LIKE $${paramIdx} OR
          LOWER(hvac_service_type) LIKE $${paramIdx}
        )`;
        params.push(term);
        paramIdx++;
      }

      queryText += ' ORDER BY created_at DESC';

      if (limit) {
        queryText += ` LIMIT $${paramIdx++}`;
        params.push(limit);
      }

      if (offset) {
        queryText += ` OFFSET $${paramIdx++}`;
        params.push(offset);
      }

      const res = await db.query(queryText, params);
      return res.rows;
    } else {
      // Fallback engine filtering
      const res = await db.query('SELECT * FROM leads');
      let leads = res.rows || [];

      if (priority && priority !== 'ALL') {
        leads = leads.filter(l => (l.lead_priority || '').toUpperCase() === priority.toUpperCase());
      }

      if (status && status !== 'ALL') {
        leads = leads.filter(l => (l.lead_status || '').toLowerCase() === status.toLowerCase());
      }

      if (isDemo !== undefined && isDemo !== null && isDemo !== '') {
        const isDemoBool = isDemo === 'true' || isDemo === true;
        leads = leads.filter(l => Boolean(l.is_demo) === isDemoBool);
      }

      if (search && search.trim()) {
        const term = search.trim().toLowerCase();
        leads = leads.filter(l =>
          (l.customer_name && l.customer_name.toLowerCase().includes(term)) ||
          (l.phone_number && l.phone_number.toLowerCase().includes(term)) ||
          (l.service_address && l.service_address.toLowerCase().includes(term)) ||
          (l.problem_description && l.problem_description.toLowerCase().includes(term)) ||
          (l.hvac_service_type && l.hvac_service_type.toLowerCase().includes(term))
        );
      }

      leads.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      return leads.slice(offset, offset + limit);
    }
  }

  static async findById(id) {
    const res = await db.query('SELECT * FROM leads WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  static async create(leadData) {
    const id = leadData.id || `lead-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const insertSql = `
      INSERT INTO leads (
        id, customer_name, phone_number, service_address, hvac_service_type,
        problem_description, problem_started, preferred_service_time,
        lead_priority, lead_status, is_contacted, is_escalated,
        escalation_reason, escalated_to, safety_alert, safety_notes,
        ai_classification_rationale, is_demo, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING *
    `;

    const params = [
      id,
      leadData.customer_name || 'Unspecified Customer',
      leadData.phone_number || null,
      leadData.service_address || null,
      leadData.hvac_service_type || 'General HVAC',
      leadData.problem_description || null,
      leadData.problem_started || null,
      leadData.preferred_service_time || null,
      leadData.lead_priority || 'WARM',
      leadData.lead_status || 'new',
      leadData.is_contacted || false,
      leadData.is_escalated || false,
      leadData.escalation_reason || null,
      leadData.escalated_to || null,
      leadData.safety_alert || false,
      leadData.safety_notes || null,
      leadData.ai_classification_rationale || null,
      leadData.is_demo || false,
      now,
      now
    ];

    const res = await db.query(insertSql, params);
    return res.rows[0];
  }

  static async updateStatus(id, newStatus) {
    const validStatuses = ['new', 'contacted', 'in_progress', 'scheduled', 'escalated', 'closed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const res = await db.query(
      `UPDATE leads SET lead_status = $1, updated_at = $2 WHERE id = $3 RETURNING *`,
      [newStatus, new Date().toISOString(), id]
    );
    return res.rows[0] || null;
  }

  static async updateContacted(id, isContacted) {
    const res = await db.query(
      `UPDATE leads SET is_contacted = $1, updated_at = $2 WHERE id = $3 RETURNING *`,
      [Boolean(isContacted), new Date().toISOString(), id]
    );
    return res.rows[0] || null;
  }

  static async escalate(id, { assignedTo, reason, urgency = 'urgent' }) {
    const leadRes = await db.query(
      `UPDATE leads SET is_escalated = true, escalated_to = $1, escalation_reason = $2, lead_status = 'escalated', updated_at = $3 WHERE id = $4 RETURNING *`,
      [assignedTo || 'Human Dispatcher', reason || 'Customer requested human agent or complex HVAC issue', new Date().toISOString(), id]
    );

    // Also record in escalations table
    await db.query(
      `INSERT INTO escalations (id, lead_id, assigned_to, reason, urgency, status, created_at) VALUES ($1, $2, $3, $4, $5, 'pending', $6)`,
      [uuidv4(), id, assignedTo || 'Human Dispatcher', reason, urgency, new Date().toISOString()]
    );

    return leadRes.rows[0] || null;
  }

  static async getStats() {
    const res = await db.query('SELECT * FROM leads');
    const leads = res.rows || [];

    const total = leads.length;
    const hot = leads.filter(l => l.lead_priority === 'HOT').length;
    const warm = leads.filter(l => l.lead_priority === 'WARM').length;
    const cold = leads.filter(l => l.lead_priority === 'COLD').length;

    const escalated = leads.filter(l => l.is_escalated || l.lead_status === 'escalated').length;
    const safetyAlerts = leads.filter(l => l.safety_alert).length;
    const contacted = leads.filter(l => l.is_contacted).length;
    const scheduled = leads.filter(l => l.lead_status === 'scheduled').length;
    const newLeads = leads.filter(l => l.lead_status === 'new').length;

    // HVAC service type breakdown
    const serviceTypeMap = {};
    leads.forEach(l => {
      const type = l.hvac_service_type || 'General HVAC';
      serviceTypeMap[type] = (serviceTypeMap[type] || 0) + 1;
    });

    return {
      totalLeads: total,
      hotLeads: hot,
      warmLeads: warm,
      coldLeads: cold,
      escalatedCount: escalated,
      safetyAlertsCount: safetyAlerts,
      contactedCount: contacted,
      scheduledCount: scheduled,
      newCount: newLeads,
      conversionRate: total > 0 ? Math.round((scheduled / total) * 100) : 0,
      contactedRate: total > 0 ? Math.round((contacted / total) * 100) : 0,
      serviceTypes: serviceTypeMap
    };
  }
}

module.exports = Lead;
