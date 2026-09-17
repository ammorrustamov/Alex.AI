import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  User,
  Send,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Flame,
  Sun,
  Snowflake,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

const QUICK_SCENARIOS = [
  {
    id: 'freezing_no_heat',
    label: '❄️ Freezing Winter - No Heat',
    tag: 'HOT Lead',
    message: 'Hello, our heater died early this morning and it is 28 degrees outside. We have an elderly grandmother in the house and need someone as soon as possible. My name is Kevin Thomas, 214-555-4819, 412 Maple Ave Dallas.'
  },
  {
    id: 'gas_leak_hazard',
    label: '🚨 Gas Odor / Rotten Eggs',
    tag: 'Safety Protocol',
    message: 'I just switched the heat on and there is a very strong rotten egg gas smell coming from the hallway furnace closet.'
  },
  {
    id: 'ac_warm_air',
    label: '🔥 Summer AC Blowing Warm',
    tag: 'HOT Lead',
    message: 'Our AC outdoor unit is buzzing loudly and blowing warm humid air. House is 83 degrees. Can someone come this afternoon? My phone is 817-555-7721.'
  },
  {
    id: 'replacement_quote',
    label: '🏡 Heat Pump Quote',
    tag: 'WARM Lead',
    message: 'Hi Alex, our 18-year-old AC unit is getting old and we are looking for a free estimate on upgrading to a modern variable-speed heat pump before next season.'
  },
  {
    id: 'routine_maintenance',
    label: '🔧 Fall Safety Tune-Up',
    tag: 'WARM Lead',
    message: 'Hi, I would like to schedule our annual precision heating tune-up and safety inspection for next Tuesday.'
  },
  {
    id: 'general_cold',
    label: '❓ General Rates Inquiry',
    tag: 'COLD Lead',
    message: 'Do you guys service commercial rooftop units in Collin County and what is your hourly rate for diagnostics?'
  },
  {
    id: 'ask_human',
    label: '👤 Request Human Agent',
    tag: 'Escalation',
    message: 'Can I speak to a real human manager or dispatcher right now?'
  }
];

