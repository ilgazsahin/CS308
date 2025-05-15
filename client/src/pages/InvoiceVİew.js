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

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Invoice Viewer</h2>

            <div style={{ marginBottom: "1rem" }}>
                <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    style={{ padding: "8px", marginRight: "10px" }}
                    disabled={loading}
                >
                    <option value="">Select a user</option>
                    {users.map(user => (
                        <option key={user._id} value={user._id}>
                            {user.name} ({user.email})
                        </option>
                    ))}
                </select>

                <button 
                    onClick={fetchInvoices} 
                    style={{ padding: "8px 12px" }}
                    disabled={!selectedUserId || loading}
                >
                    {loading ? "Loading..." : "View Invoices"}
                </button>
            </div>

            {error && (
                <div style={{ color: "red", marginBottom: "1rem" }}>
                    {error}
                </div>
            )}

            <div style={{ marginTop: "2rem" }}>
                {invoices.length > 0 ? (
                    <div>
                        <h3>Invoices for Selected User</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse" }} border="1" cellPadding="8">
                            <thead>
                                <tr style={{ backgroundColor: "#f2f2f2" }}>
                                    <th>Invoice ID</th>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Due Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(inv => (
                                    <tr key={inv._id}>
                                        <td>{inv.invoiceId}</td>
                                        <td>{inv.orderId}</td>
                                        <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                                        <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                                        <td>${inv.total.toFixed(2)}</td>
                                        <td>
                                            <span style={{
                                                backgroundColor: 
                                                    inv.status === "Paid" ? "#e6ffe6" :
                                                    inv.status === "Pending" ? "#fff2e6" :
                                                    inv.status === "Overdue" ? "#ffe6e6" : "#f2f2f2",
                                                padding: "3px 8px",
                                                borderRadius: "4px"
                                            }}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => window.open(`/admin/detailinvoice/${inv.invoiceId}`, "_blank")}
                                                style={{ padding: "4px 8px" }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    selectedUserId && !loading && (
                        <div style={{ textAlign: "center", padding: "2rem", backgroundColor: "#f9f9f9" }}>
                            <p>No invoices found for selected user.</p>
                            <p style={{ fontSize: "0.9rem", color: "#666" }}>
                                This could be because the user hasn't made any orders or the invoices weren't properly saved.
                            </p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default InvoiceViewPage;
