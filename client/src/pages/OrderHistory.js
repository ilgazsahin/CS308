// OrderHistoryPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavigationBar from './HomePage/NavigationBar';
import Footer from '../components/Footer';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;

      try {
        const res = await axios.get(`http://localhost:3001/api/orders/user/${userId}`);
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, [userId]);

  return (
    <div>
      <NavigationBar />
      <div className="container" style={{ padding: "60px 0" }}>
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Your Purchased Books</h1>
        {orders.length === 0 ? (
          <p style={{ textAlign: "center" }}>You have no orders yet.</p>
        ) : (
          orders.map(order => (
            <div key={order._id} style={{
              marginBottom: "25px",
              borderBottom: "1px solid #ccc",
              paddingBottom: "15px"
            }}>
              <ul style={{ paddingLeft: "20px" }}>
                {order.items.map((item, index) => (
                  <li key={index}>
                    <strong>{item.title}</strong> — ${parseFloat(item.price).toFixed(2)}
                  </li>
                ))}
              </ul>
              <ul style={{ paddingLeft: "20px" }}>
                {order.items.map((item, index) => (
                 
                    <p><strong>Number of Books: </strong>{item.quantity}</p>
                ))}
              </ul>

              <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
              <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
              <p><strong>Status:</strong> {order.status}</p>
            </div>
          ))
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrderHistoryPage;
