import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function InvoiceViewPage() {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const role = localStorage.getItem("role");
    
        if (role !== "product manager" && role !== "sales manager") {
            navigate("/unauthorized");
            return;
        }
    
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await axios.get("http://localhost:3001/api/users");
                setUsers(res.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Failed to load users. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
    
        fetchUsers();
    }, [navigate]);
    const fetchInvoices = async () => {
        if (!selectedUserId) return;
    
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`http://localhost:3001/api/invoices/user/${selectedUserId}`);
            setInvoices(res.data);
        } catch (err) {
            console.error("Error fetching invoices:", err);
            setError("Failed to load invoices. Please try again later.");
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };
        
}

export default InvoiceViewPage;
