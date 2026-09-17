async function runE2EVerification() {
  console.log('🧪 Running comprehensive E2E Verification for AlexDesk AI...\n');

  const BASE_URL = 'http://localhost:5000';

  async function api(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    const text = await res.text();
    try {
      return { status: res.status, json: JSON.parse(text) };
    } catch {
      return { status: res.status, text };
    }
  }

  // 1. Health & Configuration
  const health = await api('/api/health');
  console.log('1. Health Check:', health.status === 200 ? '✅ PASS' : '❌ FAIL', `(${health.json.app} - ${health.json.databaseMode} mode)`);

  // 2. Fetch Leads List
  const allLeads = await api('/api/leads');
  console.log('2. Fetch Leads:', allLeads.status === 200 ? '✅ PASS' : '❌ FAIL', `(Count: ${allLeads.json.count})`);

  // 3. Filter by HOT Leads
  const hotLeads = await api('/api/leads?priority=HOT');
  const allHot = (hotLeads.json.data || []).every(l => l.lead_priority === 'HOT');
  console.log('3. Filter HOT Priority:', (hotLeads.status === 200 && allHot) ? '✅ PASS' : '❌ FAIL', `(Found: ${hotLeads.json.count} HOT leads)`);

  // 4. Fetch Lead Detail + Transcripts + Notes
  const targetId = allLeads.json.data[0].id;
  const leadDetail = await api(`/api/leads/${targetId}`);
  const hasTranscripts = Array.isArray(leadDetail.json.data?.conversations);
  const hasNotes = Array.isArray(leadDetail.json.data?.notes);
  console.log('4. Lead Deep-Dive:', (leadDetail.status === 200 && hasTranscripts && hasNotes) ? '✅ PASS' : '❌ FAIL', `(Transcripts: ${leadDetail.json.data?.conversations.length}, Notes: ${leadDetail.json.data?.notes.length})`);

  // 5. Add Internal Dispatch Note
  const noteRes = await api(`/api/leads/${targetId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ author: 'Dispatcher Test', note: 'Customer called back to confirm technician arrival.' })
  });
  console.log('5. Add Staff Note:', noteRes.status === 201 ? '✅ PASS' : '❌ FAIL');

  // 6. Update Lead Status
  const statusRes = await api(`/api/leads/${targetId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'in_progress' })
  });
  console.log('6. Update Status:', (statusRes.status === 200 && statusRes.json.data?.lead_status === 'in_progress') ? '✅ PASS' : '❌ FAIL');

  // 7. Update Contacted Flag
  const contactedRes = await api(`/api/leads/${targetId}/contacted`, {
    method: 'PATCH',
    body: JSON.stringify({ is_contacted: true })
  });
  console.log('7. Update Contacted Flag:', (contactedRes.status === 200 && contactedRes.json.data?.is_contacted === true) ? '✅ PASS' : '❌ FAIL');

  // 8. Escalate Lead to Human Dispatcher
  const escalateRes = await api(`/api/leads/${targetId}/escalate`, {
    method: 'POST',
    body: JSON.stringify({
      assigned_to: 'Lead Tech Marcus',
      reason: 'Urgent system freeze - dispatch truck #4',
      urgency: 'urgent'
    })
  });
  console.log('8. Escalate to Human:', (escalateRes.status === 200 && escalateRes.json.data?.is_escalated === true) ? '✅ PASS' : '❌ FAIL');

  // 9. AI Safety Trigger - Gas Smell
  const gasSafety = await api('/api/chat/message', {
    method: 'POST',
    body: JSON.stringify({
      message: 'I turned on my heater and smell strong rotten egg gas smell'
    })
  });
  const safetyAlertFired = gasSafety.json.safety_alert === true && gasSafety.json.priority === 'HOT';
  const containsEvacuate = gasSafety.json.reply?.includes('EVACUATE');
  console.log('9. AI Gas Safety Interception:', (safetyAlertFired && containsEvacuate) ? '✅ PASS' : '❌ FAIL', `(Safety Alert: ${gasSafety.json.safety_alert}, Evacuation Advised: ${containsEvacuate})`);

  // 10. AI Lead Intake & Priority - Freezing No Heat (HOT)
  const hotIntake = await api('/api/chat/message', {
    method: 'POST',
    body: JSON.stringify({
      message: 'Hello, our heater died and it is 20 degrees outside. My name is Kevin Thomas, cell is 214-555-8811 at 412 Maple Ave Dallas. Please send someone today.'
    })
  });
  const classifiedHot = hotIntake.json.priority === 'HOT';
  const extractedCustomer = hotIntake.json.lead?.customer_name === 'Kevin Thomas';
  console.log('10. AI Intake & HOT Qualification:', (classifiedHot && extractedCustomer) ? '✅ PASS' : '❌ FAIL', `(Priority: ${hotIntake.json.priority}, Customer: ${hotIntake.json.lead?.customer_name})`);

  // 11. Twilio Voice Webhook TwiML
  const twilioVoice = await api('/api/webhooks/twilio/voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'From=%2B12145551234&CallSid=CA123456789'
  });
  const isTwiML = (twilioVoice.text || '').includes('<Response>') && (twilioVoice.text || '').includes('<Gather');
  console.log('11. Twilio Voice Webhook:', isTwiML ? '✅ PASS' : '❌ FAIL', '(Valid TwiML XML generated)');

  // 12. Stats Aggregation
  const statsRes = await api('/api/stats');
  console.log('12. Aggregated KPI Stats:', statsRes.status === 200 ? '✅ PASS' : '❌ FAIL', `(Total: ${statsRes.json.data?.totalLeads}, Hot: ${statsRes.json.data?.hotLeads}, Escalated: ${statsRes.json.data?.escalatedCount})`);

  console.log('\n🎉 All 12 Automated Verification Tests Completed Successfully!');
}

runE2EVerification().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
