import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import NavigationBar from './HomePage/NavigationBar';
import Footer from '../components/Footer';

const CartPage = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
  const [checkoutError, setCheckoutError] = useState('');
  const navigate = useNavigate();
  
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('token') ? true : false;
  
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, parseInt(newQuantity));
    }
  };
  
  const handleCheckout = () => {
    if (!isLoggedIn) {
      setCheckoutError('Please login or register to complete your purchase.');
      return;
    }
    
    // Proceed to checkout if logged in
    navigate('/checkout');
  };
  
  return (
    <div style={{ backgroundColor: "var(--light-bg)", minHeight: "100vh" }}>
      {/* Hide number input arrows */}
      <style>
        {`
          input[type=number]::-webkit-inner-spin-button, 
          input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
          }
          input[type=number] {
            -moz-appearance: textfield;
          }
        `}
      </style>
      
      <NavigationBar />
      
      <div className="container" style={{ padding: "60px 0" }}>
        {/* Breadcrumb */}
        <div style={{
          marginBottom: "20px", 
          textAlign: "center",
          fontFamily: "'Inter', sans-serif"
        }}>
          <Link to="/" style={{
            textDecoration: "none", 
            color: "var(--light-text)",
            fontSize: "0.9rem"
          }}>Home</Link>
          <span style={{ margin: "0 10px", color: "var(--light-text)" }}>›</span>
          <span style={{
            color: "var(--primary-color)",
            fontSize: "0.9rem"
          }}>Shopping Cart</span>
        </div>
        
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "2.8rem",
          fontWeight: "500",
          marginBottom: "50px",
          color: "var(--primary-color)",
          textAlign: "center"
        }}>Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div style={{
            backgroundColor: "white",
            padding: "40px",
            textAlign: "center",
            marginBottom: "50px"
          }}>
            <p style={{ marginBottom: "20px" }}>Your cart is empty.</p>
            <Link 
              to="/products" 
              style={{
                display: "inline-block",
                padding: "12px 25px",
                border: "1px solid var(--border-color)",
                color: "var(--primary-color)",
                textDecoration: "none",
                fontWeight: "500",
                transition: "all 0.3s ease"
              }}
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        ) : (
          <>
            {/* Cart items table */}
            <div style={{ 
              backgroundColor: "white", 
              padding: "30px",
              marginBottom: "30px"
            }}>
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse"
              }}>
                <thead>
                  <tr style={{ 
                    borderBottom: "1px solid var(--border-color)",
                    textAlign: "left"
                  }}>
                    <th style={{ padding: "10px 15px" }}>Product</th>
                    <th style={{ padding: "10px 15px" }}>Price</th>
                    <th style={{ padding: "10px 15px" }}>Quantity</th>
                    <th style={{ padding: "10px 15px" }}>Total</th>
                    <th style={{ padding: "10px 15px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item._id} style={{ 
                      borderBottom: "1px solid var(--border-color)" 
                    }}>
                      <td style={{ 
                        padding: "20px 15px",
                        display: "flex",
                        alignItems: "center",
                        gap: "15px"
                      }}>
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          style={{ 
                            width: "60px", 
                            height: "80px", 
                            objectFit: "cover"
                          }} 
                        />
                        <div>
                          <h3 style={{ 
                            fontSize: "1rem",
                            fontWeight: "500",
                            marginBottom: "5px",
                            fontFamily: "'Playfair Display', serif"
                          }}>{item.title}</h3>
                          <p style={{ 
                            fontSize: "0.85rem",
                            color: "var(--light-text)"
                          }}>{item.author}</p>
                        </div>
                      </td>
                      <td style={{ padding: "20px 15px" }}>
                        ${parseFloat(item.price).toFixed(2)}
                      </td>
                      <td style={{ padding: "20px 15px" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <button 
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            style={{
                              width: "30px",
                              height: "30px",
                              border: "1px solid var(--border-color)",
                              background: "transparent",
                              cursor: "pointer"
                            }}
                          >-</button>
                          <input 
                            type="number" 
                            min="1" 
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                            style={{
                              width: "40px",
                              height: "30px",
                              border: "1px solid var(--border-color)",
                              borderLeft: "none",
                              borderRight: "none",
                              textAlign: "center",
                              appearance: "textfield",
                              MozAppearance: "textfield",
                              WebkitAppearance: "textfield"
                            }}
                          />
                          <button 
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            style={{
                              width: "30px",
                              height: "30px",
                              border: "1px solid var(--border-color)",
                              background: "transparent",
                              cursor: "pointer"
                            }}
                          >+</button>
                        </div>
                      </td>
                      <td style={{ padding: "20px 15px", fontWeight: "500" }}>
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </td>
                      <td style={{ padding: "20px 15px" }}>
                        <button 
                          onClick={() => removeFromCart(item._id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--light-text)",
                            cursor: "pointer",
                            fontSize: "1.2rem"
                          }}
                        >×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Order summary */}
            <div style={{ 
              display: "flex", 
              justifyContent: "flex-end",
              marginBottom: "50px"
            }}>
              <div style={{ 
                width: "350px",
                backgroundColor: "white",
                padding: "30px"
              }}>
                <h2 style={{ 
                  fontSize: "1.3rem",
                  fontWeight: "500",
                  marginBottom: "20px",
                  fontFamily: "'Playfair Display', serif"
                }}>Order Summary</h2>
                
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  marginBottom: "15px",
                  fontSize: "0.95rem"
                }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: "500" }}>${cartTotal.toFixed(2)}</span>
                </div>
                
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  marginBottom: "15px",
                  fontSize: "0.95rem",
                  color: "var(--light-text)"
                }}>
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid var(--border-color)",
                  fontSize: "1.1rem",
                  fontWeight: "500"
                }}>
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                
                {checkoutError && (
                  <div style={{ 
                    color: "#721c24", 
                    backgroundColor: "#f8d7da", 
                    padding: "12px 15px", 
                    borderRadius: "4px", 
                    marginTop: "20px",
                    marginBottom: "20px",
                    fontSize: "0.9rem",
                    textAlign: "center"
                  }}>
                    {checkoutError}
                    <div style={{ marginTop: "10px" }}>
                      <Link 
                        to="/login" 
                        style={{ 
                          color: "#721c24", 
                          fontWeight: "500",
                          textDecoration: "underline"
                        }}
                      >
                        Login
                      </Link>
                      {" or "}
                      <Link 
                        to="/register" 
                        style={{ 
                          color: "#721c24", 
                          fontWeight: "500",
                          textDecoration: "underline"
                        }}
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={handleCheckout}
                  style={{ 
                    width: "100%", 
                    padding: "15px", 
                    backgroundColor: "var(--primary-color)", 
                    color: "white", 
                    border: "none",
                    marginTop: "20px",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontSize: "0.95rem"
                  }}
                >
                  {isLoggedIn ? 'PROCEED TO CHECKOUT' : 'LOGIN & CHECKOUT'}
                </button>
                
                <Link 
                  to="/products" 
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: "15px",
                    color: "var(--light-text)",
                    textDecoration: "none",
                    fontSize: "0.9rem"
                  }}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default CartPage; 