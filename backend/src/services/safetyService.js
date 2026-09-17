/**
 * AlexDesk AI - Emergency Safety Guardrails Engine
 * Dedicated safety evaluator for hazardous HVAC, gas, and electrical emergencies.
 */

const SAFETY_TRIGGERS = [
  {
    type: 'gas_leak',
    patterns: [
      /\b(gas smell|smell gas|smelling gas|gas odor|rotten egg|sulfur odor|sulfur smell|hissing gas|gas leak)\b/i
    ],
    severity: 'CRITICAL_SAFETY',
    responseMessage:
      '🚨 CRITICAL SAFETY EMERGENCY: Please STOP troubleshooting immediately. A rotten egg or sulfur smell indicates a potential gas leak. For your safety, EVACUATE the building immediately. Do NOT turn on or off any light switches, electrical equipment, or open flames. Once safely outside, call 911 and your local gas utility provider immediately. Our emergency safety team has been alerted.',
    escalateReason: 'CRITICAL SAFETY: Potential natural gas leak reported by customer.'
  },
  {
    type: 'carbon_monoxide',
    patterns: [
      /\b(carbon monoxide|co detector|co alarm|carbon monoxide alarm|feeling dizzy.*furnace|nauseous.*heater)\b/i
    ],
    severity: 'CRITICAL_SAFETY',
    responseMessage:
      '🚨 CRITICAL SAFETY EMERGENCY: If your carbon monoxide alarm is sounding or you feel dizzy, headache, or nauseous, please EVACUATE your home immediately to fresh outdoor air and call 911. Carbon monoxide is invisible and dangerous. Please do not re-enter until first responders clear the premises.',
    escalateReason: 'CRITICAL SAFETY: Carbon monoxide alert or symptoms reported.'
  },
  {
    type: 'fire_smoke_electrical',
    patterns: [
      /\b(smoke from furnace|smoke from ac|sparks|sparking|flames|fire|burning plastic|circuit breaker popping|electrical burning)\b/i
    ],
    severity: 'CRITICAL_SAFETY',
    responseMessage:
      '🚨 CRITICAL SAFETY WARNING: Smoke, flames, or electrical sparking is an immediate fire hazard. Please shut off the system if safe to do so, evacuate the immediate area, and call 911 if there is active smoke or fire. A certified emergency HVAC technician has been flagged.',
    escalateReason: 'CRITICAL SAFETY: Fire, smoke, or active electrical sparking hazard.'
  }
];

function checkSafetyHazard(text) {
  if (!text || typeof text !== 'string') {
    return { isHazard: false };
  }

  for (const trigger of SAFETY_TRIGGERS) {
    for (const pattern of trigger.patterns) {
      if (pattern.test(text)) {
        return {
          isHazard: true,
          type: trigger.type,
          severity: trigger.severity,
          responseMessage: trigger.responseMessage,
          escalateReason: trigger.escalateReason
        };
      }
    }
  }

  return { isHazard: false };
}

module.exports = {
  checkSafetyHazard,
  SAFETY_TRIGGERS
};
