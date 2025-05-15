import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2pdf from 'html2pdf.js';
import axios from "axios";

const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!["product manager", "sales manager"].includes(role)) {
      navigate("/unauthorized");
      return;
    }

    const fetchInvoice = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/invoices/${invoiceId}`);
        setInvoice(res.data);
      } catch (err) {
        console.error("Invoice fetch error:", err);
        navigate("/notfound");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, navigate]);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-US");

  const handlePrint = () => window.print();

  if (loading) {
    return <p style={{ padding: "50px", textAlign: "center" }}>Loading invoice...</p>;
  }

  if (!invoice) {
    return <p style={{ padding: "50px", textAlign: "center", color: "red" }}>Invoice not found.</p>;
  }

  return (
    <div>
      <div ref={invoiceRef} style={{ maxWidth: "800px", margin: "0 auto", padding: "40px", backgroundColor: "#fff" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", color: "#333" }}>INVOICE</h1>
            <p>{invoice.invoiceId}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2>STORE 26</h2>
            <p>123 Book Street</p>
            <p>Reading City, RC 12345</p>
            <p>contact@store26.com</p>
          </div>
        </div>

        {/* Bill To */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <div>
            <h3>Bill To</h3>
            <p>{invoice.shippingInfo.name}</p>
            <p>{invoice.shippingInfo.address}</p>
            <p>{invoice.shippingInfo.city}, {invoice.shippingInfo.state} {invoice.shippingInfo.zip}</p>
            <p>{invoice.shippingInfo.country}</p>
            <p>{invoice.shippingInfo.email}</p>
          </div>
          <div>
            <h3>Details</h3>
            <p><strong>Invoice Date:</strong> {formatDate(invoice.invoiceDate)}</p>
            <p><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>
            <p><strong>Order ID:</strong> {invoice.orderId}</p>
            <p><strong>Status:</strong> {invoice.status}</p>
          </div>
        </div>

        {/* Items */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "10px" }}>Item</th>
              <th style={{ textAlign: "center", borderBottom: "1px solid #ccc", padding: "10px" }}>Qty</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ccc", padding: "10px" }}>Price</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ccc", padding: "10px" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map(item => (
              <tr key={item._id}>
                <td style={{ padding: "10px" }}>{item.title}</td>
                <td style={{ textAlign: "center" }}>{item.quantity}</td>
                <td style={{ textAlign: "right" }}>${item.price.toFixed(2)}</td>
                <td style={{ textAlign: "right" }}>${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div style={{ textAlign: "right" }}>
          <p><strong>Subtotal:</strong> ${invoice.subtotal.toFixed(2)}</p>
          <p><strong>Shipping:</strong> ${invoice.shippingCost.toFixed(2)}</p>
          <p><strong>Tax:</strong> ${invoice.tax.toFixed(2)}</p>
          <h3><strong>Total:</strong> ${invoice.total.toFixed(2)}</h3>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <p style={{ marginTop: "30px", fontStyle: "italic" }}>{invoice.notes}</p>
        )}
      </div>

      <div style={{ textAlign: "center", margin: "30px" }} className="no-print">
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
      </div>

      {/* Print CSS */}
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
    </div>
  );
};

export default InvoiceDetail;
