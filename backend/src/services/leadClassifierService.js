/**
 * AlexDesk AI - Lead Priority Classifier Engine
 * Intelligently classifies HVAC leads into HOT, WARM, or COLD based on prompt context,
 * urgency, service type, and contact readiness.
 */

function classifyLead({
  hvac_service_type = '',
  problem_description = '',
  preferred_service_time = '',
  phone_number = '',
  customer_name = '',
  safety_alert = false,
  transcriptText = ''
}) {
  const combinedText = `${hvac_service_type} ${problem_description} ${preferred_service_time} ${transcriptText}`.toLowerCase();

  // Safety hazards are ALWAYS HOT
  if (safety_alert) {
    return {
      priority: 'HOT',
      rationale: 'Classified HOT: Critical safety hazard (gas, carbon monoxide, or electrical emergency) requires immediate emergency dispatch handling.'
    };
  }

  // 1. HOT CRITERIA:
  // - No heating or cooling
  // - Urgent service request
  // - Customer is ready to schedule
  // - Contact information collected
  const noHeatCoolPatterns = [
    /\b(no heat|no heating|heater (died|stopped|broken|not working)|furnace (dead|stopped|died|cold air|not heating))\b/i,
    /\b(no ac|no cooling|ac (died|broken|not cooling|hot air|warm air)|condenser (stopped|broken))\b/i,
    /\b(freezing|freezing inside|extreme cold|8[5-9] degrees inside|9[0-9] degrees inside)\b/i,
    /\b(emergency|asap|urgent|flooding|water leaking from ceiling|leaking through ceiling)\b/i
  ];

  const readyToSchedulePatterns = [
    /\b(ready to schedule|book today|come today|first available|as soon as possible|send someone)\b/i,
    /\b(morning|afternoon|today|tomorrow|now)\b/i
  ];

  const hasNoHeatOrCool = noHeatCoolPatterns.some(p => p.test(combinedText));
  const hasUrgentNeed = /\b(emergency|urgent|leak|water damage|now|asap|today)\b/i.test(combinedText);
  const hasContactInfo = Boolean(phone_number && phone_number.replace(/\D/g, '').length >= 7);
  const isReadyToSchedule = readyToSchedulePatterns.some(p => p.test(combinedText)) || Boolean(preferred_service_time);

  if ((hasNoHeatOrCool || hasUrgentNeed) && (hasContactInfo || isReadyToSchedule)) {
    return {
      priority: 'HOT',
      rationale: 'Classified HOT: Direct loss of heating/cooling or urgent property risk with contact details or immediate scheduling intent.'
    };
  }

  if (hasNoHeatOrCool || hasUrgentNeed) {
    return {
      priority: 'HOT',
      rationale: 'Classified HOT: Urgent service outage requiring immediate callback for scheduling.'
    };
  }

  // 2. WARM CRITERIA:
  // - Estimate request
  // - Maintenance inquiry
  // - Customer considering service
  const warmPatterns = [
    /\b(estimate|quote|replacement|replace|new unit|new system|heat pump quote|upgrade|install)\b/i,
    /\b(tune-up|tune up|maintenance|check-up|inspection|service check|filter change|seasonal service)\b/i,
    /\b(considering|thinking about|looking for options|next week|sometime this month)\b/i
  ];

  const isWarm = warmPatterns.some(p => p.test(combinedText));
  if (isWarm) {
    return {
      priority: 'WARM',
      rationale: 'Classified WARM: Customer seeking system estimate, proactive maintenance, or scheduled HVAC inspection.'
    };
  }

  // 3. COLD CRITERIA:
  // - General information
  // - Browsing
  // - No immediate service need
  const coldPatterns = [
    /\b(just curious|just wondering|general inquiry|what brands|do you service|browsing|shopping around)\b/i
  ];

  const isCold = coldPatterns.some(p => p.test(combinedText));
  if (isCold || !hasContactInfo) {
    return {
      priority: 'COLD',
      rationale: 'Classified COLD: General information inquiry or exploratory browsing with no immediate scheduling commitment.'
    };
  }

  // Default fallback based on contact availability
  return {
    priority: hasContactInfo ? 'WARM' : 'COLD',
    rationale: hasContactInfo
      ? 'Classified WARM: General service inquiry with contact information collected.'
      : 'Classified COLD: Unqualified inquiry without immediate scheduling action.'
  };
}

module.exports = {
  classifyLead
};
