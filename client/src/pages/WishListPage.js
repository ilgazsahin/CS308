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
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "30px" 
          }}>
            {wishlist.map(item => (
              <div key={item._id} style={{ 
                backgroundColor: "white", 
                padding: "20px", 
                borderRadius: "8px", 
                textAlign: "center" 
              }}>
                <div style={{ 
                  height: "250px", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  marginBottom: "15px" 
                }}>
                  <img 
                    src={item.bookId.image} 
                    alt={item.bookId.title} 
                    style={{ 
                      maxHeight: "100%", 
                      maxWidth: "100%", 
                      objectFit: "contain", 
                      borderRadius: "4px" 
                    }} 
                  />
                </div>
          
                <h3 style={{ 
                  margin: "10px 0", 
                  color: "var(--primary-color)" 
                }}>
                  {item.bookId.title}
                </h3>
          
                <p style={{ 
                  color: "var(--accent-color)", 
                  fontWeight: "500" 
                }}>
                  ${item.bookId.price.toFixed(2)}
                </p>
          
                <Link to={`/book/${item.bookId._id}`}>
                  <button style={{ 
                    marginTop: "10px", 
                    padding: "10px 20px", 
                    backgroundColor: "var(--primary-color)", 
                    color: "white", 
                    border: "none", 
                    cursor: "pointer" 
                  }}>
                    View Book
                  </button>
                </Link>
              </div>
            ))}
          </div>
          
        )}

      </div>
      <Footer />
    </div>
  );
};

export default WishlistPage;
