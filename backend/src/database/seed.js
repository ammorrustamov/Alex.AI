const db = require('./db');
const { v4: uuidv4 } = require('uuid');

const realisticHvacLeads = [
  {
    id: 'lead-demo-001',
    customer_name: 'Robert Hernandez',
    phone_number: '(214) 555-0182',
    service_address: '742 Evergreen Terr, Dallas, TX 75201',
    hvac_service_type: 'Emergency Heating Outage',
    problem_description: 'Furnace stopped igniting completely. Temperature inside is dropping rapidly (currently 56°F, outside 28°F). Have an infant and elderly parent in home.',
    problem_started: 'Today around 5:00 AM',
    preferred_service_time: 'Immediate / First available emergency technician today',
    lead_priority: 'HOT',
    lead_status: 'new',
    is_contacted: false,
    is_escalated: true,
    escalation_reason: 'Severe cold weather, total heat loss with vulnerable household occupants.',
    escalated_to: 'Emergency Dispatch (Dave T.)',
    safety_alert: false,
    safety_notes: null,
    ai_classification_rationale: 'Classified HOT: Zero heating output during freezing weather conditions with high urgency and full customer contact details provided.',
    is_demo: true,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
    messages: [
      { role: 'customer', content: 'Hi, our heater completely died this morning and it is freezing in the house. We have an 8-month-old baby.' },
      { role: 'alex_ai', content: 'Hello! I am Alex with Apex Comfort Heating & Air. I am so sorry to hear that, especially with your little one. Let us get help out to you as quickly as possible. Are you smelling any gas or seeing smoke?' },
      { role: 'customer', content: 'No gas smell, just blowing stone cold air and clicking.' },
      { role: 'alex_ai', content: 'Understood. Could I get your full name, phone number, and street address so I can prioritize an emergency dispatch?' },
      { role: 'customer', content: 'Robert Hernandez, 214-555-0182, 742 Evergreen Terr, Dallas TX 75201.' },
      { role: 'alex_ai', content: 'Thank you, Robert. I have logged your address and flagged this as an urgent emergency heating outage. Our on-call dispatch team has been notified immediately and will call your number to confirm technician ETA.' }
    ],
    notes: [
      { author: 'Dave T. (Lead Dispatcher)', note: 'Flagged for Tech Marcus on Truck #4. Marcus is finishing a filter swap in 75204 and en route next.' }
    ]
  },
  {
    id: 'lead-demo-002',
    customer_name: 'David Martinez',
    phone_number: '(817) 555-9013',
    service_address: '1205 Sycamore Blvd, Denton, TX 76201',
    hvac_service_type: 'Gas Leak / Safety Emergency',
    problem_description: 'Strong sulfur/rotten-egg smell originating from the furnace utility closet after turning on thermostat.',
    problem_started: '15 minutes ago',
    preferred_service_time: 'IMMEDIATE EMERGENCY SAFETY PROTOCOL',
    lead_priority: 'HOT',
    lead_status: 'escalated',
    is_contacted: true,
    is_escalated: true,
    escalation_reason: 'CRITICAL SAFETY: Potential natural gas leak detected.',
    escalated_to: 'Safety Officer / On-Call Supervisor',
    safety_alert: true,
    safety_notes: 'CRITICAL SAFETY ALERT: Customer reported strong sulfur/gas odor. Instructed customer to immediately evacuate premises, avoid electrical switches, and contact Atmos Energy (866-322-8667) & 911 from a safe outdoor distance.',
    ai_classification_rationale: 'Classified HOT & CRITICAL SAFETY: Mention of rotten egg/gas odor. Immediate safety protocol triggered.',
    is_demo: true,
    created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(), // 50 mins ago
    messages: [
      { role: 'customer', content: 'I just turned my heater on and there is a really bad rotten egg smell coming from the laundry room closet where the heater is.' },
      { role: 'alex_ai', content: '⚠️ CRITICAL SAFETY NOTICE: Please STOP troubleshooting immediately. A rotten egg smell indicates a potential natural gas leak. For your safety, please EVACUATE your home immediately with everyone inside. Do not touch any light switches, electrical appliances, or open flames. Once safely outside, call 911 and Atmos Energy at (866) 322-8667.' },
      { role: 'customer', content: 'Okay we are walking outside to the driveway right now. My name is David Martinez, 817-555-9013, 1205 Sycamore Blvd.' },
      { role: 'alex_ai', content: 'Thank you for moving to safety, David. Stay outside. Our emergency safety team has been immediately alerted and will coordinate once the utility company clears the home.' }
    ],
    notes: [
      { author: 'Sarah C. (Safety Coordinator)', note: 'Customer reached safe location. Atmos Energy dispatch confirmed en route. Tech will standby for gas utility clearance.' }
    ]
  },
  {
    id: 'lead-demo-003',
    customer_name: 'Amanda Brooks',
    phone_number: '(817) 555-4921',
    service_address: '1804 Meadow Creek Ln, Fort Worth, TX 76102',
    hvac_service_type: 'Cooling / AC Repair',
    problem_description: 'AC unit outside is buzzing loudly and blowing warm air through ceiling vents. Indoor temperature is 82°F.',
    problem_started: 'Yesterday evening',
    preferred_service_time: 'This afternoon between 1:00 PM and 4:00 PM',
    lead_priority: 'HOT',
    lead_status: 'in_progress',
    is_contacted: true,
    is_escalated: false,
    escalation_reason: null,
    escalated_to: null,
    safety_alert: false,
    safety_notes: null,
    ai_classification_rationale: 'Classified HOT: Active cooling failure, uncomfortable indoor temperatures, customer requested immediate afternoon appointment.',
    is_demo: true,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    messages: [
      { role: 'customer', content: 'Hello, our AC is blowing warm air and the outside condenser fan is buzzing like it is stuck.' },
      { role: 'alex_ai', content: 'Hello Amanda! Alex with Apex Comfort here. A buzzing condenser often indicates a run capacitor issue or motor strain. We can definitely get a technician out to inspect that for you. What is the best service address?' },
      { role: 'customer', content: '1804 Meadow Creek Ln in Fort Worth. Phone is 817-555-4921.' },
      { role: 'alex_ai', content: 'Got it, Amanda! What time window works best for you today?' },
      { role: 'customer', content: 'Anytime between 1 PM and 4 PM would be ideal.' },
      { role: 'alex_ai', content: 'Perfect. I have recorded your preferred window of 1-4 PM today. Our dispatch team is reviewing technician routes and will send a confirmation text shortly.' }
    ],
    notes: [
      { author: 'Dispatcher Mike', note: 'Assigned tentative slot to Tech Jose (Truck #2). Customer confirmed by phone.' }
    ]
  },
  {
    id: 'lead-demo-004',
    customer_name: 'James Wilson',
    phone_number: '(469) 555-3810',
    service_address: '321 Elmwood Dr, Plano, TX 75024',
    hvac_service_type: 'Condensate Drain Leak / Water Damage Risk',
    problem_description: 'Water leaking through master bedroom ceiling drywall directly below attic air handler.',
    problem_started: 'Noticed 3 hours ago',
    preferred_service_time: 'Today ASAP before ceiling drywall collapses',
    lead_priority: 'HOT',
    lead_status: 'contacted',
    is_contacted: true,
    is_escalated: false,
    escalation_reason: null,
    escalated_to: null,
    safety_alert: false,
    safety_notes: null,
    ai_classification_rationale: 'Classified HOT: Active water intrusion from HVAC unit causing property damage risk; urgent repair needed.',
    is_demo: true,
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    messages: [
      { role: 'customer', content: 'Help! Water is dripping from my ceiling right underneath where the air conditioner is in the attic.' },
      { role: 'alex_ai', content: 'Hello James. That sounds like a clogged condensate drain line or full drain pan. To prevent drywall damage, please turn the thermostat to OFF right away if safe to do so. May I have your address and phone number?' },
      { role: 'customer', content: 'Turned it off now. Address is 321 Elmwood Dr Plano TX. 469-555-3810.' },
      { role: 'alex_ai', content: 'Thank you James. Good job switching off the system. I have prioritized this lead as urgent and notified our dispatch office.' }
    ],
    notes: []
  },
  {
    id: 'lead-demo-005',
    customer_name: 'Patricia Miller',
    phone_number: '(214) 555-7391',
    service_address: '902 Oak Ridge Rd, Irving, TX 75062',
    hvac_service_type: 'Full System Replacement Estimate',
    problem_description: 'Looking to replace 16-year-old R-22 air conditioner and gas furnace with a high-efficiency inverter heat pump system.',
    problem_started: 'System still running, planning proactive upgrade before summer',
    preferred_service_time: 'Thursday morning between 9:00 AM and 11:00 AM',
    lead_priority: 'WARM',
    lead_status: 'new',
    is_contacted: false,
    is_escalated: false,
    escalation_reason: null,
    escalated_to: null,
    safety_alert: false,
    safety_notes: null,
    ai_classification_rationale: 'Classified WARM: Customer actively seeking replacement estimate for aging system; not an emergency outage.',
    is_demo: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    messages: [
      { role: 'customer', content: 'Good morning, we have an old 16-year-old system and want to get a quote on upgrading to a modern heat pump.' },
      { role: 'alex_ai', content: 'Good morning Patricia! I would be glad to help set up a free in-home consultation with one of our comfort specialists to evaluate your home and calculate exact rebate savings. What is the address?' },
      { role: 'customer', content: '902 Oak Ridge Rd in Irving. My cell is 214-555-7391.' },
      { role: 'alex_ai', content: 'Wonderful. What day and time work best for a 45-minute walkthrough?' },
      { role: 'customer', content: 'Thursday morning around 9 or 10 AM.' }
    ],
    notes: []
  },
  {
    id: 'lead-demo-006',
    customer_name: 'Derek Vance',
    phone_number: '(972) 555-8204',
    service_address: '455 Timberline Ct, Arlington, TX 76011',
    hvac_service_type: 'Seasonal Tune-Up & Maintenance',
    problem_description: 'Annual multi-point precision heating safety inspection and 4-inch media filter replacement.',
    problem_started: 'Regular maintenance schedule',
    preferred_service_time: 'Friday afternoon 2:00 PM',
    lead_priority: 'WARM',
    lead_status: 'scheduled',
    is_contacted: true,
    is_escalated: false,
    escalation_reason: null,
    escalated_to: null,
    safety_alert: false,
    safety_notes: null,
    ai_classification_rationale: 'Classified WARM: Routine preventative maintenance check; scheduled customer.',
    is_demo: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    messages: [
      { role: 'customer', content: 'Hi, I received a flyer about the pre-winter 21-point furnace tune-up special.' },
      { role: 'alex_ai', content: 'Hello Derek! Yes, our comprehensive furnace safety inspection includes heat exchanger testing, burner cleaning, and electrical amp draws. Let us get you on the schedule!' }
    ],
    notes: [
      { author: 'System Dispatch', note: 'Appointment booked for Friday at 2:00 PM. Assigned to Tech Chris.' }
    ]
  },
  {
    id: 'lead-demo-007',
    customer_name: 'Greg Sullivan',
    phone_number: '(214) 555-6619',
    service_address: 'Richardson, TX (no street provided)',
    hvac_service_type: 'General Inquiry / Pricing',
    problem_description: 'Customer was shopping around asking for rough ballpark pricing for duct cleaning. Did not have a specific appointment request.',
    problem_started: 'N/A',
    preferred_service_time: 'Just browsing information for now',
    lead_priority: 'COLD',
    lead_status: 'closed',
    is_contacted: true,
    is_escalated: false,
    escalation_reason: null,
    escalated_to: null,
    safety_alert: false,
    safety_notes: null,
    ai_classification_rationale: 'Classified COLD: General information seeking without immediate service need or specific property address.',
    is_demo: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    messages: [
      { role: 'customer', content: 'What is your hourly diagnostic rate and do you guys do air duct cleaning?' },
      { role: 'alex_ai', content: 'Hello Greg! Our standard diagnostic visit includes a complete system inspection by a certified technician. For whole-home duct cleaning, we provide clear upfront quotes based on supply and return vent counts. Would you like a technician to assess your home?' },
      { role: 'customer', content: 'Just checking prices for now, thanks.' }
    ],
    notes: [
      { author: 'Dispatcher Lisa', note: 'Sent general service brochure via SMS. Lead marked as closed/information-only.' }
    ]
  }
];

