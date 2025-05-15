import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RefundDashboard = () => {
  const [requests, setRequests] = useState([]);
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role === "sales manager") {
      axios.get('http://localhost:3001/api/refund-requests')
        .then(res => setRequests(res.data))
        .catch(err => console.error(err));
    }
  }, [role]);

  const updateStatus = (id, status) => {
    axios.put(`http://localhost:3001/api/refund-requests/${id}`, { status })
      .then(res => {
        setRequests(prev => prev.map(r => r._id === id ? res.data : r));
      })
      .catch(err => console.error(err));
  };

  if (role !== "sales manager") {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>This page is only accessible to Sales Managers.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px" }}>
      <h1>Refund Request Dashboard</h1>
      {requests.map(req => (
        <div key={req._id} style={{ border: "1px solid #ccc", padding: "20px", marginBottom: "20px" }}>
          <p><strong>Order:</strong> {req.orderId}</p>
          <p><strong>User:</strong> {req.userId}</p>
          <p><strong>Reason:</strong> {req.reason}</p>
          <p><strong>Status:</strong> {req.status}</p>
          <select onChange={(e) => updateStatus(req._id, e.target.value)} value={req.status}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      ))}
    </div>
  );
};

export default RefundDashboard;
