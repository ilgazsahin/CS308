import React, { forwardRef } from 'react';
import { FaBook } from 'react-icons/fa';

const PrintableInvoice = forwardRef(({ order }, ref) => {
  return (
    <div ref={ref} className="printable-invoice">
      {/* Company Header */}
      <div style={{ 
        padding: "20px 0",
        borderBottom: "1px solid #eee",
        textAlign: "center"
      }}>
        <h1 style={{ 
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.8rem",
          color: "#5d4037",
          margin: "0 0 10px 0"
        }}>
          BookStore
        </h1>
        <p style={{ margin: "0 0 5px 0" }}>123 Book Street, Reading City</p>
        <p style={{ margin: "0 0 5px 0" }}>Email: info@bookstore.com</p>
        <p style={{ margin: "0 0 5px 0" }}>Phone: (123) 456-7890</p>
      </div>
      
      {/* Invoice Title */}
      <div style={{
        padding: "20px 0",
        textAlign: "center"
      }}>
        <h2 style={{ margin: "0" }}>INVOICE</h2>
        <p style={{ margin: "5px 0 0" }}>#{order._id.substring(order._id.length - 6)}</p>
        <p style={{ margin: "5px 0 0" }}>
          {new Date(order.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          })}
        </p>
      </div>
      
      {/* Customer and Shipping Info */}
      <div style={{
        padding: "20px 0",
        borderBottom: "1px solid #eee",
        borderTop: "1px solid #eee",
        display: "flex",
        flexWrap: "wrap"
      }}>
        <div style={{ flex: "1", minWidth: "250px", marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 10px", fontSize: "1rem", fontWeight: "500", color: "#5d4037" }}>
            Customer Information
          </h4>
          <p style={{ margin: "0", fontWeight: "500" }}>
            {order.shippingInfo?.name || "N/A"}
          </p>
          <p style={{ margin: "5px 0 0" }}>
            {order.shippingInfo?.email || "No email provided"}
          </p>
          <p style={{ margin: "5px 0 0" }}>
            {order.shippingInfo?.phone || "No phone provided"}
          </p>
        </div>
        <div style={{ flex: "1", minWidth: "250px" }}>
          <h4 style={{ margin: "0 0 10px", fontSize: "1rem", fontWeight: "500", color: "#5d4037" }}>
            Shipping Address
          </h4>
          <p style={{ margin: "0", fontWeight: "500" }}>
            {order.shippingInfo?.address || "No address provided"}
          </p>
          <p style={{ margin: "5px 0 0" }}>
            {order.shippingInfo?.city || ""}{order.shippingInfo?.city && order.shippingInfo?.state ? ", " : ""}{order.shippingInfo?.state || ""} {order.shippingInfo?.zip || ""}
          </p>
          <p style={{ margin: "5px 0 0" }}>
            {order.shippingInfo?.country || ""}
          </p>
        </div>
      </div>
      
      {/* Order Items */}
      <div style={{ padding: "20px 0" }}>
        <h4 style={{ margin: "0 0 15px", fontSize: "1rem", fontWeight: "500", color: "#5d4037" }}>
          Order Items
        </h4>
        
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #eee" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>Item</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Quantity</th>
              <th style={{ padding: "10px", textAlign: "right" }}>Price</th>
              <th style={{ padding: "10px", textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items && order.items.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px", textAlign: "left" }}>
                  <div style={{ fontWeight: "500" }}>{item.title}</div>
                  <div style={{ fontSize: "0.9rem", color: "#757575" }}>{item.author || "Unknown Author"}</div>
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>{item.quantity}</td>
                <td style={{ padding: "10px", textAlign: "right" }}>${item.price.toFixed(2)}</td>
                <td style={{ padding: "10px", textAlign: "right" }}>${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Summary */}
        <div style={{ 
          marginTop: "20px", 
          display: "flex",
          justifyContent: "flex-end",
          borderTop: "1px solid #eee",
          paddingTop: "20px"
        }}>
          <table style={{ width: "300px", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "5px 0", textAlign: "left", fontWeight: "500" }}>Subtotal:</td>
                <td style={{ padding: "5px 0", textAlign: "right" }}>${order.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px 0", textAlign: "left", fontWeight: "500" }}>Shipping:</td>
                <td style={{ padding: "5px 0", textAlign: "right" }}>$0.00</td>
              </tr>
              <tr style={{ borderTop: "1px solid #eee", fontSize: "1.1rem" }}>
                <td style={{ padding: "10px 0", textAlign: "left", fontWeight: "700" }}>Total:</td>
                <td style={{ padding: "10px 0", textAlign: "right", fontWeight: "700" }}>${order.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ 
        marginTop: "40px",
        borderTop: "1px solid #eee",
        padding: "20px 0",
        textAlign: "center",
        fontSize: "0.9rem",
        color: "#757575"
      }}>
        <p style={{ margin: "0" }}>Thank you for your business!</p>
        <p style={{ margin: "5px 0 0" }}>For any questions regarding this invoice, please contact support@bookstore.com</p>
      </div>
    </div>
  );
});

export default PrintableInvoice; 