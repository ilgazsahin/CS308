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

  