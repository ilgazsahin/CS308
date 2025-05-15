import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STATUS_OPTIONS = ["processing", "in-transit", "delivered"];

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "product manager") {
      navigate("/unauthorized"); 
      return;
    }

    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:3001/api/orders");
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error("Error retrieving orders:", err);
      setError("Failed to retrieve orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(o => (o.orderId === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await axios.patch(
        `http://localhost:3001/api/orders/${orderId}/status`,
        { status: newStatus }
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update order status. Reverting …");
      fetchOrders();
    }
  };

  const formatDate = dateString =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>Loading orders …</div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: "red", textAlign: "center" }}>
        {error}
        <button
          style={{ marginLeft: 16 }}
          onClick={() => {
            setError(null);
            fetchOrders();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>Manage Orders</h2>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={th}>Order ID</th>
              <th style={th}>Date</th>
              <th style={th}>User</th>
              <th style={th}>Items</th>
              <th style={th}>Total</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.orderId} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={td}>{order.orderId}</td>
                <td style={td}>{formatDate(order.orderDate)}</td>
                <td style={td}>{order.userId}</td>
                <td style={td}>{order.items?.length || 0} items</td>
                <td style={td}>${order.total}</td>
                <td style={td}>
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order.orderId, e.target.value)}
                    style={selectStyle}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const th = {
  padding: 12,
  textAlign: "left",
  borderBottom: "2px solid #ddd"
};

const td = {
  padding: 12
};

const selectStyle = {
  padding: "6px 8px",
  borderRadius: 4,
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer"
};

export default ManageOrders;
