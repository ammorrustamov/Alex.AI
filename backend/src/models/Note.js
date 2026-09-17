const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

class Note {
  static async findByLeadId(leadId) {
    const res = await db.query(
      'SELECT * FROM lead_notes WHERE lead_id = $1 ORDER BY created_at DESC',
      [leadId]
    );
    return res.rows || [];
  }

  static async create(leadId, author, note) {
    const id = uuidv4();
    const res = await db.query(
      `INSERT INTO lead_notes (id, lead_id, author, note, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, leadId, author || 'Staff Dispatcher', note, new Date().toISOString()]
    );
    return res.rows[0];
  }
}

module.exports = Note;
