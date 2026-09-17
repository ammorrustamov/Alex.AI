-- PostgreSQL Schema for AlexDesk AI
-- Autonomous AI Receptionist & Lead Dispatch System for HVAC Contractors

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(64) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL DEFAULT 'Unspecified Customer',
    phone_number VARCHAR(50),
    service_address TEXT,
    hvac_service_type VARCHAR(100) DEFAULT 'General HVAC',
    problem_description TEXT,
    problem_started VARCHAR(255),
    preferred_service_time VARCHAR(255),
    lead_priority VARCHAR(20) NOT NULL CHECK (lead_priority IN ('HOT', 'WARM', 'COLD')),
    lead_status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'in_progress', 'scheduled', 'escalated', 'closed')),
    is_contacted BOOLEAN DEFAULT FALSE,
    is_escalated BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    escalated_to VARCHAR(255),
    safety_alert BOOLEAN DEFAULT FALSE,
    safety_notes TEXT,
    ai_classification_rationale TEXT,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for fast search and dashboard queries
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(lead_priority);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_is_demo ON leads(is_demo);
CREATE INDEX IF NOT EXISTS idx_leads_safety_alert ON leads(safety_alert);

-- 2. CONVERSATIONS / TRANSCRIPTS TABLE
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(64) PRIMARY KEY,
    lead_id VARCHAR(64) REFERENCES leads(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL CHECK (role IN ('customer', 'alex_ai', 'system', 'human_agent')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at ASC);

-- 3. INTERNAL LEAD NOTES TABLE
CREATE TABLE IF NOT EXISTS lead_notes (
    id VARCHAR(64) PRIMARY KEY,
    lead_id VARCHAR(64) REFERENCES leads(id) ON DELETE CASCADE,
    author VARCHAR(100) NOT NULL DEFAULT 'HVAC Staff',
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);

-- 4. ESCALATIONS TABLE
CREATE TABLE IF NOT EXISTS escalations (
    id VARCHAR(64) PRIMARY KEY,
    lead_id VARCHAR(64) REFERENCES leads(id) ON DELETE CASCADE,
    assigned_to VARCHAR(150),
    reason TEXT NOT NULL,
    urgency VARCHAR(30) DEFAULT 'urgent' CHECK (urgency IN ('urgent', 'high', 'standard')),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_escalations_lead_id ON escalations(lead_id);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON escalations(status);
