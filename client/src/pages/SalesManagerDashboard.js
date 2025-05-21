import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";
import { FaShoppingBag, FaExclamationTriangle, FaChartBar, FaSearch } from "react-icons/fa";
import axios from "axios";

const SalesManagerDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    pendingOrders: 0
  });
  
  // Check if user is authorized
  useEffect(() => {
    const checkAuth = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      
      if (!userId || !token) {
        navigate("/login");
        return;
      }
      
      try {
        // Get user profile to check role
        const response = await axios.get(`http://localhost:3001/api/users/${userId}`);
        console.log("User data for auth check:", response.data);
        const userType = response.data.userType || "";
        
        // Allow access if user type includes "sales" or is admin
        if (!userType.includes("sales") && userType !== "admin") {
          // Not authorized, redirect to home
          console.log("Access denied. User type:", userType);
          navigate("/");
          alert("You don't have permission to access this page");
        } else {
          console.log("Access granted. User type:", userType);
          // User is authorized, fetch orders
          fetchOrders();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/api/orders");
      setOrders(response.data);
      
      // Calculate statistics
      const totalOrders = response.data.length;
      const totalSales = response.data.reduce((sum, order) => sum + (order.total || 0), 0);
      const pendingOrders = response.data.filter(order => 
        order.status === "pending" || order.status === "processing"
      ).length;
      
      setStats({
        totalSales,
        totalOrders,
        averageOrderValue: totalOrders ? (totalSales / totalOrders) : 0,
        pendingOrders
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again later.");
      setLoading(false);
    }
  };
  
  const handleViewOrder = (orderId) => {
    navigate(`/admin/manage-orders?orderId=${orderId}`);
  };
  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#f57c00'; // Orange
      case 'processing':
        return '#2196f3'; // Blue
      case 'shipped':
        return '#8bc34a'; // Light Green
      case 'delivered':
        return '#4caf50'; // Green
      case 'cancelled':
        return '#f44336'; // Red
      default:
        return '#757575'; // Grey
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div style={{ backgroundColor: "var(--light-bg)", minHeight: "100vh" }}>
      <NavigationBar />
      
      <div className="container" style={{ padding: "60px 0" }}>
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2.5rem",
            fontWeight: "500",
            color: "var(--primary-color)",
            margin: 0
          }}>
            Sales Manager Dashboard
          </h1>
        </div>
        
        {/* Stats Cards */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
          gap: "20px",
          marginBottom: "40px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
            borderLeft: "4px solid var(--primary-color)"
          }}>
            <h3 style={{ fontSize: "1rem", color: "var(--light-text)", margin: "0 0 10px 0" }}>
              Total Sales
            </h3>
            <p style={{ fontSize: "1.8rem", fontWeight: "500", margin: 0, color: "var(--primary-color)" }}>
              ${stats.totalSales.toFixed(2)}
            </p>
          </div>
          
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
            borderLeft: "4px solid #4caf50"
          }}>
            <h3 style={{ fontSize: "1rem", color: "var(--light-text)", margin: "0 0 10px 0" }}>
              Total Orders
            </h3>
            <p style={{ fontSize: "1.8rem", fontWeight: "500", margin: 0, color: "#4caf50" }}>
              {stats.totalOrders}
            </p>
          </div>
          
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
            borderLeft: "4px solid #2196f3"
          }}>
            <h3 style={{ fontSize: "1rem", color: "var(--light-text)", margin: "0 0 10px 0" }}>
              Average Order
            </h3>
            <p style={{ fontSize: "1.8rem", fontWeight: "500", margin: 0, color: "#2196f3" }}>
              ${stats.averageOrderValue.toFixed(2)}
            </p>
          </div>
          
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
            borderLeft: "4px solid #f57c00"
          }}>
            <h3 style={{ fontSize: "1rem", color: "var(--light-text)", margin: "0 0 10px 0" }}>
              Pending Orders
            </h3>
            <p style={{ fontSize: "1.8rem", fontWeight: "500", margin: 0, color: "#f57c00" }}>
              {stats.pendingOrders}
            </p>
          </div>
        </div>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div style={{
            padding: "20px",
            backgroundColor: "#ffebee",
            borderRadius: "8px",
            color: "#c62828",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <FaExclamationTriangle size={24} />
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        ) : (
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "30px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)"
          }}>
            <h2 style={{
              fontSize: "1.5rem",
              marginBottom: "20px",
              color: "var(--primary-color)",
              display: "flex",
              alignItems: "center"
            }}>
              <FaShoppingBag style={{ marginRight: "10px" }} />
              Recent Orders
            </h2>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse"
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: "#f5f5f5",
                    borderBottom: "2px solid var(--border-color)"
                  }}>
                    <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Order ID</th>
                    <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Customer</th>
                    <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Date</th>
                    <th style={{ padding: "15px", textAlign: "right", fontWeight: "500" }}>Total</th>
                    <th style={{ padding: "15px", textAlign: "center", fontWeight: "500" }}>Status</th>
                    <th style={{ padding: "15px", textAlign: "center", fontWeight: "500" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} style={{
                      borderBottom: "1px solid var(--border-color)"
                    }}>
                      <td style={{ padding: "15px" }}>
                        #{order._id.substring(order._id.length - 6)}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.user?.name || order.user?.email || "Guest"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {formatDate(order.createdAt)}
                      </td>
                      <td style={{ padding: "15px", textAlign: "right", fontWeight: "500" }}>
                        ${order.total?.toFixed(2) || "0.00"}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: "50px",
                          backgroundColor: `${getStatusColor(order.status)}20`,
                          color: getStatusColor(order.status),
                          fontWeight: "500",
                          fontSize: "0.8rem",
                          textTransform: "capitalize"
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <button
                          onClick={() => handleViewOrder(order._id)}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "var(--primary-color)",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.8rem"
                          }}
                        >
                          <FaSearch size={12} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default SalesManagerDashboard; 