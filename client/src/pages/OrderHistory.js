import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavigationBar from './HomePage/NavigationBar';
import Footer from '../components/Footer';
import axios from 'axios';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
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

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      
      const response = await axios.post(`http://localhost:3001/api/orders/${orderId}/cancel`, {
        userId: userId
      });
      
      console.log('Cancel response:', response.data);
      
      // Update order in state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'cancelled' } : order
      ));
      
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      let errorMessage = 'Failed to cancel order.';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle opening refund request modal
  const handleOpenRefundModal = (orderId) => {
    setSelectedOrderId(orderId);
    setRefundReason('');
    setShowRefundModal(true);
  };

  // Handle submitting refund request
  const handleRequestRefund = async () => {
    if (!refundReason.trim()) {
      alert('Please provide a reason for the refund request');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId || !selectedOrderId) {
      setShowRefundModal(false);
      return;
    }

    try {
      setActionLoading(true);
      
      console.log('Submitting refund request for order:', selectedOrderId);
      console.log('User ID:', userId);
      console.log('Reason:', refundReason);
      
      const response = await axios.post(`http://localhost:3001/api/orders/${selectedOrderId}/refund-request`, {
        userId: userId,
        reason: refundReason
      });
      
      console.log('Refund request response:', response.data);
      
      // Update order in state
      setOrders(orders.map(order => 
        order._id === selectedOrderId ? { ...order, status: 'refund-requested' } : order
      ));
      
      setShowRefundModal(false);
      alert('Refund request submitted successfully');
    } catch (error) {
      console.error('Error requesting refund:', error);
      
      let errorMessage = 'Failed to submit refund request.';
      
      if (error.response && error.response.data) {
        console.error('Server error response:', error.response.data);
        
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        if (error.response.data.currentStatus) {
          errorMessage += ` Current order status: ${error.response.data.currentStatus}`;
        }
        
        if (error.response.data.daysSincePurchase) {
          errorMessage += ` Days since purchase: ${error.response.data.daysSincePurchase}`;
        }
      }
      
      alert(errorMessage);
      setShowRefundModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to check if order is within 30 days for refund eligibility
  const isWithin30Days = (dateString) => {
    const orderDate = new Date(dateString);
    const today = new Date();
    const differenceInTime = today.getTime() - orderDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return differenceInDays <= 30;
  };

  // Helper function to get appropriate status style
  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return {
          backgroundColor: "#f8f8f8",
          color: "var(--light-text)"
        };
      case 'in-transit':
        return {
          backgroundColor: "#e3f2fd",
          color: "#0d47a1"
        };
      case 'delivered':
        return {
          backgroundColor: "#f0f7ed",
          color: "#4b6043"
        };
      case 'cancelled':
        return {
          backgroundColor: "#ffebee",
          color: "#c62828"
        };
      case 'refund-requested':
        return {
          backgroundColor: "#fff8e1",
          color: "#ff8f00"
        };
      case 'refunded':
        return {
          backgroundColor: "#e8f5e9",
          color: "#2e7d32"
        };
      default:
        return {
          backgroundColor: "#f8f8f8",
          color: "var(--light-text)"
        };
    }
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
                    ...getStatusStyle(order.status),
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
                      
                      {/* Only show action buttons if appropriate */}
                      <div>
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
                              marginLeft: "15px",
                              display: "inline-block",
                              marginBottom: "8px"
                            }}
                          >
                            Leave Review
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary, Invoice Button, and Action Buttons */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "20px",
                  borderTop: "1px solid var(--border-color)",
                  flexWrap: "wrap"
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
                  
                  <div style={{ 
                    display: "flex", 
                    gap: "10px",
                    marginTop: "10px",
                    flexWrap: "wrap"
                  }}>
                    {/* Cancel button - only for processing orders */}
                    {order.status.toLowerCase() === "processing" && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={actionLoading}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: actionLoading ? "not-allowed" : "pointer",
                          opacity: actionLoading ? 0.7 : 1,
                          fontSize: "0.9rem",
                          fontWeight: "500"
                        }}
                      >
                        Cancel Order
                      </button>
                    )}
                    
                    {/* Refund Request button - only for delivered orders within 30 days */}
                    {order.status.toLowerCase() === "delivered" && 
                     isWithin30Days(order.orderDate || order.createdAt) && (
                      <button
                        onClick={() => handleOpenRefundModal(order._id)}
                        disabled={actionLoading}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#ff9800",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: actionLoading ? "not-allowed" : "pointer",
                          opacity: actionLoading ? 0.7 : 1,
                          fontSize: "0.9rem",
                          fontWeight: "500"
                        }}
                      >
                        Request Refund
                      </button>
                    )}
                    
                    <Link 
                      to={`/invoice/${order.orderId || order._id}`}
                      style={{
                        padding: "10px 20px",
                        border: "1px solid var(--border-color)",
                        color: "var(--primary-color)",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        borderRadius: "4px",
                        display: "inline-block",
                        textAlign: "center"
                      }}
                    >
                      VIEW INVOICE
                    </Link>
                  </div>
                </div>
                
                {/* Display refund information if applicable */}
                {(order.status.toLowerCase() === "refund-requested" || 
                  order.status.toLowerCase() === "refunded") && 
                  order.refundRequest && (
                  <div style={{
                    marginTop: "20px",
                    padding: "15px",
                    backgroundColor: order.status.toLowerCase() === "refunded" ? "#e8f5e9" : "#fff8e1",
                    borderRadius: "4px",
                    fontSize: "0.9rem"
                  }}>
                    <p style={{ fontWeight: "500", marginBottom: "5px" }}>
                      {order.status.toLowerCase() === "refunded" 
                        ? "Refund Approved" 
                        : "Refund Requested"
                      }
                    </p>
                    
                    {order.refundRequest.reason && (
                      <p style={{ marginBottom: "5px" }}>
                        <strong>Reason:</strong> {order.refundRequest.reason}
                      </p>
                    )}
                    
                    {order.status.toLowerCase() === "refunded" && (
                      <>
                        <p style={{ marginBottom: "5px" }}>
                          <strong>Refund Amount:</strong> ${order.refundRequest.refundAmount?.toFixed(2) || order.total.toFixed(2)}
                        </p>
                        
                        <p style={{ marginBottom: "5px" }}>
                          <strong>Processed:</strong> {new Date(order.refundRequest.processedAt).toLocaleDateString()}
                        </p>
                        
                        {order.refundRequest.notes && (
                          <p style={{ marginBottom: "0" }}>
                            <strong>Notes:</strong> {order.refundRequest.notes}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Refund Request Modal */}
      {showRefundModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            width: "90%",
            maxWidth: "500px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Request a Refund</h3>
            
            <p style={{ marginBottom: "20px", color: "#757575", fontSize: "0.9rem" }}>
              Please provide a reason for your refund request. This will help us process your request more efficiently.
            </p>
            
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Why are you requesting a refund?"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                minHeight: "120px",
                marginBottom: "20px",
                fontSize: "0.9rem",
                resize: "vertical"
              }}
            />
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setShowRefundModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f5f5f5",
                  color: "#757575",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleRequestRefund}
                disabled={actionLoading || !refundReason.trim()}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: (actionLoading || !refundReason.trim()) ? "not-allowed" : "pointer",
                  opacity: (actionLoading || !refundReason.trim()) ? 0.7 : 1
                }}
              >
                {actionLoading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default OrderHistory;
