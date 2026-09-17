const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

class Conversation {
  static async findByLeadId(leadId) {
    const res = await db.query(
      'SELECT * FROM conversations WHERE lead_id = $1 ORDER BY created_at ASC',
      [leadId]
    );
    return res.rows || [];
  }

  static async addMessage(leadId, role, content, metadata = {}) {
    const id = uuidv4();
    const metaStr = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
    const res = await db.query(
      `INSERT INTO conversations (id, lead_id, role, content, metadata, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, leadId, role, content, metaStr, new Date().toISOString()]
    );
    return res.rows[0];
  }
}

module.exports = Conversation;
