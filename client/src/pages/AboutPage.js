import React from 'react';
import NavigationBar from './HomePage/NavigationBar';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <div style={{ backgroundColor: "var(--light-bg)", minHeight: "100vh" }}>
      <NavigationBar />
      
      <div className="container" style={{padding: "80px 0"}}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "3rem",
          fontWeight: "500",
          marginBottom: "40px",
          color: "var(--primary-color)",
          textAlign: "center"
        }}>About Our Store</h1>
        
        <div style={{
          backgroundColor: "white",
          padding: "40px",
          lineHeight: "1.7",
          fontSize: "1.1rem",
          color: "var(--text-color)"
        }}>
          <p>About our store</p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutPage; 