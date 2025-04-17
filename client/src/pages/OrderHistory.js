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
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
          Your Purchased Books
        </h1>
        <p style={{ textAlign: "center" }}>You have no orders yet.</p>
      </div>
      <Footer />
    </div>
  );
};

export default OrderHistoryPage;
