const OpenAI = require('openai');
const { checkSafetyHazard } = require('./safetyService');
const { classifyLead } = require('./leadClassifierService');
require('dotenv').config();

const SYSTEM_PROMPT = `
You are Alex, an intelligent, friendly, and professional AI receptionist for Apex Comfort Heating & Air, a licensed US HVAC service contractor.

YOUR OBJECTIVE:
Communicate with HVAC customers, collect qualified service lead information, handle basic conversations, and escalate to a human dispatcher when appropriate.

CORE GUIDELINES:
1. Tone: Friendly, empathetic, concise, and natural. Keep responses under 3-4 sentences whenever possible.
2. Identity: If asked if you are an AI or robot, politely confirm: "Yes, I'm Alex, the AI receptionist for Apex Comfort Heating & Air. I'm here to help gather your details and coordinate service for you."
3. Pricing & Policies: NEVER invent specific prices, guaranteed arrival times, warranties, or company guarantees. Say: "Our certified technicians provide exact upfront pricing after evaluating your system on-site."
4. Safety First: If the customer mentions gas smell, rotten eggs, carbon monoxide, smoke, flames, or serious electrical danger, STOP immediately, advise evacuation to fresh air, and instruct them to call 911 or their gas utility provider from outside.
5. No Dangerous Diagnosis: NEVER diagnose hazardous gas, electrical, or carbon monoxide faults.
6. Memory & Repetition: NEVER re-ask for information already provided (name, address, phone, issue).
7. Privacy: NEVER ask for credit card numbers, banking info, or passwords.
8. Scheduling: NEVER state an appointment is 100% booked; say dispatch will review technician routes and call/text to confirm the exact arrival window.
9. Escalation: If the customer explicitly asks for a human agent or has an overly complex request, graciously escalate and let them know a human dispatcher is being notified.

YOU MUST ALWAYS RETURN A VALID JSON OBJECT with this exact structure:
{
  "reply": "Your conversational response to the customer",
  "extractedLead": {
    "customer_name": "string or null",
    "phone_number": "string or null",
    "service_address": "string or null",
    "hvac_service_type": "string (e.g. Heating Repair, AC Cooling, Heat Pump, Maintenance Tune-up, Gas Emergency, Other) or null",
    "problem_description": "string summary or null",
    "problem_started": "string or null",
    "preferred_service_time": "string or null"
  },
  "safety_alert": boolean,
  "safety_notes": "string or null",
  "should_escalate": boolean,
  "escalate_reason": "string or null"
}
`;

