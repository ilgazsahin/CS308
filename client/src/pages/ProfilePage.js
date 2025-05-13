import React, { useEffect, useState } from 'react';
import NavigationBar from './HomePage/NavigationBar';
import Footer from '../components/Footer';

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    address: '',
}

 useEffect(() => {
    const name = localStorage.getItem('userName') || '';
    const email = localStorage.getItem('userEmail') || '';

    setUserData({ name, email });
  }, []);

  return (
    <div style={{ backgroundColor: "var(--light-bg)", minHeight: "100vh" }}>
      <NavigationBar />

      <div className="container" style={{ padding: "60px 0" }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "2rem",
          marginBottom: "30px",
          color: "var(--primary-color)",
          textAlign: "center"
        }}>
          My Profile
        </h1>
      </div>
      <div style={{
          backgroundColor: "white",
          padding: "30px",
          maxWidth: "600px",
          margin: "0 auto",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
        }}>
          <p><strong>Name:</strong> {userData.name || "Not Available"}</p>
          <p><strong>Email:</strong> {userData.email || "Not Available"}</p>
          <p><strong>Delivery Address:</strong> {userData.address || "Not Provided"}</p>
        </div>
  
      <Footer />
    </div>
  );
};

export default ProfilePage;