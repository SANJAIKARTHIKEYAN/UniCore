import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudentFees();
      setFees(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load fee records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading fee records...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading fees:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadFees} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const totalAmount = fees.reduce((acc, f) => acc + (f.amount || 0), 0);
  const totalPaid = fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
  const totalBalance = totalAmount - totalPaid;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="status-badge status-good">Paid</span>;
      case 'PARTIALLY_PAID':
        return <span className="status-badge status-warning">Partially Paid</span>;
      case 'OVERDUE':
        return <span className="status-badge status-danger">Overdue</span>;
      default:
        return <span className="status-badge status-danger">Unpaid</span>;
    }
  };

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Fee Records & Accounts</h1>
          <p className="student-page-subtitle">Semester tuition fees, laboratory charges, and institutional dues.</p>
        </div>
        <div className={`status-badge-pill ${totalBalance === 0 ? 'status-good' : 'status-warning'}`}>
          {totalBalance === 0 ? '✓ All Dues Cleared' : `Balance Due: ₹${totalBalance.toLocaleString()}`}
        </div>
      </div>

      {/* Overview Metric Banner */}
      <div className="card attendance-summary-banner">
        <div className="attendance-metric-item">
          <span className="metric-number">₹{totalAmount.toLocaleString()}</span>
          <span className="metric-title">Total Invoiced</span>
        </div>
        <div className="attendance-metric-item">
          <span className="metric-number text-success">₹{totalPaid.toLocaleString()}</span>
          <span className="metric-title">Total Paid</span>
        </div>
        <div className="attendance-metric-item">
          <span className="metric-number text-danger">₹{totalBalance.toLocaleString()}</span>
          <span className="metric-title">Outstanding Balance</span>
        </div>
        <div className="attendance-metric-item">
          <span className="metric-number">{fees.length}</span>
          <span className="metric-title">Line Items</span>
        </div>
      </div>

      {/* Fees Table */}
      <div className="card table-card">
        <div className="table-header-title">
          <h3>Semester Fee Breakdown</h3>
        </div>
        <div className="table-responsive">
          <table className="unicore-table">
            <thead>
              <tr>
                <th>Fee Description</th>
                <th>Semester</th>
                <th>Academic Year</th>
                <th>Invoiced Amount</th>
                <th>Paid Amount</th>
                <th>Balance Due</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No fee records found for current student account.
                  </td>
                </tr>
              ) : (
                fees.map((item) => {
                  const itemBalance = (item.amount || 0) - (item.paidAmount || 0);
                  return (
                    <tr key={item.id}>
                      <td><strong>{item.feeType}</strong></td>
                      <td>Semester {item.semester}</td>
                      <td>{item.academicYear}</td>
                      <td>₹{item.amount?.toLocaleString()}</td>
                      <td>₹{item.paidAmount?.toLocaleString()}</td>
                      <td style={{ color: itemBalance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        ₹{itemBalance.toLocaleString()}
                      </td>
                      <td>{item.dueDate || '—'}</td>
                      <td>{getStatusBadge(item.status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card info-box">
        <h4>Payment Instructions & Information</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          Fee receipts and transactions are audited by the University Bursar and Finance Office. Online fee payment gateway integration will be available in future releases; offline payments may be verified at the accounts counter.
        </p>
      </div>
    </div>
  );
}
