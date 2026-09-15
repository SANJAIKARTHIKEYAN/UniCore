import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function StudentDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudentDocuments();
      setDocuments(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading documents...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading documents:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadDocuments} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="status-badge status-good">Available</span>;
      case 'PENDING':
        return <span className="status-badge status-warning">Processing</span>;
      case 'EXPIRED':
        return <span className="status-badge status-danger">Expired</span>;
      default:
        return <span className="status-badge status-secondary">{status}</span>;
    }
  };

  const getDocIcon = (type) => {
    switch (type) {
      case 'Identity Card':
        return '🪪';
      case 'Hall Ticket':
        return '🎫';
      case 'Bonafide Certificate':
        return '📜';
      default:
        return '📄';
    }
  };

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Digital Documents & Certificates</h1>
          <p className="student-page-subtitle">Official university issued digital credentials, ID cards, and hall tickets.</p>
        </div>
        <span className="badge badge-STUDENT">{documents.length} Records</span>
      </div>

      <div className="documents-grid">
        {documents.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--text-secondary)' }}>No documents issued for this student account yet.</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="card document-card">
              <div className="document-card-header">
                <div className="doc-icon-box">{getDocIcon(doc.documentType)}</div>
                <div className="doc-meta-info">
                  <span className="doc-type-label">{doc.documentType}</span>
                  <h3 className="doc-title">{doc.title}</h3>
                </div>
                <div>{getStatusBadge(doc.status)}</div>
              </div>

              <p className="doc-description">{doc.description || 'No description provided.'}</p>

              <div className="doc-footer-meta">
                <span>Issued Date: <strong>{doc.issuedDate || 'Pending'}</strong></span>
                {doc.semester && <span>Semester: <strong>Sem {doc.semester}</strong></span>}
              </div>

              <div className="doc-actions-row">
                {doc.status === 'AVAILABLE' ? (
                  <button className="btn btn-secondary btn-sm" onClick={() => alert(`Document metadata: ${doc.title} is verified and available in university archive.`)}>
                    View Document Record
                  </button>
                ) : (
                  <span className="doc-pending-note">Available once cleared by Academic Office</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card info-box">
        <h4>Document Repository & Verification</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          UniCore maintains tamper-evident digital metadata records for institutional credentials. Actual binary PDF download and cryptographic verification endpoints will be enabled in subsequent releases.
        </p>
      </div>
    </div>
  );
}
