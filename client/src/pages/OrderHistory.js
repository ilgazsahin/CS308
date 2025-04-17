// OrderHistoryPage.js
import React from 'react';
import NavigationBar from './HomePage/NavigationBar';
import Footer from '../components/Footer';

const OrderHistoryPage = () => {
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