export default function ReceptionistSimulatorPage({ onNavigateToDashboard }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [leadId, setLeadId] = useState(null);
  const [currentLead, setCurrentLead] = useState({});
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize conversation
  useEffect(() => {
    startNewChat();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startNewChat = async () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setLoading(true);
    try {
      const res = await api.resetChat();
      setLeadId(res.leadId);
      setMessages([{ role: 'alex_ai', content: res.reply }]);
      setCurrentLead({});
      if (voiceEnabled) speakText(res.reply);
    } catch (err) {
      console.error('Error starting chat session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    if (!customText) setInputMessage('');

    // Add user message to state
    const newMessages = [...messages, { role: 'customer', content: textToSend }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await api.sendMessage({
        leadId,
        message: textToSend,
        currentLead
      });

      // Add Alex's reply
      setMessages(prev => [
        ...prev,
        {
          role: 'alex_ai',
          content: res.reply,
          safety_alert: res.safety_alert,
          should_escalate: res.should_escalate,
          priority: res.priority
        }
      ]);

      // Update live extracted lead preview
      if (res.lead) {
        setCurrentLead(res.lead);
      }

      if (voiceEnabled) {
        speakText(res.reply);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'alex_ai',
          content: 'I apologize, I encountered a temporary connection issue. Please try sending your message again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioClick = (scenario) => {
    handleSendMessage(scenario.message);
  };

  return (
    <div className="content-page">
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Alex AI Receptionist Live Simulator</h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Simulate live customer inquiries or telephone calls to test AI qualification, safety guardrails, and lead extraction.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              if (!next && 'speechSynthesis' in window) window.speechSynthesis.cancel();
            }}
          >
            {voiceEnabled ? <Volume2 size={16} color="var(--brand-cyan)" /> : <VolumeX size={16} />}
            <span>Voice Audio: {voiceEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={startNewChat}
            disabled={loading}
          >
            <RotateCcw size={14} />
            <span>Reset Call Session</span>
          </button>
        </div>
      </div>

      {/* Quick Test Scenarios Bar */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 18px',
          marginBottom: '20px'
        }}
      >
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ⚡ One-Click Test Scenarios:
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {QUICK_SCENARIOS.map((scen) => (
            <button
              key={scen.id}
              type="button"
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              onClick={() => handleScenarioClick(scen)}
              disabled={loading}
            >
              <span>{scen.label}</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: scen.tag === 'Safety Protocol' ? 'var(--hot-bg)' : scen.tag === 'HOT Lead' ? 'var(--hot-bg)' : 'rgba(255,255,255,0.08)',
                  color: scen.tag === 'Safety Protocol' ? '#ef4444' : scen.tag === 'HOT Lead' ? '#ef4444' : 'var(--text-dim)'
                }}
              >
                {scen.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulator Layout: Chat on Left, Real-Time Lead Extraction on Right */}
      <div className="simulator-layout">
        {/* Left: Chat Panel */}
        <div className="chat-panel">
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="chat-avatar alex">
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                  Alex (Apex Comfort HVAC Receptionist)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#10b981' }}>
                  <span className="status-dot-pulse" style={{ width: '6px', height: '6px' }} />
                  <span>Online & Ready</span>
                </div>
              </div>
            </div>

            {/* Speaking waveform indicator */}
            {isSpeaking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(14, 165, 233, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--brand-cyan)' }}>Speaking</span>
                <div className="waveform-container">
                  <span className="waveform-bar" />
                  <span className="waveform-bar" />
                  <span className="waveform-bar" />
                  <span className="waveform-bar" />
                  <span className="waveform-bar" />
                </div>
              </div>
            )}
          </div>

          {/* Message Stream */}
          <div className="chat-messages">
            {messages.map((msg, index) => {
              const isCustomer = msg.role === 'customer';
              return (
                <div
                  key={index}
                  className={`chat-message ${isCustomer ? 'customer' : 'alex'}`}
                >
                  <div className={`chat-avatar ${isCustomer ? 'customer' : 'alex'}`}>
                    {isCustomer ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  <div>
                    <div className="chat-bubble">
                      {msg.content}
                    </div>

                    {msg.safety_alert && (
                      <div
                        style={{
                          marginTop: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid #ef4444',
                          color: '#fca5a5',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem'
                        }}
                      >
                        <ShieldAlert size={14} color="#ef4444" />
                        <span>Safety Emergency Protocol Activated</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="chat-message alex">
                <div className="chat-avatar alex">
                  <Bot size={16} />
                </div>
                <div className="chat-bubble" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Alex is listening and thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="chat-input-area"
          >
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message as an HVAC customer..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !inputMessage.trim()}
              style={{ padding: '0 20px' }}
            >
              <Send size={16} />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right: Live Lead Extraction Card */}
        <div className="lead-preview-card">
          <div className="lead-preview-title">
            <span>Live Extracted Lead</span>
            {currentLead.lead_priority && (
              <span className={`badge-priority ${currentLead.lead_priority?.toLowerCase()}`}>
                {currentLead.lead_priority === 'HOT' && <Flame size={12} />}
                {currentLead.lead_priority === 'WARM' && <Sun size={12} />}
                {currentLead.lead_priority === 'COLD' && <Snowflake size={12} />}
                {currentLead.lead_priority}
              </span>
            )}
          </div>

          {currentLead.safety_alert && (
            <div
              style={{
                background: '#b91c1c',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldAlert size={16} />
              <span>CRITICAL SAFETY TRIGGERED</span>
            </div>
          )}

          <div className="lead-preview-field">
            <span className="field-label">Customer Name</span>
            <div className={`field-value ${!currentLead.customer_name ? 'empty' : ''}`}>
              {currentLead.customer_name || 'Listening for name...'}
            </div>
          </div>

          <div className="lead-preview-field">
            <span className="field-label">Phone Number</span>
            <div className={`field-value ${!currentLead.phone_number ? 'empty' : ''}`} style={{ color: currentLead.phone_number ? 'var(--brand-cyan)' : undefined }}>
              {currentLead.phone_number || 'Listening for phone number...'}
            </div>
          </div>

          <div className="lead-preview-field">
            <span className="field-label">Service Address</span>
            <div className={`field-value ${!currentLead.service_address ? 'empty' : ''}`}>
              {currentLead.service_address || 'Listening for street address...'}
            </div>
          </div>

          <div className="lead-preview-field">
            <span className="field-label">HVAC Service Type</span>
            <div className={`field-value ${!currentLead.hvac_service_type ? 'empty' : ''}`}>
              {currentLead.hvac_service_type || 'Detecting issue category...'}
            </div>
          </div>

          <div className="lead-preview-field">
            <span className="field-label">Preferred Time Window</span>
            <div className={`field-value ${!currentLead.preferred_service_time ? 'empty' : ''}`}>
              {currentLead.preferred_service_time || 'Awaiting customer time preference...'}
            </div>
          </div>

          <div className="lead-preview-field">
            <span className="field-label">Problem Summary</span>
            <div className={`field-value ${!currentLead.problem_description ? 'empty' : ''}`} style={{ maxHeight: '70px', overflowY: 'auto' }}>
              {currentLead.problem_description || 'Awaiting customer description...'}
            </div>
          </div>

          {currentLead.ai_classification_rationale && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px'
              }}
            >
              <span className="field-label">Classification Rationale</span>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {currentLead.ai_classification_rationale}
              </div>
            </div>
          )}

          {currentLead.id && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onNavigateToDashboard}
              style={{ width: '100%', marginTop: 'auto' }}
            >
              <span>View Lead in Admin Dashboard</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