async function seedDatabase() {
  console.log('🌱 [Seed] Seeding AlexDesk AI realistic HVAC demo leads...');
  await db.testConnection();

  try {
    for (const lead of realisticHvacLeads) {
      // 1. Insert Lead
      const insertSql = `
        INSERT INTO leads (
          id, customer_name, phone_number, service_address, hvac_service_type,
          problem_description, problem_started, preferred_service_time,
          lead_priority, lead_status, is_contacted, is_escalated,
          escalation_reason, escalated_to, safety_alert, safety_notes,
          ai_classification_rationale, is_demo, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        )
      `;
      const params = [
        lead.id, lead.customer_name, lead.phone_number, lead.service_address, lead.hvac_service_type,
        lead.problem_description, lead.problem_started, lead.preferred_service_time,
        lead.lead_priority, lead.lead_status, lead.is_contacted, lead.is_escalated,
        lead.escalation_reason, lead.escalated_to, lead.safety_alert, lead.safety_notes,
        lead.ai_classification_rationale, lead.is_demo, lead.created_at, lead.created_at
      ];

      await db.query(insertSql, params);

      // 2. Insert Conversations
      if (lead.messages) {
        for (const msg of lead.messages) {
          await db.query(
            `INSERT INTO conversations (id, lead_id, role, content, metadata, created_at) VALUES ($1, $2, $3, $4, $5, $6)`,
            [uuidv4(), lead.id, msg.role, msg.content, JSON.stringify({}), lead.created_at]
          );
        }
      }

      // 3. Insert Notes
      if (lead.notes) {
        for (const note of lead.notes) {
          await db.query(
            `INSERT INTO lead_notes (id, lead_id, author, note, created_at) VALUES ($1, $2, $3, $4, $5)`,
            [uuidv4(), lead.id, note.author, note.note, lead.created_at]
          );
        }
      }

      // 4. Insert Escalations if escalated
      if (lead.is_escalated) {
        await db.query(
          `INSERT INTO escalations (id, lead_id, assigned_to, reason, urgency, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidv4(), lead.id, lead.escalated_to || 'Human Dispatcher', lead.escalation_reason || 'Urgent requirement', 'urgent', 'pending', lead.created_at]
        );
      }
    }

    console.log(`✅ [Seed] Successfully seeded ${realisticHvacLeads.length} demo HVAC leads with transcripts, notes, and escalations.`);
  } catch (err) {
    console.error('❌ [Seed Error]:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase().then(() => {
    console.log('🏁 Seeding finished.');
    process.exit(0);
  });
}

module.exports = { seedDatabase, realisticHvacLeads };
