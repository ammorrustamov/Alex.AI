const express = require('express');
const cors = require('cors');
require('dotenv').config();

const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const db = require('./database/db');

const leadRoutes = require('./routes/leadRoutes');
const chatRoutes = require('./routes/chatRoutes');
const statsRoutes = require('./routes/statsRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(requestLogger);

// Health check and system diagnostic endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'AlexDesk AI',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    databaseMode: db.getDbMode(),
    aiEngine: process.env.OPENAI_API_KEY ? `OpenAI (${process.env.OPENAI_MODEL || 'gpt-4o-mini'})` : 'Smart HVAC Guardrails Engine (Built-in)',
    company: {
      name: process.env.COMPANY_NAME || 'Apex Comfort Heating & Air',
      phone: process.env.COMPANY_PHONE || '(555) 349-2665',
      emergencyGasNumber: process.env.EMERGENCY_GAS_UTILITY_PHONE || '911 / Atmos Energy (866) 322-8667'
    }
  });
});

// Mount Routes
app.use('/api/leads', leadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/webhooks', webhookRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
