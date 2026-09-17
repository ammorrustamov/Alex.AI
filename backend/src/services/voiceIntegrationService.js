/**
 * AlexDesk AI - Voice & Telephony Integration Service
 * Prepares webhook responses and TwiML XML generators for Twilio Voice and SMS,
 * enabling full telephony integration without altering core business logic.
 */

class VoiceIntegrationService {
  /**
   * Generates TwiML XML response for an incoming phone call
   */
  generateVoiceTwiML({ speechText, shouldGather = true, actionUrl = '/api/webhooks/twilio/voice/process' }) {
    if (!shouldGather) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna-Neural">${escapeXml(speechText)}</Say>
    <Hangup/>
</Response>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather input="speech" action="${actionUrl}" method="POST" speechTimeout="auto" language="en-US">
        <Say voice="Polly.Joanna-Neural">${escapeXml(speechText)}</Say>
    </Gather>
    <Say voice="Polly.Joanna-Neural">I didn't catch that. Please give us a call back or visit our website.</Say>
</Response>`;
  }

  /**
   * Generates TwiML XML response for SMS
   */
  generateSmsTwiML(replyText) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${escapeXml(replyText)}</Message>
</Response>`;
  }
}

function escapeXml(unsafe) {
  return (unsafe || '').replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

module.exports = new VoiceIntegrationService();
