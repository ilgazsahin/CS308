import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import NavigationBar from './HomePage/NavigationBar';
import Footer from '../components/Footer';
import axios from 'axios';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    name: '', email: '', address: '', city: '', state: '', zip: '', country: '', phone: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '', cardHolder: '', expiryDate: '', cvv: ''
  });

  const [processingOrder, setProcessingOrder] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/cart');
  }, [navigate]);

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentInfoChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    const { name, email, address, city, state, zip, country, phone } = shippingInfo;
    const { cardNumber, cardHolder, expiryDate, cvv } = paymentInfo;

    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!address) newErrors.address = 'Address is required';
    if (!city) newErrors.city = 'City is required';
    if (!state) newErrors.state = 'State is required';
    if (!zip) newErrors.zip = 'ZIP code is required';
    if (!country) newErrors.country = 'Country is required';
    if (!phone) newErrors.phone = 'Phone is required';

    if (!cardNumber) newErrors.cardNumber = 'Card number is required';
    else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) newErrors.cardNumber = 'Invalid card number';

    if (!cardHolder) newErrors.cardHolder = 'Cardholder name is required';
    if (!expiryDate) newErrors.expiryDate = 'Expiry date is required';
    else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) newErrors.expiryDate = 'Invalid format (MM/YY)';

    if (!cvv) newErrors.cvv = 'CVV is required';
    else if (!/^\d{3,4}$/.test(cvv)) newErrors.cvv = 'Invalid CVV';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setProcessingOrder(true);
    setTimeout(async () => {
      const orderId = Math.floor(100000 + Math.random() * 900000);
      const orderDate = new Date().toISOString();
      const userId = localStorage.getItem('userId'); // ✅ User ID alınıyor

      const orderData = {
        orderNumber: orderId,
        orderDate,
        items: cartItems,
        shippingInfo,
        total: cartTotal,
        status: 'Paid',
        userId // ✅ Backend'e gönderilecek
      };

      try {
        await axios.post('http://localhost:3001/api/orders', orderData);
        localStorage.setItem(`order_${orderId}`, JSON.stringify(orderData));
        clearCart();
        navigate(`/invoice/${orderId}`);
      } catch (error) {
        console.error('Failed to send order to server:', error);
        alert('Something went wrong while placing your order.');
      } finally {
        setProcessingOrder(false);
      }
    }, 2000);
  };
  
  
  return (
    <div style={{ backgroundColor: "var(--light-bg)", minHeight: "100vh" }}>
      <NavigationBar />
      
      <div className="container" style={{ padding: "60px 0" }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "2.8rem",
          fontWeight: "500",
          marginBottom: "50px",
          color: "var(--primary-color)",
          textAlign: "center"
        }}>Checkout</h1>
        
        {processingOrder ? (
          <div style={{
            backgroundColor: "white",
            padding: "40px",
            textAlign: "center",
            marginBottom: "50px"
          }}>
            <p style={{ marginBottom: "20px" }}>Processing your order...</p>
            <div style={{
              display: "inline-block",
              width: "50px",
              height: "50px",
              border: "5px solid #f3f3f3",
              borderTop: "5px solid var(--primary-color)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
            {/* Left side: Shipping and Payment Forms */}
            <div style={{ flex: "1", minWidth: "300px" }}>
              <form onSubmit={handlePlaceOrder}>
                {/* Shipping Information */}
                <div style={{ 
                  backgroundColor: "white", 
                  padding: "30px",
                  marginBottom: "30px"
                }}>
                  <h2 style={{ 
                    fontSize: "1.3rem",
                    fontWeight: "500",
                    marginBottom: "20px",
                    fontFamily: "'Playfair Display', serif"
                  }}>Shipping Information</h2>
                  
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontSize: "0.9rem", 
                      color: "var(--primary-color)",
                      fontWeight: "500"
                    }}>Full Name</label>
                    <input 
                      type="text"
                      name="name"
                      value={shippingInfo.name}
                      onChange={handleShippingInfoChange}
                      style={{ 
                        width: "100%", 
                        padding: "12px 15px", 
                        border: errors.name ? "1px solid #dc3545" : "1px solid var(--border-color)", 
                        fontSize: "1rem",
                        backgroundColor: "#f9f9f9"
                      }} 
                    />
                    {errors.name && <div style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "5px" }}>{errors.name}</div>}
                  </div>
                  
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontSize: "0.9rem", 
                      color: "var(--primary-color)",
                      fontWeight: "500"
                    }}>Email</label>
                    <input 
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleShippingInfoChange}
                      style={{ 
                        width: "100%", 
                        padding: "12px 15px", 
                        border: errors.email ? "1px solid #dc3545" : "1px solid var(--border-color)", 
                        fontSize: "1rem",
                        backgroundColor: "#f9f9f9"
                      }} 
                    />
                    {errors.email && <div style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "5px" }}>{errors.email}</div>}
                  </div>
                  
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontSize: "0.9rem", 
                      color: "var(--primary-color)",
                      fontWeight: "500"
                    }}>Address</label>
                    <input 
                      type="text"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingInfoChange}
                      style={{ 
                        width: "100%", 
                        padding: "12px 15px", 
                        border: errors.address ? "1px solid #dc3545" : "1px solid var(--border-color)", 
                        fontSize: "1rem",
                        backgroundColor: "#f9f9f9"
                      }} 
                    />
                    {errors.address && <div style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "5px" }}>{errors.address}</div>}
                  </div>
                  
                  <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
                    <div style={{ flex: "1" }}>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontSize: "0.9rem", 
                        color: "var(--primary-color)",
                        fontWeight: "500"
                      }}>City</label>
                      <input 
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingInfoChange}
                        style={{ 
                          width: "100%", 
                          padding: "12px 15px", 
                          border: errors.city ? "1px solid #dc3545" : "1px solid var(--border-color)", 
                          fontSize: "1rem",
                          backgroundColor: "#f9f9f9"
                        }} 
                      />
                      {errors.city && <div style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "5px" }}>{errors.city}</div>}
                    </div>
                    
                    <div style={{ flex: "1" }}>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontSize: "0.9rem", 
                        color: "var(--primary-color)",
                        fontWeight: "500"
                      }}>State</label>
                      <input 
                        type="text"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleShippingInfoChange}
                        style={{ 
                          width: "100%", 
                          padding: "12px 15px", 
                          border: errors.state ? "1px solid #dc3545" : "1px solid var(--border-color)", 
                          fontSize: "1rem",
                          backgroundColor: "#f9f9f9"
                        }} 
                      />
                      {errors.state && <div style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "5px" }}>{errors.state}</div>}
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
                    <div style={{ flex: "1" }}>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontSize: "0.9rem", 
                        color: "var(--primary-color)",
                        fontWeight: "500"
                      }}>ZIP Code</label>
                      <input 
                        type="text"
                        name="zip"
                        value={shippingInfo.zip}
                        onChange={handleShippingInfoChange}
                        style={{ 
                          width: "100%", 
                          padding: "12px 15px", 
                          border: errors.zip ? "1px solid #dc3545" : "1px solid var(--border-color)", 
                          fontSize: "1rem",
                          backgroundColor: "#f9f9f9"
                        }} 
                      />
                      {errors.zip && <div style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "5px" }}>{errors.zip}</div>}
                    </div>
                    
                    <div style={{ flex: "1" }}>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontSize: "0.9rem", 
                        color: "var(--primary-color)",
                        fontWeight: "500"
                      }}>Country</label>
                      <input 
                        type="text"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleShippingInfoChange}
                        style={{ 
                          width: "100%", 
                          padding: "12px 15px", 
                          border: errors.country ? "1px solid #dc3545" : "1px solid var(--border-color)", 
                          fontSize: "1rem",
                          backgroundColor: "#f9f9f9"
                        }} 
                      />
                      {errors.country && <div style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "5px" }}>{errors.country}</div>}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontSize: "0.9rem", 
                      color: "var(--primary-color)",
                      fontWeight: "500"
                    }}>Phone</label>
                    <input 
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleShippingInfoChange}
                      style={{ 
                        width: "100%", 
                        padding: "12px 15px", 
                        border: errors.phone ? "1px solid #dc3545" : "1px solid var(--border-color)", 
                        fontSize: "1rem",
                        backgroundColor: "#f9f9f9"
                      }} 
                    />
                    {errors.phone && <div style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "5px" }}>{errors.phone}</div>}
                  </div>
                </div>
                
                {/* Payment Information */}
                <div style={{ 
                  backgroundColor: "white", 
                  padding: "30px",
                  marginBottom: "30px"
                }}>
                  <h2 style={{ 
                    fontSize: "1.3rem",
                    fontWeight: "500",
                    marginBottom: "20px",
                    fontFamily: "'Playfair Display', serif"
                  }}>Payment Information</h2>
                  
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontSize: "0.9rem", 
                      color: "var(--primary-color)",
                      fontWeight: "500"
                    }}>Card Number</label>
                    <input 
                      type="text"
                      name="cardNumber"
                      value={paymentInfo.cardNumber}
                      onChange={handlePaymentInfoChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      style={{ 
                        width: "100%", 
                        padding: "12px 15px", 
                        border: errors.cardNumber ? "1px solid #dc3545" : "1px solid var(--border-color)", 
                        fontSize: "1rem",
                        backgroundColor: "#f9f9f9"
                      }} 
                    />
                    {errors.cardNumber && <div style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "5px" }}>{errors.cardNumber}</div>}
                  </div>
                  
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontSize: "0.9rem", 
                      color: "var(--primary-color)",
                      fontWeight: "500"
                    }}>Cardholder Name</label>
                    <input 
                      type="text"
                      name="cardHolder"
                      value={paymentInfo.cardHolder}
                      onChange={handlePaymentInfoChange}
                      style={{ 
                        width: "100%", 
                        padding: "12px 15px", 
                        border: errors.cardHolder ? "1px solid #dc3545" : "1px solid var(--border-color)", 
                        fontSize: "1rem",
                        backgroundColor: "#f9f9f9"
                      }} 
                    />
                    {errors.cardHolder && <div style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "5px" }}>{errors.cardHolder}</div>}
                  </div>
                  
                  <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
                    <div style={{ flex: "1" }}>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontSize: "0.9rem", 
                        color: "var(--primary-color)",
                        fontWeight: "500"
                      }}>Expiry Date</label>
                      <input 
                        type="text"
                        name="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={handlePaymentInfoChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        style={{ 
                          width: "100%", 
                          padding: "12px 15px", 
                          border: errors.expiryDate ? "1px solid #dc3545" : "1px solid var(--border-color)", 
                          fontSize: "1rem",
                          backgroundColor: "#f9f9f9"
                        }} 
                      />
                      {errors.expiryDate && <div style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "5px" }}>{errors.expiryDate}</div>}
                    </div>
                    
                    <div style={{ flex: "1" }}>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontSize: "0.9rem", 
                        color: "var(--primary-color)",
                        fontWeight: "500"
                      }}>CVV</label>
                      <input 
                        type="text"
                        name="cvv"
                        value={paymentInfo.cvv}
                        onChange={handlePaymentInfoChange}
                        maxLength="4"
                        style={{ 
                          width: "100%", 
                          padding: "12px 15px", 
                          border: errors.cvv ? "1px solid #dc3545" : "1px solid var(--border-color)", 
                          fontSize: "1rem",
                          backgroundColor: "#f9f9f9"
                        }} 
                      />
                      {errors.cvv && <div style={{ color: "#dc3545", fontSize: "0.8rem", marginTop: "5px" }}>{errors.cvv}</div>}
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  style={{ 
                    width: "100%", 
                    padding: "15px", 
                    backgroundColor: "var(--primary-color)", 
                    color: "white", 
                    border: "none",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    marginBottom: "50px"
                  }}
                >
                  PLACE ORDER
                </button>
              </form>
            </div>
            
            {/* Right side: Order Summary */}
            <div style={{ width: "350px" }}>
              <div style={{ 
                backgroundColor: "white", 
                padding: "30px",
                position: "sticky",
                top: "20px"
              }}>
                <h2 style={{ 
                  fontSize: "1.3rem",
                  fontWeight: "500",
                  marginBottom: "20px",
                  fontFamily: "'Playfair Display', serif"
                }}>Order Summary</h2>
                
                {/* Order items */}
                <div style={{ marginBottom: "20px" }}>
                  {cartItems.map(item => (
                    <div key={item._id} style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      marginBottom: "15px",
                      fontSize: "0.9rem"
                    }}>
                      <div style={{ flex: "2" }}>
                        <span style={{ fontWeight: "500" }}>{item.title}</span>
                        <span style={{ color: "var(--light-text)", display: "block" }}>Qty: {item.quantity}</span>
                      </div>
                      <div style={{ flex: "1", textAlign: "right" }}>
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{ 
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "20px",
                  marginBottom: "20px"
                }}>
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
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage; 