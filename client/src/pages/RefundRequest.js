// pages/RefundRequestForm.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RefundRequestForm = () => {
  const { orderId } = useParams();
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    try {
      const res = await axios.post('http://localhost:3001/api/refund-requests', {
        orderId,
        userId,
        reason
      });
      setMessage('Refund request submitted successfully!');
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err) {
      setMessage('Refund request failed: ' + err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="container" style={{ padding: "50px" }}>
      <h2>Refund Request for Order #{orderId}</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for refund..."
          required
          rows="5"
          style={{ width: "100%", marginBottom: "20px" }}
        />
        <button type="submit" style={{ padding: "10px 20px", backgroundColor: "var(--primary-color)", color: "white", border: "none" }}>
          Submit Request
        </button>
      </form>
      {message && <p style={{ marginTop: "20px", color: "green" }}>{message}</p>}
    </div>
  );
};

export default RefundRequestForm;
