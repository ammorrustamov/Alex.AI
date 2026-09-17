const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

class Escalation {
  static async findAll() {
    const isPostgres = (await db.testConnection()) === 'postgres';
    if (isPostgres) {
      const res = await db.query(`
        SELECT e.*, l.customer_name, l.phone_number, l.service_address, l.hvac_service_type, l.safety_alert, l.safety_notes
        FROM escalations e
        JOIN leads l ON e.lead_id = l.id
        ORDER BY e.created_at DESC
      `);
      return res.rows || [];
    } else {
      const res = await db.query('SELECT * FROM escalations');
      const leadsRes = await db.query('SELECT * FROM leads');
      const leadsMap = {};
      (leadsRes.rows || []).forEach(l => { leadsMap[l.id] = l; });

      const list = (res.rows || []).map(e => {
        const l = leadsMap[e.lead_id] || {};
        return {
          ...e,
          customer_name: l.customer_name,
          phone_number: l.phone_number,
          service_address: l.service_address,
          hvac_service_type: l.hvac_service_type,
          safety_alert: l.safety_alert,
          safety_notes: l.safety_notes
        };
      });

      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      return list;
    }
  }

  static async updateStatus(id, status) {
    const res = await db.query(
      `UPDATE escalations SET status = $1, resolved_at = $2 WHERE id = $3 RETURNING *`,
      [status, status === 'resolved' ? new Date().toISOString() : null, id]
    );
    return res.rows[0];
  }
}

module.exports = Escalation;
