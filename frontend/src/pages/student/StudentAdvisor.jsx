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
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">🤖 AI Academic Advisor</h1>
          <p className="student-page-subtitle">
            Personalized, explainable academic pacing and intelligent early-warning recommendations.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleRefresh}
          disabled={loading || refreshing}
        >
          {refreshing ? 'Evaluating Pacing...' : '🔄 Refresh Recommendations'}
        </button>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible`} role="alert">
          <span>{feedback.message}</span>
          <button type="button" className="alert-close-btn" onClick={() => setFeedback(null)}>
            &times;
          </button>
        </div>
      )}

      {/* Academic Disclaimer Notice */}
      <div className="card advisor-disclaimer-card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.4rem' }}>💡</span>
          <div>
            <strong>Academic Guidance Notice:</strong>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>
              Recommendations are academic-support suggestions synthesized from your actual UniCore attendance, assessment marks, and ML early-warning signals. They are intended for formative guidance, not final academic evaluations.
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analyzing course evaluations and attendance records...</p>
        </div>
      ) : (
        <>
          {/* Academic Overview Bar */}
          {overview && (
            <div className="metric-cards-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="card metric-card">
                <span className="metric-label">Overall Attendance</span>
                <strong
                  className="metric-value"
                  style={{
                    color:
                      (overview.overallAttendancePercent ?? 0) >= 75
                        ? 'var(--color-success)'
                        : 'var(--color-danger)',
                  }}
                >
                  {(overview.overallAttendancePercent ?? 0).toFixed(1)}%
                </strong>
                <span className="metric-subtext">
                  {(overview.overallAttendancePercent ?? 0) >= 75
                    ? 'Eligible for Examinations'
                    : 'Below 75% Cutoff'}
                </span>
              </div>

              <div className="card metric-card">
                <span className="metric-label">Assessment Average</span>
                <strong className="metric-value">
                  {overview.averageMarksPercent != null ? `${overview.averageMarksPercent}%` : 'N/A'}
                </strong>
                <span className="metric-subtext">Across graded evaluations</span>
              </div>

              <div className="card metric-card">
                <span className="metric-label">ML Risk Standing</span>
                <div style={{ marginTop: '0.2rem' }}>
                  <span className={`badge ${getRiskBadgeClass(overview.riskCategory)}`}>
                    {overview.riskCategory}
                  </span>
                </div>
                <span className="metric-subtext" style={{ marginTop: '0.3rem' }}>
                  Confidence: {Math.round(overview.riskConfidence * 100)}%
                </span>
              </div>

              <div className="card metric-card">
                <span className="metric-label">Active Courses</span>
                <strong className="metric-value">{overview.courseCount}</strong>
                <span className="metric-subtext">Current semester registrations</span>
              </div>
            </div>
          )}

          {/* Headline Summary */}
          {overview?.summaryHeadline && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <h2 className="section-subheading" style={{ fontSize: '1.15rem' }}>
                📋 Personalized Action Plan
              </h2>
              <span className="badge badge-secondary" style={{ fontSize: '0.8rem' }}>
                {overview.summaryHeadline}
              </span>
            </div>
          )}

          {/* Recommendations List */}
          {(!overview?.recommendations || overview.recommendations.length === 0) ? (
            <div className="card empty-state-card" style={{ marginBottom: '2rem' }}>
              <div className="empty-icon">✅</div>
              <h3>All Academic Indicators on Track</h3>
              <p>No high or medium priority actions required. Continue your consistent performance!</p>
            </div>
          ) : (
            <div className="advisor-recs-grid" style={{ marginBottom: '2rem' }}>
              {overview.recommendations.map((rec, idx) => (
                <div key={rec.id || `${rec.priority}-${rec.title}-${idx}`} className={`card advisor-rec-card rec-${(rec.priority || 'low').toLowerCase()}`}>
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
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                      <em>Data Rationale: {rec.rationale}</em>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Interactive AI Academic Assistant (Q&A) */}
          <div className="card advisor-chat-container">
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.4rem' }}>💬</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Ask Your Academic Advisor</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Instant explainable responses grounded in your UniCore academic data
                  </span>
                </div>
              </div>
              <span className="code-badge" style={{ fontSize: '0.72rem' }}>
                Grounded Rule Engine
              </span>
            </div>

            {/* Quick Prompt Chips */}
            <div className="quick-prompts-bar">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
                Suggested questions:
              </span>
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="prompt-chip"
                  onClick={() => handleAskQuestion(prompt)}
                  disabled={asking}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Conversation History */}
            <div className="conversation-thread">
              {conversation.length === 0 ? (
                <div className="chat-welcome-placeholder">
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Ask a question about your attendance, course weaknesses, or ML risk standing!
                  </p>
                </div>
              ) : (
                conversation.map((msg, idx) => (
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
                ))
              )}

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

            {/* Input Row */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion();
              }}
              className="chat-input-form"
            >
              <input
                type="text"
                className="form-input chat-input-field"
                placeholder="Ask about your attendance, courses, risk status..."
                value={question}
                onChange={(e) => setQuestion(e.target.value.slice(0, 255))}
                disabled={asking}
                maxLength={255}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={asking || !question.trim()}
                style={{ flexShrink: 0 }}
              >
                {asking ? 'Analyzing...' : 'Ask Advisor 🚀'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
