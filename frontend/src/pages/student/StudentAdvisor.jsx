import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';

const QUICK_PROMPTS = [
  'How is my attendance standing?',
  'Which course should I focus on to improve?',
  'Why was this risk level predicted?',
  'What are my highest priority actions?',
];

export default function StudentAdvisor() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Chat / Q&A state
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadAdvisorData();
  }, []);

  useEffect(() => {
    if (chatEndRef.current && typeof chatEndRef.current.scrollIntoView === 'function') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation, asking]);

  const loadAdvisorData = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await api.getAdvisorOverview();
      setOverview(res);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load academic advisor guidance.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setFeedback(null);
      const res = await api.refreshAdvisor();
      setOverview(res);
      setFeedback({ type: 'success', message: 'Advisor guidance refreshed with latest grades and attendance.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to refresh guidance.' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleAskQuestion = async (qText) => {
    const textToSend = (qText || question).trim();
    if (!textToSend) return;

    // Add user message to conversation
    const userMsg = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversation((prev) => [...prev, userMsg]);
    setQuestion('');
    setAsking(true);

    try {
      const res = await api.askAdvisor(textToSend);
      const advisorMsg = {
        sender: 'advisor',
        text: res.answer,
        intent: res.intent,
        source: res.source,
        suggestedQuestions: res.suggestedQuestions || [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setConversation((prev) => [...prev, advisorMsg]);
    } catch (err) {
      const errorMsg = {
        sender: 'advisor',
        text: 'Sorry, I encountered an issue retrieving that academic metric: ' + (err.message || 'Server error'),
        isError: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setConversation((prev) => [...prev, errorMsg]);
    } finally {
      setAsking(false);
    }
  };

  const getPriorityBadgeClass = (priority) => {
    if (priority === 'HIGH') return 'badge-priority-high';
    if (priority === 'MEDIUM') return 'badge-priority-medium';
    return 'badge-priority-low';
  };

  const getRiskBadgeClass = (category) => {
    if (category === 'High Risk') return 'badge-risk-high';
    if (category === 'Medium Risk') return 'badge-risk-medium';
    return 'badge-risk-low';
  };

  return (
    <div className="student-page">
      {/* Sci-Fi Central Hero Header - matching Center-Bottom of Reference Image */}
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '2rem 1.5rem 1.75rem',
          marginBottom: '1.5rem',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 242, 254, 0.15) 0%, rgba(10, 18, 36, 0.85) 75%)',
          border: '1px solid rgba(0, 242, 254, 0.28)',
          boxShadow: '0 8px 32px rgba(0, 242, 254, 0.12)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 0 10px rgba(0,242,254,0.6))' }}>🤖</span>
          <h1
            className="student-page-title"
            style={{
              margin: 0,
              fontSize: '1.9rem',
              color: '#f8fafc',
              textShadow: '0 0 18px rgba(0,242,254,0.7)',
              letterSpacing: '0.04em',
            }}
          >
            UniCore AI Academic Advisor
          </h1>
        </div>
        <p style={{ margin: '0 0 1.25rem', fontSize: '1.05rem', color: '#94a3b8', fontWeight: 500 }}>
          How can I help you today?
        </p>


        {/* Big Search Bar with [Send] button matching image */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion();
          }}
          style={{
            maxWidth: '650px',
            margin: '0 auto 1.25rem',
            display: 'flex',
            gap: '0.5rem',
            background: 'rgba(5, 11, 24, 0.85)',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            borderRadius: '10px',
            padding: '0.35rem 0.45rem',
            boxShadow: '0 0 16px rgba(0,242,254,0.1)',
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="[ Ask your question... ]"
            value={question}
            onChange={(e) => setQuestion(e.target.value.slice(0, 255))}
            disabled={asking}
            maxLength={255}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '0.92rem',
              padding: '0.5rem 0.85rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={asking || !question.trim()}
            style={{
              padding: '0.45rem 1.4rem',
              fontSize: '0.88rem',
              borderRadius: '8px',
              letterSpacing: '0.05em',
            }}
          >
            {asking ? '...' : '[ Send ]'}
          </button>
        </form>

        {/* Quick Suggested Prompt Chips */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="prompt-chip"
              onClick={() => handleAskQuestion(prompt)}
              disabled={asking}
              style={{ fontSize: '0.78rem' }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible`} role="alert">
          <span>{feedback.message}</span>
          <button type="button" className="alert-close-btn" onClick={() => setFeedback(null)}>
            &times;
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analyzing course evaluations and attendance records...</p>
        </div>
      ) : (
        <>
          {/* Your Academic Summary Card - matching image chamfered boxes */}
          {overview && (
            <div
              className="card"
              style={{
                marginBottom: '1.5rem',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(10, 18, 36, 0.65)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f1f5f9' }}>Your Academic Summary</h3>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleRefresh}
                  disabled={loading || refreshing}
                  style={{ fontSize: '0.76rem', padding: '0.3rem 0.75rem' }}
                >
                  {refreshing ? 'Evaluating...' : '🔄 Refresh Guidance'}
                </button>
              </div>

              {/* 2 Chamfered metric boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="hud-hex-card hud-hex-cyan" style={{ padding: '1rem' }}>
                  <div className="hud-hex-label">Attendance</div>
                  <div className="hud-hex-value" style={{ color: (overview.overallAttendancePercent ?? 0) >= 75 ? 'var(--cyber-cyan)' : 'var(--cyber-crimson)' }}>
                    {(overview.overallAttendancePercent ?? 0).toFixed(0)}%
                  </div>
                  <div className="hud-hex-subtext" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {(overview.overallAttendancePercent ?? 0) >= 75 ? 'Optimal Standing' : 'Below 75% Cutoff'}
                  </div>
                </div>

                <div
                  className={`hud-hex-card ${
                    overview.riskCategory === 'High Risk'
                      ? 'hud-hex-crimson'
                      : overview.riskCategory === 'Medium Risk'
                      ? 'hud-hex-amber'
                      : 'hud-hex-emerald'
                  }`}
                  style={{ padding: '1rem' }}
                >
                  <div className="hud-hex-label">Current Risk</div>
                  <div className="hud-hex-value" style={{ fontSize: '1.35rem' }}>
                    {overview.riskCategory || 'Medium Risk'}
                  </div>
                  <div className="hud-hex-subtext">
                    Confidence: {Math.round((overview.riskConfidence || 0.85) * 100)}%
                  </div>
                </div>
              </div>

              {/* Suggested Focus list */}
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Suggested Focus Areas:
                </span>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  <li>Attendance buffer: Maintain classes above 75% threshold.</li>
                  <li>Targeted focus on upcoming midterms and laboratory quizzes.</li>
                  <li>Consistent assignment submissions for grade stability.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Conversation History / Q&A Thread if user interacted */}
          {conversation.length > 0 && (
            <div className="card advisor-chat-container" style={{ marginBottom: '1.5rem' }}>
              <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>💬</span>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>Active Discussion Thread</h3>
                </div>
                <span className="code-badge" style={{ fontSize: '0.72rem' }}>
                  Grounded Telemetry
                </span>
              </div>

              <div className="conversation-thread" style={{ maxHeight: '350px' }}>
                {conversation.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.sender === 'user' ? 'msg-user' : 'msg-advisor'}`}>
                    <div className="msg-avatar">
                      {msg.sender === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className="msg-bubble">
                      <div className="msg-text">{msg.text}</div>
                      {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                        <div className="msg-followups">
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Follow up:</span>
                          {msg.suggestedQuestions.map((sq, sqIdx) => (
                            <button
                              key={sqIdx}
                              type="button"
                              className="prompt-chip prompt-chip-sm"
                              onClick={() => handleAskQuestion(sq)}
                              disabled={asking}
                            >
                              {sq}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="msg-time">{msg.time}</div>
                    </div>
                  </div>
                ))}

                {asking && (
                  <div className="chat-message msg-advisor">
                    <div className="msg-avatar">🤖</div>
                    <div className="msg-bubble thinking-bubble">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}

          {/* Detailed Recommendations List */}
          {overview?.recommendations && overview.recommendations.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h2 className="section-subheading" style={{ fontSize: '1.1rem', margin: 0 }}>
                  📋 Personalized Guidance Items
                </h2>
                {overview.summaryHeadline && (
                  <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                    {overview.summaryHeadline}
                  </span>
                )}
              </div>

              <div className="advisor-recs-grid">
                {overview.recommendations.map((rec, idx) => (
                  <div
                    key={rec.id || `${rec.priority}-${rec.title}-${idx}`}
                    className={`card advisor-rec-card rec-${(rec.priority || 'low').toLowerCase()}`}
                  >
                    <div className="rec-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className={`badge ${getPriorityBadgeClass(rec.priority)}`}>
                          {rec.priority} PRIORITY
                        </span>
                        {rec.category && (
                          <span className="badge badge-secondary">{rec.category}</span>
                        )}
                      </div>
                      {(rec.metricTag || rec.supportingMetric) && (
                        <span className="rec-metric-tag">{rec.metricTag || rec.supportingMetric}</span>
                      )}
                    </div>

                    <h3 className="rec-title">{rec.title}</h3>
                    <p className="rec-explanation">{rec.advice || rec.explanation}</p>

                    {(rec.actionItem || rec.suggestedAction) && (
                      <div className="rec-action-callout">
                        <span className="rec-action-icon">🎯</span>
                        <div>
                          <strong>Recommended Action:</strong> {rec.actionItem || rec.suggestedAction}
                        </div>
                      </div>
                    )}

                    {rec.rationale && (
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                        <em>Data Rationale: {rec.rationale}</em>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

