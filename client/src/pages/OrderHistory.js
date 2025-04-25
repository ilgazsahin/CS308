import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavigationBar from './HomePage/NavigationBar';
import Footer from '../components/Footer';
import axios from 'axios';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching orders for userId:', userId); // Debug log
        
        const response = await axios.get(`http://localhost:3001/api/orders/user/${userId}`);
        console.log('Orders response:', response.data); // Debug log
        
        if (response.data && Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
          setError('Received invalid data format from server');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.message || 'Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        ) : error ? (
          <div style={{ 
            backgroundColor: "#fff3f3", 
            padding: "20px", 
            borderRadius: "4px",
            marginBottom: "20px",
            color: "#d32f2f"
          }}>
            <p>Error: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#d32f2f",
                color: "white",
                cursor: "pointer"
              }}
            >
              Try Again
            </button>
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
                key={order.orderId || order._id} 
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
                      Order #{order.orderId || order._id}
                    </h2>
                    <p style={{ color: "var(--light-text)", fontSize: "0.9rem" }}>
                      Placed on {formatDate(order.orderDate || order.createdAt)}
                    </p>
                  </div>
                  <div style={{ 
                    backgroundColor: order.status.toLowerCase() === "delivered" ? "#f0f7ed" : "#f8f8f8",
                    color: order.status.toLowerCase() === "delivered" ? "#4b6043" : "var(--light-text)",
                    padding: "8px 15px",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    height: "fit-content"
                  }}>
                    {order.status}
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ marginBottom: "30px" }}>
                  {(order.items || []).map((item, index) => (
                    <div 
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "15px 0",
                        borderBottom: index < order.items.length - 1 ? "1px solid var(--border-color)" : "none"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <img 
                          src={item.image} 
                          alt={item.title}
                          style={{
                            width: "60px",
                            height: "80px",
                            objectFit: "cover",
                            marginRight: "20px"
                          }}
                        />
                        <div>
                          <h3 style={{ 
                            fontSize: "1.1rem", 
                            marginBottom: "5px",
                            color: "var(--primary-color)"
                          }}>
                            {item.title}
                          </h3>
                          <p style={{ 
                            color: "var(--light-text)",
                            fontSize: "0.9rem"
                          }}>
                            Quantity: {item.quantity}
                          </p>
                          <p style={{ 
                            color: "var(--primary-color)",
                            fontWeight: "500"
                          }}>
                            ${item.price}
                          </p>
                        </div>
                      </div>
                      
                      {/* Only show Leave Review button if order status is "delivered" */}
                      {order.status.toLowerCase() === "delivered" && (
                        <Link
                          to={`/book/${item._id}?orderId=${order.orderId || order._id}`}
                          style={{
                            padding: "8px 15px",
                            backgroundColor: "var(--primary-color)",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "4px",
                            fontSize: "0.9rem",
                            marginLeft: "15px"
                          }}
                        >
                          Leave Review
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Order Summary and Invoice Button */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "20px",
                  borderTop: "1px solid var(--border-color)"
                }}>
                  <div>
                    <p style={{
                      fontSize: "1.1rem",
                      fontWeight: "500",
                      color: "var(--primary-color)"
                    }}>
                      Total: ${order.total}
                    </p>
                  </div>
                  
                  <Link 
                    to={`/invoice/${order.orderId || order._id}`}
                    style={{
                      padding: "10px 20px",
                      border: "1px solid var(--border-color)",
                      color: "var(--primary-color)",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: "500"
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
