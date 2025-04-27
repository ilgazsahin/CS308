import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import NavigationBar from './HomePage/NavigationBar';
import Footer from '../components/Footer';
import html2pdf from 'html2pdf.js';
import axios from 'axios';

const InvoicePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const invoiceRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      navigate('/login');
      return;
    }

    const fetchOrderAndInvoice = async () => {
      setLoading(true);
      try {
        // First, try to find an existing invoice for this order
        const response = await axios.get(`http://localhost:3001/api/orders/${orderId}`);
        const orderData = response.data;
        
        if (orderData) {
          setOrder(orderData);
          
          // Try to get or generate an invoice
          try {
            // Check if invoice exists
            const invoiceResponse = await axios.get(`http://localhost:3001/api/invoices/order/${orderId}`);
            
            if (invoiceResponse.data) {
              // Invoice exists
              setInvoice(invoiceResponse.data);
            } else {
              // Generate a new invoice
              const generatedInvoice = await axios.post(`http://localhost:3001/api/invoices/generate`, {
                orderData
              });
              
              setInvoice(generatedInvoice.data);
            }
            
            // Pre-fill email field with order email if available
            if (orderData.shippingInfo && orderData.shippingInfo.email) {
              setEmail(orderData.shippingInfo.email);
            }
          } catch (error) {
            console.error('Error fetching/generating invoice:', error);
            
            // Use order data directly if invoice API fails
            setInvoice(null);
          }
        } else {
          // As a fallback, try localStorage
          const localOrderData = localStorage.getItem(`order_${orderId}`);
          if (localOrderData) {
            try {
              const parsedOrder = JSON.parse(localOrderData);
              setOrder(parsedOrder);
              
              // Try to generate a new invoice from localStorage data
              try {
                const generatedInvoice = await axios.post(`http://localhost:3001/api/invoices/generate`, {
                  orderData: parsedOrder
                });
                
                setInvoice(generatedInvoice.data);
              } catch (invoiceError) {
                console.error('Error generating invoice from local data:', invoiceError);
                setInvoice(null);
              }
              
              // Pre-fill email field with order email if available
              if (parsedOrder.shippingInfo && parsedOrder.shippingInfo.email) {
                setEmail(parsedOrder.shippingInfo.email);
              }
            } catch (parseError) {
              console.error('Error parsing local order data:', parseError);
              setOrder(null);
              setInvoice(null);
            }
          } else {
            // No order found
            setOrder(null);
            setInvoice(null);
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        
        // As a fallback, try localStorage
        const localOrderData = localStorage.getItem(`order_${orderId}`);
        if (localOrderData) {
          try {
            const parsedOrder = JSON.parse(localOrderData);
            setOrder(parsedOrder);
            setInvoice(null);
            
            // Pre-fill email field with order email if available
            if (parsedOrder.shippingInfo && parsedOrder.shippingInfo.email) {
              setEmail(parsedOrder.shippingInfo.email);
            }
          } catch (parseError) {
            console.error('Error parsing local order data:', parseError);
            setOrder(null);
            setInvoice(null);
          }
        } else {
          setOrder(null);
          setInvoice(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndInvoice();
  }, [orderId, navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = async () => {
    if (!invoiceRef.current) return null;
    
    const options = {
      margin: 10,
      filename: `STORE26_Invoice_${orderId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    try {
      const pdfBlob = await html2pdf().from(invoiceRef.current).set(options).outputPdf('blob');
      return pdfBlob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  };

  const handleSendEmail = async () => {
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setEmailError('');
    setSendingEmail(true);
    
    try {
      // Generate the PDF
      const pdfBlob = await generatePDF();
      if (!pdfBlob) {
        throw new Error('Failed to generate PDF');
      }
      
      // Create form data to send to the server
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `STORE26_Invoice_${orderId}.pdf`);
      formData.append('email', email);
      formData.append('orderId', orderId);
      
      // Send the PDF to the server for email delivery
      await axios.post('http://localhost:3001/api/send-invoice-email', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000); // Reset after 5 seconds
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError('Failed to send email. Please try again later.');
    } finally {
      setSendingEmail(false);
    }
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

  // Use invoice data if available, otherwise fall back to order data
  const displayData = invoice || order;

  if (!displayData) {
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

  // Invoice date - prefer invoice date if available, otherwise use order date
  const invoiceDate = invoice ? invoice.invoiceDate : displayData.orderDate;
  
  // Items - prefer invoice items if available (they include subtotals), otherwise use order items
  const items = invoice ? invoice.items : displayData.items;
  
  // Determine the invoice number
  const invoiceNumber = invoice ? invoice.invoiceId : `INV-${displayData.orderId}`;

  return (
    <div>
      <div className="no-print">
        <NavigationBar />
      </div>
      
      <div className="container" style={{ padding: "60px 0" }}>
        <div 
          ref={invoiceRef}
          className="invoice-container" 
          style={{
            backgroundColor: "white",
            padding: "40px",
            maxWidth: "800px",
            margin: "0 auto",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
          }}
        >
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
              <p style={{ color: "var(--light-text)" }}>{invoiceNumber}</p>
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
              <p style={{ marginBottom: "5px" }}>Reading City, RC 12345</p>
              <p style={{ marginBottom: "5px" }}>contact@store26.com</p>
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
              <p style={{ marginBottom: "5px" }}>{displayData.shippingInfo.name}</p>
              <p style={{ marginBottom: "5px" }}>{displayData.shippingInfo.address}</p>
              <p style={{ marginBottom: "5px" }}>
                {displayData.shippingInfo.city}, {displayData.shippingInfo.state} {displayData.shippingInfo.zip}
              </p>
              <p style={{ marginBottom: "5px" }}>{displayData.shippingInfo.country}</p>
              <p style={{ marginBottom: "5px" }}>{displayData.shippingInfo.email}</p>
              <p>{displayData.shippingInfo.phone}</p>
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
                      {formatDate(invoiceDate)}
                    </td>
                  </tr>
                  {invoice && invoice.dueDate && (
                    <tr>
                      <td style={{ textAlign: "left", paddingRight: "20px", paddingBottom: "5px" }}>
                        <strong>Due Date:</strong>
                      </td>
                      <td style={{ textAlign: "right", paddingBottom: "5px" }}>
                        {formatDate(invoice.dueDate)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ textAlign: "left", paddingRight: "20px", paddingBottom: "5px" }}>
                      <strong>Order #:</strong>
                    </td>
                    <td style={{ textAlign: "right", paddingBottom: "5px" }}>
                      {displayData.orderId}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left", paddingRight: "20px", paddingBottom: "5px" }}>
                      <strong>Payment Status:</strong>
                    </td>
                    <td style={{ textAlign: "right", paddingBottom: "5px", color: "#4b6043" }}>
                      {displayData.status}
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
                {items.map((item) => (
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
                      ${item.subtotal ? parseFloat(item.subtotal).toFixed(2) : (parseFloat(item.price) * item.quantity).toFixed(2)}
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
                <span>${invoice ? invoice.subtotal.toFixed(2) : displayData.total.toFixed(2)}</span>
              </div>
              
              {invoice && invoice.tax > 0 && (
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  marginBottom: "10px"
                }}>
                  <span>Tax</span>
                  <span>${invoice.tax.toFixed(2)}</span>
                </div>
              )}
              
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
                <span>${displayData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Thank You Note */}
          <div style={{ marginTop: "60px", textAlign: "center" }}>
            <p style={{ marginBottom: "10px", fontStyle: "italic" }}>
              {invoice && invoice.notes ? invoice.notes : "Thank you for shopping with STORE 26!"}
            </p>
            <p style={{ fontSize: "0.9rem", color: "var(--light-text)" }}>
              If you have any questions about this invoice, please contact us at contact@store26.com
            </p>
          </div>
        </div>

        {/* Action Buttons - Only visible on screen, not when printing */}
        <div className="no-print" style={{ 
          textAlign: "center", 
          marginTop: "30px", 
          maxWidth: "800px",
          margin: "30px auto 0"
        }}>
          {/* Print & Back Buttons */}
          <button 
            onClick={handlePrint}
            style={{
              padding: "12px 25px",
              backgroundColor: "var(--primary-color)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "500",
              fontSize: "0.9rem",
              cursor: "pointer",
              marginRight: "15px",
              minWidth: "180px",
              height: "46px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            PRINT INVOICE
          </button>
          <Link 
            to="/orders"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 25px",
              border: "1px solid var(--border-color)",
              borderRadius: "4px",
              backgroundColor: "transparent",
              color: "var(--primary-color)",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: "0.9rem",
              minWidth: "180px",
              height: "46px"
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