import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavigationBar from './HomePage/NavigationBar';
import Footer from '../components/Footer';
import axios from 'axios';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      navigate('/login');
      return;
    }

    // Fetch orders from MongoDB
    const fetchOrdersFromMongoDB = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:3001/api/orders/user/${userId}`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders from MongoDB:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrdersFromMongoDB();
  }, [navigate]);

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        }}>Order History</h1>
        
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            backgroundColor: "white",
            padding: "40px",
            textAlign: "center",
            marginBottom: "50px"
          }}>
            <p style={{ marginBottom: "20px" }}>You don't have any orders yet.</p>
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
          <div>
            {orders.map((order) => (
              <div 
                key={order.orderId} 
                style={{
                  backgroundColor: "white",
                  padding: "30px",
                  marginBottom: "30px",
                  borderRadius: "4px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
                }}
              >
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "15px",
                  marginBottom: "20px"
                }}>
                  <div>
                    <h2 style={{ 
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.5rem",
                      marginBottom: "5px",
                      fontWeight: "500"
                    }}>
                      Order #{order.orderId}
                    </h2>
                    <p style={{ color: "var(--light-text)", fontSize: "0.9rem" }}>
                      Placed on {formatDate(order.orderDate)}
                    </p>
                  </div>
                  <div style={{ 
                    backgroundColor: order.status === 'Paid' ? "#f0f7ed" : "#f8f8f8",
                    color: order.status === 'Paid' ? "#4b6043" : "var(--light-text)",
                    padding: "8px 15px",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    height: "fit-content"
                  }}>
                    {order.status}
                  </div>
                </div>
                
                {/* Order items */}
                <div style={{ marginBottom: "25px" }}>
                  <h3 style={{ 
                    fontSize: "1.1rem", 
                    fontWeight: "500",
                    marginBottom: "15px",
                    color: "var(--primary-color)"
                  }}>
                    Items
                  </h3>
                  
                  {order.items.map((item) => (
                    <div 
                      key={item._id} 
                      style={{ 
                        display: "flex", 
                        alignItems: "center",
                        padding: "15px 0",
                        borderBottom: "1px solid var(--border-color)"
                      }}
                    >
                      <div style={{ width: "60px", marginRight: "15px" }}>
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          style={{ 
                            width: "100%",
                            height: "80px",
                            objectFit: "cover"
                          }} 
                        />
                      </div>
                      <div style={{ flex: "1" }}>
                        <h4 style={{ 
                          fontSize: "1rem",
                          fontWeight: "500",
                          marginBottom: "5px"
                        }}>
                          {item.title}
                        </h4>
                        <p style={{ 
                          color: "var(--light-text)",
                          fontSize: "0.9rem",
                          marginBottom: "5px"
                        }}>
                          {item.author}
                        </p>
                        <p style={{ 
                          color: "var(--light-text)",
                          fontSize: "0.9rem"
                        }}>
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div style={{ 
                        fontWeight: "500",
                        fontSize: "1rem",
                        marginLeft: "15px"
                      }}>
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order summary */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "25px"
                }}>
                  <div style={{ flex: "1" }}>
                    <h3 style={{ 
                      fontSize: "1.1rem", 
                      fontWeight: "500",
                      marginBottom: "15px",
                      color: "var(--primary-color)"
                    }}>
                      Shipping Address
                    </h3>
                    <p style={{ marginBottom: "5px" }}>{order.shippingInfo.name}</p>
                    <p style={{ marginBottom: "5px" }}>{order.shippingInfo.address}</p>
                    <p style={{ marginBottom: "5px" }}>{order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zip}</p>
                    <p style={{ marginBottom: "5px" }}>{order.shippingInfo.country}</p>
                    <p>{order.shippingInfo.phone}</p>
                  </div>
                  
                  <div style={{ width: "300px", paddingLeft: "20px" }}>
                    <h3 style={{ 
                      fontSize: "1.1rem", 
                      fontWeight: "500",
                      marginBottom: "15px",
                      color: "var(--primary-color)"
                    }}>
                      Order Summary
                    </h3>
                    
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      marginBottom: "10px"
                    }}>
                      <span style={{ color: "var(--light-text)" }}>Subtotal</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                    
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      marginBottom: "10px"
                    }}>
                      <span style={{ color: "var(--light-text)" }}>Shipping</span>
                      <span>Free</span>
                    </div>
                    
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      marginTop: "15px",
                      paddingTop: "15px",
                      borderTop: "1px solid var(--border-color)",
                      fontWeight: "500"
                    }}>
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Order actions */}
                <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                  <Link 
                    to={`/invoice/${order.orderId}`}
                    style={{
                      padding: "10px 20px",
                      border: "1px solid var(--border-color)",
                      color: "var(--primary-color)",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: "500"
                    }}
                    onClick={async (e) => {
                      // Try to ensure an invoice exists for this order before navigating
                      try {
                        // We'll generate the invoice in the background if it doesn't exist
                        await axios.post(`http://localhost:3001/api/invoices/generate`, {
                          orderData: order
                        });
                      } catch (error) {
                        console.error('Error pre-generating invoice:', error);
                        // Continue navigation even if this fails - the InvoicePage will handle it
                      }
                    }}
                  >
                    VIEW INVOICE
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderHistory;
