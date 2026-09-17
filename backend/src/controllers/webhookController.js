const voiceService = require('../services/voiceIntegrationService');
const aiReceptionistService = require('../services/aiReceptionistService');
const Lead = require('../models/Lead');
const Conversation = require('../models/Conversation');

/**
 * Handle incoming Twilio voice call webhook
 */
exports.handleTwilioVoice = async (req, res) => {
  const callerNumber = req.body.From || 'Unknown Phone';
  const callSid = req.body.CallSid || `call-${Date.now()}`;

  const greeting = `Thank you for calling Apex Comfort Heating & Air. I am Alex, the AI receptionist. Please describe the heating or air conditioning issue you are experiencing today.`;

  const twiml = voiceService.generateVoiceTwiML({
    speechText: greeting,
    shouldGather: true,
    actionUrl: `/api/webhooks/twilio/voice/process?callSid=${callSid}&caller=${encodeURIComponent(callerNumber)}`
  });

  res.type('text/xml');
  res.send(twiml);
};

/**
 * Handle speech input gathered from caller
 */
exports.handleTwilioVoiceProcess = async (req, res) => {
  const speechResult = req.body.SpeechResult || '';
  const callerNumber = req.query.caller || req.body.From || '';
  const callSid = req.query.callSid || req.body.CallSid || `call-${Date.now()}`;

  const leadId = `lead-voice-${callSid.substring(0, 10)}`;

  // Store conversation turn
  await Conversation.addMessage(leadId, 'customer', speechResult);

  const turnResult = await aiReceptionistService.processTurn({
    messages: [{ role: 'customer', content: speechResult }],
    currentLead: { phone_number: callerNumber }
  });

  await Conversation.addMessage(leadId, 'alex_ai', turnResult.reply);

  // If safety emergency or should escalate, inform caller and hangup or bridge
  const twiml = voiceService.generateVoiceTwiML({
    speechText: turnResult.reply,
    shouldGather: !turnResult.safety_alert && !turnResult.should_escalate,
    actionUrl: `/api/webhooks/twilio/voice/process?callSid=${callSid}&caller=${encodeURIComponent(callerNumber)}`
  });

  res.type('text/xml');
  res.send(twiml);
};

/**
 * Handle incoming Twilio SMS webhook
 */
exports.handleTwilioSms = async (req, res) => {
  const messageBody = req.body.Body || '';
  const fromNumber = req.body.From || '';
  const leadId = `lead-sms-${fromNumber.replace(/\D/g, '') || Date.now()}`;

  await Conversation.addMessage(leadId, 'customer', messageBody);

  const turnResult = await aiReceptionistService.processTurn({
    messages: [{ role: 'customer', content: messageBody }],
    currentLead: { phone_number: fromNumber }
  });

  await Conversation.addMessage(leadId, 'alex_ai', turnResult.reply);

  const twiml = voiceService.generateSmsTwiML(turnResult.reply);
  res.type('text/xml');
  res.send(twiml);
};