class AIReceptionistService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.openai = this.apiKey ? new OpenAI({ apiKey: this.apiKey }) : null;
  }

  async processTurn({ messages = [], currentLead = {} }) {
    const latestMessage = messages[messages.length - 1]?.content || '';

    // 1. Mandatory Safety Pre-Check
    const safetyCheck = checkSafetyHazard(latestMessage);
    if (safetyCheck.isHazard) {
      const mergedLead = {
        ...currentLead,
        safety_alert: true,
        safety_notes: safetyCheck.responseMessage,
        is_escalated: true,
        escalation_reason: safetyCheck.escalateReason,
        lead_priority: 'HOT',
        lead_status: 'escalated'
      };

      return {
        reply: safetyCheck.responseMessage,
        extractedLead: {
          customer_name: currentLead.customer_name || null,
          phone_number: currentLead.phone_number || null,
          service_address: currentLead.service_address || null,
          hvac_service_type: 'Safety Hazard / Emergency',
          problem_description: latestMessage,
          problem_started: 'Immediate',
          preferred_service_time: 'Emergency Dispatch Required'
        },
        safety_alert: true,
        safety_notes: safetyCheck.responseMessage,
        should_escalate: true,
        escalate_reason: safetyCheck.escalateReason,
        priority: 'HOT',
        priority_rationale: 'Classified HOT: Immediate safety emergency detected.'
      };
    }

    // 2. Check for explicit human agent request
    const asksForHuman = /\b(speak to a human|human agent|real person|talk to someone|representative|manager)\b/i.test(latestMessage);

    // 3. Process with OpenAI if API Key configured
    if (this.openai && this.apiKey && this.apiKey.trim() !== '') {
      try {
        const formattedMessages = [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'system',
            content: `CURRENT KNOWN LEAD DATA: ${JSON.stringify(currentLead)}. DO NOT re-ask for details already present.`
          },
          ...messages.map(m => ({
            role: m.role === 'alex_ai' ? 'assistant' : m.role === 'customer' ? 'user' : 'system',
            content: m.content
          }))
        ];

        const response = await this.openai.chat.completions.create({
          model: this.model,
          messages: formattedMessages,
          response_format: { type: 'json_object' },
          temperature: 0.3
        });

        const parsed = JSON.parse(response.choices[0].message.content);

        // Merge extracted data
        const extracted = parsed.extractedLead || {};
        const combinedLead = {
          customer_name: extracted.customer_name || currentLead.customer_name,
          phone_number: extracted.phone_number || currentLead.phone_number,
          service_address: extracted.service_address || currentLead.service_address,
          hvac_service_type: extracted.hvac_service_type || currentLead.hvac_service_type,
          problem_description: extracted.problem_description || currentLead.problem_description,
          problem_started: extracted.problem_started || currentLead.problem_started,
          preferred_service_time: extracted.preferred_service_time || currentLead.preferred_service_time,
          safety_alert: parsed.safety_alert || false,
          transcriptText: messages.map(m => m.content).join(' ')
        };

        const classification = classifyLead(combinedLead);

        return {
          reply: parsed.reply,
          extractedLead: extracted,
          safety_alert: parsed.safety_alert || false,
          safety_notes: parsed.safety_notes || null,
          should_escalate: parsed.should_escalate || asksForHuman,
          escalate_reason: asksForHuman ? 'Customer requested a live human agent' : (parsed.escalate_reason || null),
          priority: classification.priority,
          priority_rationale: classification.rationale
        };
      } catch (err) {
        console.warn('⚠️ OpenAI API call failed, switching to intelligent HVAC fallback engine:', err.message);
      }
    }

    // 4. Intelligent Built-in Fallback Conversational Engine
    return this.fallbackConversationEngine(messages, currentLead, asksForHuman);
  }

  fallbackConversationEngine(messages, currentLead, asksForHuman) {
    const latestMessage = messages[messages.length - 1]?.content || '';
    const fullTranscript = messages.map(m => m.content).join(' ');

    // Check identity inquiry
    const asksIdentity = /\b(are you ai|are you a bot|are you a robot|are you real|who are you)\b/i.test(latestMessage);
    const asksPricing = /\b(how much|cost|price|quote|rates|ballpark)\b/i.test(latestMessage);

    // Entity Extraction using regex & heuristics
    const extracted = { ...currentLead };

    // Phone extraction
    const phoneMatch = latestMessage.match(/(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
    if (phoneMatch && !extracted.phone_number) {
      extracted.phone_number = phoneMatch[0];
    }

    // Name extraction heuristic
    const nameMatch = latestMessage.match(/(?:my name is|i am|this is|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i) ||
                      latestMessage.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)[,\.]?\s+(\(?\d{3}\)?)/);
    if (nameMatch && !extracted.customer_name) {
      extracted.customer_name = nameMatch[1].trim();
    }

    // Address extraction heuristic
    const addressMatch = latestMessage.match(/\b\d+\s+[A-Za-z0-9\s.,]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Blvd|Court|Ct|Way|Plano|Dallas|Irving|Fort Worth|Arlington)\b[A-Za-z0-9\s,]*/i);
    if (addressMatch && !extracted.service_address) {
      extracted.service_address = addressMatch[0].trim();
    }

    // Service type heuristic
    if (/\b(furnace|heater|heating|cold air|freezing)\b/i.test(fullTranscript)) {
      extracted.hvac_service_type = 'Heating / Furnace Repair';
    } else if (/\b(ac|air condition|cooling|warm air|freon|refrigerant)\b/i.test(fullTranscript)) {
      extracted.hvac_service_type = 'AC Cooling Repair';
    } else if (/\b(tune-up|maintenance|filter|inspection)\b/i.test(fullTranscript)) {
      extracted.hvac_service_type = 'Preventative Maintenance';
    } else if (/\b(replace|new unit|quote|estimate|upgrade)\b/i.test(fullTranscript)) {
      extracted.hvac_service_type = 'System Replacement Estimate';
    } else if (/\b(water leak|dripping|drain)\b/i.test(fullTranscript)) {
      extracted.hvac_service_type = 'Condensate Drain / Leak';
    }

    // Problem description
    if (!extracted.problem_description && latestMessage.length > 10 && !phoneMatch) {
      extracted.problem_description = latestMessage;
    }

    // Preferred service time
    const timeMatch = latestMessage.match(/\b(today|tomorrow|morning|afternoon|evening|asap|first available|\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i);
    if (timeMatch && !extracted.preferred_service_time) {
      extracted.preferred_service_time = timeMatch[0];
    }

    // Classification
    const combinedLeadForClassifier = {
      ...extracted,
      transcriptText: fullTranscript
    };
    const classification = classifyLead(combinedLeadForClassifier);

    // Formulate response
    let reply = '';

    if (asksIdentity) {
      reply = "Yes, I am Alex, the AI receptionist for Apex Comfort Heating & Air. I can take down your system issues and get you connected with our service dispatchers right away.";
    } else if (asksForHuman) {
      reply = "I completely understand. I'm alerting our human dispatch team right now. If you've provided your phone number, a live dispatcher will call you directly.";
    } else if (asksPricing) {
      reply = "Our certified technicians provide clear, upfront quotes after assessing your specific system on-site. May I have your name and service address to check our technician schedule?";
    } else if (!extracted.problem_description) {
      reply = "Hello! Thanks for reaching Apex Comfort Heating & Air. I'm Alex. Could you briefly tell me what HVAC issue you are experiencing today?";
    } else if (!extracted.customer_name || !extracted.phone_number) {
      reply = "I understand the issue with your system. To ensure our dispatch team can reach you and coordinate a technician, what is your name and best phone number?";
    } else if (!extracted.service_address) {
      reply = `Thank you, ${extracted.customer_name || ''}! What is the service address where the HVAC system is located?`;
    } else if (!extracted.preferred_service_time) {
      reply = "Got your address. What day or time window works best for our technician to visit your home?";
    } else {
      reply = `Thank you, ${extracted.customer_name}! I have gathered all your details and flagged this for our dispatch team. Our dispatcher will review the technician schedule and call or text your number to confirm the exact arrival window.`;
    }

    return {
      reply,
      extractedLead: extracted,
      safety_alert: false,
      safety_notes: null,
      should_escalate: asksForHuman,
      escalate_reason: asksForHuman ? 'Customer requested a human agent' : null,
      priority: classification.priority,
      priority_rationale: classification.rationale
    };
  }
}

module.exports = new AIReceptionistService();
