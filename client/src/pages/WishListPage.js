import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavigationBar from './HomePage/NavigationBar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/wishlist/${userId}`);
        setWishlist(res.data);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    if (userId) fetchWishlist();
  }, [userId]);

  return (
    <div style={{ backgroundColor: "var(--light-bg)", minHeight: "100vh" }}>
      <NavigationBar />
      <div className="container" style={{ padding: "60px 0" }}>
        <h1 style={{ 
          textAlign: "center", 
          fontFamily: "'Playfair Display', serif", 
          marginBottom: "40px" 
        }}>
          My Wishlist
        </h1>
        {wishlist.length === 0 ? (
        <p style={{ textAlign: "center" }}>Your wishlist is empty.</p>
        ) : (
            
        )}

      </div>
      <Footer />
    </div>
  );
};

export default WishlistPage;
