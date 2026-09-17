# AlexDesk AI 🚀
### Autonomous AI Receptionist & Lead Dispatch System for US HVAC Contractors

**AlexDesk AI** is a production-ready B2B SaaS platform engineered specifically for heating, ventilation, and air conditioning (HVAC) service contractors. Powered by OpenAI, it automates incoming customer calls and inquiries, accurately extracts structured lead data, intelligently classifies urgency (**HOT / WARM / COLD**), strictly adheres to life-safety emergency protocols (gas leaks, carbon monoxide, electrical hazards), and streamlines human dispatcher escalation.

---

## 🌟 Key Features

### 1. 🤖 Autonomous AI Receptionist ("Alex")
- **Friendly & Concise Persona:** Professional, natural, empathetic communication tailored for distressed homeowners experiencing HVAC outages.
- **Strict Guardrails:**
  - Identifies as an AI receptionist when asked.
  - **Never invents prices**, warranties, or guaranteed technician arrival times.
  - **Never diagnoses dangerous equipment faults**.
  - **Never requests sensitive financial info** (credit cards, passwords).
  - Context-aware memory: never re-asks for previously provided customer details.
- **Dual Engine:** Works seamlessly with OpenAI (`gpt-4o-mini` / `gpt-4o`) or with the built-in intelligent HVAC conversational engine when running offline.

### 2. 🚨 Critical Safety & Hazard Interception
- Detects **natural gas odor / rotten egg smell**, **carbon monoxide alarms**, **active smoke**, and **electrical sparking**.
- **Immediate Protocol:** Automatically stops troubleshooting, provides immediate life-safety evacuation instructions, directs customer to call 911 / **Atmos Energy (866) 322-8667**, and escalates to human emergency dispatch.

### 3. 🔥 Automatic Lead Priority Classification
- **HOT:** Total loss of heat or cooling during extreme weather, immediate water leaks through ceilings, customers ready to book now with contact info.
- **WARM:** Heat pump / AC replacement estimates, multi-point maintenance tune-ups, scheduled inspections.
- **COLD:** General labor rate inquiries, service area questions, exploratory browsing.

### 4. 📊 Enterprise Dispatch SaaS Dashboard
- **Real-Time KPIs:** Total Leads, HOT / WARM / COLD counts, Escalation rate, Safety alerts.
- **Filtering & Search:** Filter by priority, lead status, HVAC service type, and live vs. demo data; debounced search across customer name, phone, address, and issue.
- **Lead Detail Drawer:** Full customer contact details, AI priority reasoning, chronological conversation transcript with audio indicators, and internal staff notes timeline.
- **Human Escalation Workflow:** One-click assignment to emergency dispatchers or technicians with custom notes and urgency levels.

### 5. 🎙️ Live Customer Call Simulator & Voice Synthesis
- Test receptionist conversations directly from the browser with simulated homeowner scenarios.
- **Live Lead Extraction Card:** Watch fields (Name, Phone, Address, HVAC issue, Timing, Priority) populate in real time as Alex converses.
- **Voice Audio Readout:** Neural text-to-speech audio synthesis with real-time waveform animation.

### 6. 📞 Future Telephony & Twilio Integration
- Modular architecture with pre-built endpoints for Twilio Voice and SMS:
  - `POST /api/webhooks/twilio/voice` (Incoming call TwiML greeting)
  - `POST /api/webhooks/twilio/voice/process` (Gathered speech processing & response)
  - `POST /api/webhooks/twilio/sms` (Two-way text messaging)
- Live interactive Twilio webhook simulator in the dashboard.

---

## 🏗️ Project Architecture

```
Alex.AI/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── db.js          # PostgreSQL pool + resilient local engine fallback
│   │   │   ├── schema.sql     # PostgreSQL tables, constraints, & indexes
│   │   │   ├── migrate.js     # Migration runner
│   │   │   └── seed.js        # Realistic HVAC demo leads & transcripts
│   │   ├── models/
│   │   │   ├── Lead.js        # Lead CRUD, search, priority aggregation
│   │   │   ├── Conversation.js# Transcripts linked to lead sessions
│   │   │   ├── Note.js        # Internal dispatcher notes
│   │   │   └── Escalation.js  # Human handoff assignments
│   │   ├── services/
│   │   │   ├── aiReceptionistService.js # OpenAI + prompt rules & fallback
│   │   │   ├── safetyService.js         # Emergency gas/CO/fire detector
│   │   │   ├── leadClassifierService.js # HOT/WARM/COLD auto-tagger
│   │   │   └── voiceIntegrationService.js# Twilio TwiML generator
│   │   ├── controllers/
│   │   │   ├── leadController.js
│   │   │   ├── chatController.js
│   │   │   ├── statsController.js
│   │   │   └── webhookController.js
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # StatsCards, LeadsTable, LeadDetailModal, EscalateModal...
│   │   ├── pages/             # Dashboard, Simulator, Escalations, VoiceIntegrations
│   │   ├── layouts/           # MainLayout with header, sidebar, emergency banner
│   │   ├── services/          # API client
│   │   ├── hooks/             # useLeads, useStats
│   │   ├── index.css          # Modern dark-slate SaaS design system
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── docker-compose.yml         # PostgreSQL 16 Alpine container definition
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v22)
- Optional: Docker or PostgreSQL 16 (if you want to run native PostgreSQL)

---

### Step 1: Database Setup (PostgreSQL)

You can run PostgreSQL with Docker:
```bash
docker compose up -d
```
*Note: If you do not have PostgreSQL running locally, AlexDesk AI will automatically and gracefully switch to its resilient local engine with identical schema support, allowing instant testing without crashes!*

---

### Step 2: Backend Setup

1. Open a terminal and navigate to the backend:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables (a default `.env` is already provided):
   ```bash
   cp .env.example .env
   ```
   *(Optional: Add your `OPENAI_API_KEY` to `.env` to enable live GPT-4o models)*

3. Seed demo HVAC leads:
   ```bash
   npm run seed
   ```

4. Start the backend REST API:
   ```bash
   npm start
   # Server runs on http://localhost:5000
   ```

---

### Step 3: Frontend Setup

1. Open a second terminal and navigate to the frontend:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   # App runs on http://localhost:5173
   ```

3. Open `http://localhost:5173` in your browser.

---

## 🧪 Testing the AI Receptionist

1. Go to the **AI Receptionist** tab in the sidebar.
2. Click **"🚨 Gas Odor / Rotten Eggs"** to test safety interception:
   - Alex immediately halts normal intake and advises outdoor evacuation.
   - Emergency banner and red critical hazard tag appear.
   - Lead is automatically escalated to human safety personnel.
3. Click **"❄️ Freezing Winter - No Heat"**:
   - Provide name, phone, and address.
   - Watch the live lead card populate in real-time.
   - Lead is classified as **HOT** and logged into the Admin Dashboard.
4. Click **Voice Audio: ON** to hear Alex speak back using browser speech synthesis!

---

## 🔒 Security & Data Integrity
- Secrets and API keys are strictly configured through environment variables (`.env`).
- Never hardcoded in source files.
- Separation of demo data (`is_demo: true`) from production customer inquiries.
