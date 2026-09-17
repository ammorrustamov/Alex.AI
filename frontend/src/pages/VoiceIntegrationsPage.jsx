import React, { useState } from 'react';
import { PhoneCall, MessageSquare, Radio, Check, Terminal, ExternalLink, Sparkles } from 'lucide-react';

export default function VoiceIntegrationsPage() {
  const [callerNumber, setCallerNumber] = useState('+1 (214) 555-8910');
  const [speechResult, setSpeechResult] = useState('Our heater stopped working this morning and it is freezing inside.');
  const [twimlOutput, setTwimlOutput] = useState('');
  const [testing, setTesting] = useState(false);

  const handleTestVoiceWebhook = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/webhooks/twilio/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          SpeechResult: speechResult,
          From: callerNumber,
          CallSid: `test-call-${Date.now()}`
        })
      });

      const xmlText = await res.text();
      setTwimlOutput(xmlText);
    } catch (err) {
      setTwimlOutput(`Error testing webhook: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="content-page">
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-cyan)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Radio size={14} />
          <span>Telephony & Speech Infrastructure</span>
        </div>
        <h2 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '4px' }}>
          Twilio Voice & SMS Integration Hub
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          AlexDesk AI is designed to integrate seamlessly with Twilio or SIP telephony providers without rewriting core application code.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Webhook Endpoints Card */}
        <div className="stat-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <PhoneCall size={20} color="var(--brand-cyan)" />
            <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>Voice Webhook Endpoints</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <span className="field-label">Incoming Voice Call (Greeting):</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--brand-cyan)', marginTop: '4px' }}>
                POST /api/webhooks/twilio/voice
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <span className="field-label">Speech Processing (Gather action):</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--brand-cyan)', marginTop: '4px' }}>
                POST /api/webhooks/twilio/voice/process
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <span className="field-label">Two-Way SMS Messaging:</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--brand-cyan)', marginTop: '4px' }}>
                POST /api/webhooks/twilio/sms
              </div>
            </div>
          </div>
        </div>

        {/* Integration Architecture Card */}
        <div className="stat-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Terminal size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>Setup Instructions</h3>
          </div>

          <ol style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: '1.7' }}>
            <li>Purchase a local HVAC dispatch phone number in Twilio.</li>
            <li>Configure Twilio Voice webhook URL to point to your AlexDesk domain: <code>https://your-domain.com/api/webhooks/twilio/voice</code></li>
            <li>Configure HTTP method as <strong>HTTP POST</strong>.</li>
            <li>Incoming customer calls are answered by Alex with neural text-to-speech, real-time lead extraction, and emergency escalation.</li>
          </ol>
        </div>
      </div>

      {/* Interactive Webhook Simulator */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sparkles size={20} color="var(--brand-cyan)" />
          <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Live Twilio Webhook Simulator</h3>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Simulate an incoming HTTP webhook from Twilio Speech-To-Text to test raw TwiML XML responses.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
              Caller Caller ID (From)
            </label>
            <input
              type="text"
              className="chat-input"
              value={callerNumber}
              onChange={(e) => setCallerNumber(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
              Recognized Speech (SpeechResult)
            </label>
            <input
              type="text"
              className="chat-input"
              value={speechResult}
              onChange={(e) => setSpeechResult(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleTestVoiceWebhook}
          disabled={testing}
        >
          <span>{testing ? 'Testing Webhook...' : 'Simulate Twilio Voice Webhook Call'}</span>
        </button>

        {twimlOutput && (
          <div style={{ marginTop: '20px' }}>
            <span className="field-label">Generated TwiML XML Output:</span>
            <pre
              style={{
                background: '#040711',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                color: '#38bdf8',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                overflowX: 'auto',
                marginTop: '6px'
              }}
            >
              {twimlOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
