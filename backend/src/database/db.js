const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// PostgreSQL Pool configuration
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

const poolConfig = connectionString
  ? { connectionString, ssl: isProduction ? { rejectUnauthorized: false } : false, connectionTimeoutMillis: 2000 }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'alexdesk_hvac',
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 2000
    };

const pgPool = new Pool(poolConfig);

// Local persistent fallback store for environments without a running PostgreSQL daemon
const fallbackDir = path.join(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'local_db.json');

function ensureFallbackDir() {
  if (!fs.existsSync(fallbackDir)) {
    fs.mkdirSync(fallbackDir, { recursive: true });
  }
  if (!fs.existsSync(fallbackFile)) {
    const initialData = {
      leads: [],
      conversations: [],
      lead_notes: [],
      escalations: []
    };
    fs.writeFileSync(fallbackFile, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readFallbackData() {
  ensureFallbackDir();
  try {
    const raw = fs.readFileSync(fallbackFile, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { leads: [], conversations: [], lead_notes: [], escalations: [] };
  }
}

function writeFallbackData(data) {
  ensureFallbackDir();
  fs.writeFileSync(fallbackFile, JSON.stringify(data, null, 2), 'utf-8');
}

// Database state tracker
let dbMode = 'untested'; // 'postgres' | 'fallback'

async function testConnection() {
  if (dbMode !== 'untested') return dbMode;
  try {
    const client = await pgPool.connect();
    await client.query('SELECT 1');
    client.release();
    dbMode = 'postgres';
    console.log('✅ [Database] Successfully connected to PostgreSQL server.');
    return 'postgres';
  } catch (err) {
    dbMode = 'fallback';
    console.warn(`⚠️ [Database] PostgreSQL not detected (${err.message}). Using resilient local storage engine for seamless testing.`);
    return 'fallback';
  }
}

// Execute query through PostgreSQL or resilient local engine
async function query(text, params = []) {
  if (dbMode === 'untested') {
    await testConnection();
  }

  if (dbMode === 'postgres') {
    try {
      return await pgPool.query(text, params);
    } catch (err) {
      console.error('PostgreSQL Query Error:', err.message, '\nQuery:', text);
      throw err;
    }
  }

  // Fallback SQL emulator for standard queries
  return executeFallbackQuery(text, params);
}

// Simplified SQL emulator for the fallback mode
function executeFallbackQuery(sql, params) {
  const data = readFallbackData();
  const trimmed = sql.trim().replace(/\s+/g, ' ');

  // 1. SELECT * FROM leads WHERE ...
  if (trimmed.startsWith('SELECT') && trimmed.includes('FROM leads')) {
    let rows = [...data.leads];

    // Priority filter
    if (trimmed.includes('lead_priority = $')) {
      const pIdx = parseInt(sql.match(/lead_priority = \$(\d+)/)?.[1] || '1', 10) - 1;
      const priorityVal = params[pIdx];
      if (priorityVal) rows = rows.filter(r => r.lead_priority === priorityVal);
    }

    // Status filter
    if (trimmed.includes('lead_status = $')) {
      const sIdx = parseInt(sql.match(/lead_status = \$(\d+)/)?.[1] || '1', 10) - 1;
      const statusVal = params[sIdx];
      if (statusVal) rows = rows.filter(r => r.lead_status === statusVal);
    }

    // ID lookup
    if (trimmed.includes('WHERE id = $1')) {
      rows = rows.filter(r => r.id === params[0]);
    }

    // Order by created_at DESC
    rows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return { rows, rowCount: rows.length };
  }

  // 2. INSERT INTO leads
  if (trimmed.startsWith('INSERT INTO leads')) {
    // Determine column names
    const colMatch = trimmed.match(/INSERT INTO leads \((.*?)\) VALUES/i);
    if (colMatch) {
      const cols = colMatch[1].split(',').map(c => c.trim());
      const newLead = {};
      cols.forEach((col, idx) => {
        newLead[col] = params[idx] !== undefined ? params[idx] : null;
      });
      if (!newLead.created_at) newLead.created_at = new Date().toISOString();
      if (!newLead.updated_at) newLead.updated_at = new Date().toISOString();
      
      data.leads.push(newLead);
      writeFallbackData(data);
      return { rows: [newLead], rowCount: 1 };
    }
  }

  // 3. UPDATE leads
  if (trimmed.startsWith('UPDATE leads')) {
    const idMatch = trimmed.match(/WHERE id = \$(\d+)/i);
    if (idMatch) {
      const idParamIdx = parseInt(idMatch[1], 10) - 1;
      const targetId = params[idParamIdx];
      const leadIndex = data.leads.findIndex(l => l.id === targetId);

      if (leadIndex !== -1) {
        // Status update
        if (trimmed.includes('lead_status = $1')) {
          data.leads[leadIndex].lead_status = params[0];
        }
        if (trimmed.includes('is_contacted = $1')) {
          data.leads[leadIndex].is_contacted = params[0];
        }
        if (trimmed.includes('is_escalated = true') || trimmed.includes('is_escalated = $1')) {
          data.leads[leadIndex].is_escalated = true;
          data.leads[leadIndex].escalated_to = params[0];
          data.leads[leadIndex].escalation_reason = params[1];
          data.leads[leadIndex].lead_status = 'escalated';
        }
        data.leads[leadIndex].updated_at = new Date().toISOString();
        writeFallbackData(data);
        return { rows: [data.leads[leadIndex]], rowCount: 1 };
      }
    }
  }

  // 4. CONVERSATIONS
  if (trimmed.startsWith('INSERT INTO conversations')) {
    const newConv = {
      id: params[0],
      lead_id: params[1],
      role: params[2],
      content: params[3],
      metadata: params[4] ? (typeof params[4] === 'string' ? JSON.parse(params[4]) : params[4]) : {},
      created_at: new Date().toISOString()
    };
    data.conversations.push(newConv);
    writeFallbackData(data);
    return { rows: [newConv], rowCount: 1 };
  }

  if (trimmed.startsWith('SELECT') && trimmed.includes('FROM conversations')) {
    let rows = [...data.conversations];
    if (trimmed.includes('WHERE lead_id = $1')) {
      rows = rows.filter(c => c.lead_id === params[0]);
    }
    rows.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return { rows, rowCount: rows.length };
  }

  // 5. NOTES
  if (trimmed.startsWith('INSERT INTO lead_notes')) {
    const newNote = {
      id: params[0],
      lead_id: params[1],
      author: params[2],
      note: params[3],
      created_at: new Date().toISOString()
    };
    data.lead_notes.push(newNote);
    writeFallbackData(data);
    return { rows: [newNote], rowCount: 1 };
  }

  if (trimmed.startsWith('SELECT') && trimmed.includes('FROM lead_notes')) {
    let rows = [...data.lead_notes];
    if (trimmed.includes('WHERE lead_id = $1')) {
      rows = rows.filter(n => n.lead_id === params[0]);
    }
    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows, rowCount: rows.length };
  }

  // 6. ESCALATIONS
  if (trimmed.startsWith('INSERT INTO escalations')) {
    const newEsc = {
      id: params[0],
      lead_id: params[1],
      assigned_to: params[2],
      reason: params[3],
      urgency: params[4] || 'urgent',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    data.escalations.push(newEsc);
    writeFallbackData(data);
    return { rows: [newEsc], rowCount: 1 };
  }

  if (trimmed.startsWith('SELECT') && trimmed.includes('FROM escalations')) {
    let rows = [...data.escalations];
    if (trimmed.includes('WHERE lead_id = $1')) {
      rows = rows.filter(e => e.lead_id === params[0]);
    }
    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows, rowCount: rows.length };
  }

  // Default return
  return { rows: [], rowCount: 0 };
}

module.exports = {
  query,
  pgPool,
  testConnection,
  getDbMode: () => dbMode
};
