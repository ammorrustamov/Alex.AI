const aiReceptionistService = require('../services/aiReceptionistService');
const Lead = require('../models/Lead');
const Conversation = require('../models/Conversation');
const { v4: uuidv4 } = require('uuid');

exports.sendMessage = async (req, res, next) => {
  try {
    const { leadId: inputLeadId, message, currentLead = {} } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const leadId = inputLeadId || `lead-live-${Date.now().toString(36)}`;

    // 1. Fetch existing conversation history
    const existingHistory = await Conversation.findByLeadId(leadId);

    // Add user's incoming message
    await Conversation.addMessage(leadId, 'customer', message);

    const fullMessages = [
      ...existingHistory.map(m => ({ role: m.role, content: m.content })),
      { role: 'customer', content: message }
    ];

    // Fetch existing lead data from DB if exists
    const dbLead = await Lead.findById(leadId);
    const effectiveCurrentLead = {
      ...(dbLead || {}),
      ...(currentLead || {})
    };

    // 2. Process turn via AI Receptionist Service
    const aiResult = await aiReceptionistService.processTurn({
      messages: fullMessages,
      currentLead: effectiveCurrentLead
    });

    // 3. Store AI response message
    await Conversation.addMessage(leadId, 'alex_ai', aiResult.reply, {
      extracted: aiResult.extractedLead,
      safety_alert: aiResult.safety_alert,
      priority: aiResult.priority
    });

    // 4. Merge extracted fields into lead entity
    const updatedLeadData = {
      id: leadId,
      customer_name: aiResult.extractedLead?.customer_name || effectiveCurrentLead.customer_name || 'Inquiry Caller',
      phone_number: aiResult.extractedLead?.phone_number || effectiveCurrentLead.phone_number || null,
      service_address: aiResult.extractedLead?.service_address || effectiveCurrentLead.service_address || null,
      hvac_service_type: aiResult.extractedLead?.hvac_service_type || effectiveCurrentLead.hvac_service_type || 'General HVAC',
      problem_description: aiResult.extractedLead?.problem_description || effectiveCurrentLead.problem_description || message,
      problem_started: aiResult.extractedLead?.problem_started || effectiveCurrentLead.problem_started || null,
      preferred_service_time: aiResult.extractedLead?.preferred_service_time || effectiveCurrentLead.preferred_service_time || null,
      lead_priority: aiResult.priority || 'WARM',
      lead_status: aiResult.safety_alert || aiResult.should_escalate ? 'escalated' : (effectiveCurrentLead.lead_status || 'new'),
      is_contacted: effectiveCurrentLead.is_contacted || false,
      is_escalated: aiResult.should_escalate || effectiveCurrentLead.is_escalated || false,
      escalation_reason: aiResult.escalate_reason || effectiveCurrentLead.escalation_reason || null,
      escalated_to: aiResult.should_escalate ? (effectiveCurrentLead.escalated_to || 'Human Dispatcher') : null,
      safety_alert: aiResult.safety_alert || effectiveCurrentLead.safety_alert || false,
      safety_notes: aiResult.safety_notes || effectiveCurrentLead.safety_notes || null,
      ai_classification_rationale: aiResult.priority_rationale || effectiveCurrentLead.ai_classification_rationale || null,
      is_demo: false
    };

    let savedLead;
    if (dbLead) {
      // In a real environment, update full fields; for now, recreate/update
      savedLead = await Lead.create(updatedLeadData);
    } else {
      savedLead = await Lead.create(updatedLeadData);
    }

    res.json({
      success: true,
      leadId,
      reply: aiResult.reply,
      lead: savedLead,
      safety_alert: aiResult.safety_alert,
      should_escalate: aiResult.should_escalate,
      priority: aiResult.priority,
      priority_rationale: aiResult.priority_rationale
    });
  } catch (err) {
    next(err);
  }
};

exports.resetChat = async (req, res, next) => {
  try {
    const newLeadId = `lead-live-${Date.now().toString(36)}`;
    const greeting = "Hello! Thank you for calling Apex Comfort Heating & Air. My name is Alex, the AI receptionist. How can I help with your heating or cooling system today?";

    await Conversation.addMessage(newLeadId, 'alex_ai', greeting);

    res.json({
      success: true,
      leadId: newLeadId,
      reply: greeting
    });
  } catch (err) {
    next(err);
  }
};
