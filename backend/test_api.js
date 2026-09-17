const app = require('./src/app');
const http = require('http');

async function runTests() {
  const server = http.createServer(app);
  await new Promise(res => server.listen(5099, res));
  console.log('Test server started on port 5099');

  // Helper fetch
  async function api(path, opts = {}) {
    const res = await fetch(`http://localhost:5099${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opts
    });
    return { status: res.status, data: await res.json() };
  }

  // 1. Health check
  const health = await api('/api/health');
  console.log('Health check:', health.status, health.data.app, health.data.status);

  // 2. Fetch leads
  const leads = await api('/api/leads');
  console.log('Leads count:', leads.data.count);

  // 3. Test Chat Safety Trigger
  const gasChat = await api('/api/chat/message', {
    method: 'POST',
    body: JSON.stringify({
      message: 'I think I smell a rotten egg gas smell near my heater'
    })
  });
  console.log('Safety check response alert:', gasChat.data.safety_alert, 'Priority:', gasChat.data.priority);
  console.log('Safety reply preview:', gasChat.data.reply.substring(0, 50));

  // 4. Test Normal Lead Intake
  const normalChat = await api('/api/chat/message', {
    method: 'POST',
    body: JSON.stringify({
      message: 'My furnace stopped working and it is 30 degrees outside. My name is Mark Davis, phone is 214-555-9988 at 505 Main St Dallas.'
    })
  });
  console.log('Normal Chat priority:', normalChat.data.priority);
  console.log('Extracted name:', normalChat.data.lead?.customer_name, 'Phone:', normalChat.data.lead?.phone_number);

  // 5. Test Stats
  const stats = await api('/api/stats');
  console.log('Stats totals:', stats.data.data.totalLeads, 'Hot:', stats.data.data.hotLeads);

  server.close();
  console.log('All backend API tests completed successfully!');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
