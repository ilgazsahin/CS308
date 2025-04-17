import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import NavigationBar from './HomePage/NavigationBar';
import Footer from '../components/Footer';

const InvoicePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Get order from localStorage
    const orderData = localStorage.getItem(`order_${orderId}`);
    if (orderData) {
      try {
        setOrder(JSON.parse(orderData));
      } catch (error) {
        console.error('Error parsing order data:', error);
      }
    }
    setLoading(false);
  }, [orderId, navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div>
        <NavigationBar />
        <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
          <p>Loading invoice...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <NavigationBar />
        <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2.5rem",
            fontWeight: "500",
            marginBottom: "30px",
            color: "var(--primary-color)"
          }}>Invoice Not Found</h1>
          <p style={{ marginBottom: "30px" }}>We couldn't find the invoice you're looking for.</p>
          <Link 
            to="/orders" 
            style={{
              display: "inline-block",
              padding: "12px 25px",
              backgroundColor: "var(--primary-color)",
              color: "white",
              textDecoration: "none",
              fontWeight: "500"
            }}
          >
            VIEW ORDER HISTORY
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <div className="no-print">
        <NavigationBar />
      </div>
      
      <div className="container" style={{ padding: "60px 0" }}>
        <div className="invoice-container" style={{
          backgroundColor: "white",
          padding: "40px",
          maxWidth: "800px",
          margin: "0 auto",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
        }}>
          {/* Invoice Header */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "40px"
          }}>
            <div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2.5rem",
                fontWeight: "500",
                marginBottom: "5px",
                color: "var(--primary-color)"
              }}>INVOICE</h1>
              <p style={{ color: "var(--light-text)" }}>#{order.orderId}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.8rem",
                fontWeight: "500",
                marginBottom: "10px",
                color: "var(--primary-color)"
              }}>STORE 26</h2>
              <p style={{ marginBottom: "5px" }}>123 Book Street</p>
              <p style={{ marginBottom: "5px" }}>New York, NY 10001</p>
              <p style={{ marginBottom: "5px" }}>store26@example.com</p>
              <p>+1 (212) 555-7890</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between",
            marginBottom: "40px"
          }}>
            <div>
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: "500",
                marginBottom: "15px",
                color: "var(--primary-color)"
              }}>Bill To</h3>
              <p style={{ marginBottom: "5px" }}>{order.shippingInfo.name}</p>
              <p style={{ marginBottom: "5px" }}>{order.shippingInfo.address}</p>
              <p style={{ marginBottom: "5px" }}>
                {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zip}
              </p>
              <p style={{ marginBottom: "5px" }}>{order.shippingInfo.country}</p>
              <p style={{ marginBottom: "5px" }}>{order.shippingInfo.email}</p>
              <p>{order.shippingInfo.phone}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: "500",
                marginBottom: "15px",
                color: "var(--primary-color)"
              }}>Invoice Details</h3>
              <table style={{ marginLeft: "auto" }}>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left", paddingRight: "20px", paddingBottom: "5px" }}>
                      <strong>Invoice Date:</strong>
                    </td>
                    <td style={{ textAlign: "right", paddingBottom: "5px" }}>
                      {formatDate(order.orderDate)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left", paddingRight: "20px", paddingBottom: "5px" }}>
                      <strong>Order #:</strong>
                    </td>
                    <td style={{ textAlign: "right", paddingBottom: "5px" }}>
                      {order.orderId}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left", paddingRight: "20px", paddingBottom: "5px" }}>
                      <strong>Payment Status:</strong>
                    </td>
                    <td style={{ textAlign: "right", paddingBottom: "5px", color: "#4b6043" }}>
                      {order.status}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Items */}
          <div style={{ marginBottom: "40px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                  <th style={{ textAlign: "left", padding: "10px 5px" }}>Item</th>
                  <th style={{ textAlign: "center", padding: "10px 5px" }}>Quantity</th>
                  <th style={{ textAlign: "right", padding: "10px 5px" }}>Price</th>
                  <th style={{ textAlign: "right", padding: "10px 5px" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "15px 5px" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          style={{ 
                            width: "50px", 
                            height: "70px", 
                            objectFit: "cover",
                            marginRight: "15px"
                          }} 
                        />
                        <div>
                          <p style={{ fontWeight: "500", marginBottom: "5px" }}>{item.title}</p>
                          <p style={{ color: "var(--light-text)", fontSize: "0.9rem" }}>{item.author}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "center", padding: "15px 5px" }}>
                      {item.quantity}
                    </td>
                    <td style={{ textAlign: "right", padding: "15px 5px" }}>
                      ${parseFloat(item.price).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right", padding: "15px 5px", fontWeight: "500" }}>
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: "300px" }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                marginBottom: "10px"
              }}>
                <span>Subtotal</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                marginBottom: "10px"
              }}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                marginTop: "15px",
                paddingTop: "15px",
                borderTop: "2px solid var(--border-color)",
                fontWeight: "700",
                fontSize: "1.1rem"
              }}>
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Thank You Note */}
          <div style={{ marginTop: "60px", textAlign: "center" }}>
            <p style={{ marginBottom: "10px", fontStyle: "italic" }}>
              Thank you for shopping with STORE 26!
            </p>
            <p style={{ fontSize: "0.9rem", color: "var(--light-text)" }}>
              If you have any questions about this invoice, please contact us at store26@example.com
            </p>
          </div>
        </div>

        {/* Print Button - Only visible on screen, not when printing */}
        <div className="no-print" style={{ textAlign: "center", marginTop: "30px" }}>
          <button 
            onClick={handlePrint}
            style={{
              padding: "12px 25px",
              backgroundColor: "var(--primary-color)",
              color: "white",
              border: "none",
              fontWeight: "500",
              cursor: "pointer",
              marginRight: "15px"
            }}
          >
            PRINT INVOICE
          </button>
          <Link 
            to="/orders"
            style={{
              display: "inline-block",
              padding: "12px 25px",
              border: "1px solid var(--border-color)",
              color: "var(--primary-color)",
              textDecoration: "none",
              fontWeight: "500"
            }}
          >
            BACK TO ORDERS
          </Link>
        </div>
      </div>

      {/* Add print styles */}
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .container {
              padding: 0 !important;
            }
            .invoice-container {
              box-shadow: none !important;
              max-width: 100% !important;
            }
          }
        `}
      </style>
      
      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
};

export default InvoicePage; 