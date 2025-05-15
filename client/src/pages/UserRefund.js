// pages/MyRefunds.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    axios.get(`http://localhost:3001/api/refund-requests/user/${userId}`)
      .then(res => setRefunds(res.data))
      .catch(err => setError('Failed to load refund requests.'));
  }, []);

  return (
    <div className="container" style={{ padding: "50px" }}>
      <h1>My Refund Requests</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {refunds.length === 0 ? (
        <p>You have no refund requests.</p>
      ) : (
        refunds.map((req) => (
          <div key={req._id} style={{ border: "1px solid #ccc", padding: "20px", marginBottom: "20px" }}>
            <p><strong>Order ID:</strong> {req.orderId}</p>
            <p><strong>Reason:</strong> {req.reason}</p>
            <p><strong>Status:</strong> 
              <span style={{ 
                fontWeight: 'bold', 
                color: req.status === 'approved' ? 'green' : req.status === 'rejected' ? 'red' : 'orange', 
                marginLeft: "8px"
              }}>
                {req.status.toUpperCase()}
              </span>
            </p>
            <p><small>Requested at: {new Date(req.createdAt).toLocaleString()}</small></p>
          </div>
        ))
      )}
    </div>
  );
};

export default MyRefunds;
