import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";
import { FaBook, FaPlus, FaEdit, FaTrash, FaExclamationTriangle, FaTags, FaBoxes, FaTruck, FaTh, FaComments, FaCheck, FaTimes, FaFileInvoiceDollar } from "react-icons/fa";
import axios from "axios";

const ProductManagerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("books");
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for stock inputs - store as object with bookId as key
  const [stockInputs, setStockInputs] = useState({});
  
  // New category form state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  
  // State for status filter
  const [statusFilter, setStatusFilter] = useState("all");
  
  // State for invoice filter
  const [invoiceFilter, setInvoiceFilter] = useState("all");
  
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
        
        // Allow access if user type includes "product" or is admin
        if (!userType.includes("product") && userType !== "admin") {
          // Not authorized, redirect to home
          console.log("Access denied. User type:", userType);
          navigate("/");
          alert("You don't have permission to access this page");
        } else {
          console.log("Access granted. User type:", userType);
          // User is authorized, fetch initial data
          fetchBooks();
          fetchCategories();
          fetchOrders();
          fetchComments();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  // Initialize stock inputs when books change
  useEffect(() => {
    const newStockInputs = {};
    books.forEach(book => {
      newStockInputs[book._id] = book.stock || 0;
    });
    setStockInputs(newStockInputs);
  }, [books]);
  
  // Fetch books
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/api/books");
      setBooks(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching books:", error);
      setError("Failed to load books. Please try again later.");
      setLoading(false);
    }
  };
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  
  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/orders");
      // Sort orders by date, newest first
      const sortedOrders = response.data.sort((a, b) => 
        new Date(b.orderDate) - new Date(a.orderDate)
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  
  // Fetch comments
  const fetchComments = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/comments/admin/all");
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  
  // Book management functions
  const handleAddBook = () => {
    navigate("/addbook");
  };
  
  const handleEditBook = (bookId) => {
    navigate(`/editbook/${bookId}`);
  };
  
  const handleDeleteBook = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await axios.delete(`http://localhost:3001/api/books/${bookId}`);
        // Remove book from state
        setBooks(books.filter(book => book._id !== bookId));
      } catch (error) {
        console.error("Error deleting book:", error);
        alert("Failed to delete book. Please try again.");
      }
    }
  };
  
  // Category management functions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    try {
      setAddingCategory(true);
      const response = await axios.post("http://localhost:3001/api/categories", {
        name: newCategoryName
      });
      
      // Add new category to state
      setCategories([...categories, response.data]);
      setNewCategoryName("");
      setAddingCategory(false);
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category. Please try again.");
      setAddingCategory(false);
    }
  };
  
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category? Books in this category will be affected.")) {
      try {
        await axios.delete(`http://localhost:3001/api/categories/${categoryId}`);
        // Remove category from state
        setCategories(categories.filter(category => category._id !== categoryId));
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category. It may be in use by books.");
      }
    }
  };
  
  // Handle stock input change
  const handleStockInputChange = (bookId, value) => {
    setStockInputs(prev => ({
      ...prev,
      [bookId]: parseInt(value) || 0
    }));
  };
  
  // Stock management function
  const handleUpdateStock = async (bookId) => {
    try {
      const newStock = stockInputs[bookId];
      
      await axios.patch(`http://localhost:3001/api/books/${bookId}`, {
        stock: newStock
      });
      
      // Update stock in local state
      setBooks(books.map(book => 
        book._id === bookId ? { ...book, stock: newStock } : book
      ));
      
      alert(`Stock updated successfully!`);
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Failed to update stock. Please try again.");
    }
  };
  
  // Order status management
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`Updating order ${orderId} to status: ${newStatus}`);
      
      // Use the _id directly with the API endpoint
      const response = await axios.patch(`http://localhost:3001/api/orders/${orderId}/status`, {
        status: newStatus
      });
      
      console.log('Update response:', response.data);
      
      // Update status in local state and sort by date (newest first)
      const updatedOrders = orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      
      setOrders(updatedOrders);
      
      // Show success message
      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(`Failed to update order status: ${error.response?.data?.message || error.message}`);
    }
  };
  
  // Comment approval management
  const handleCommentStatus = async (commentId, approve) => {
    try {
      await axios.patch(`http://localhost:3001/api/comments/${commentId}/status`, {
        status: approve
      });
      
      // Update comments in local state
      setComments(comments.map(comment => 
        comment._id === commentId ? { ...comment, status: approve } : comment
      ));
      
      alert(`Comment ${approve ? "approved" : "rejected"} successfully!`);
    } catch (error) {
      console.error("Error updating comment status:", error);
      alert("Failed to update comment status. Please try again.");
    }
  };
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "books":
        return renderBooksTab();
      case "categories":
        return renderCategoriesTab();
      case "stock":
        return renderStockTab();
      case "delivery":
        return renderDeliveryTab();
      case "invoice":
        return renderInvoiceTab();
      case "comments":
        return renderCommentsTab();
      default:
        return renderBooksTab();
    }
  };
  
  // Books tab content
  const renderBooksTab = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <p>Loading books...</p>
        </div>
      );
    }
    
    if (error) {
      return (
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
      );
    }
    
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "30px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{ marginBottom: "20px" }}>
          <p style={{ color: "#757575", fontSize: "0.9rem" }}>
            <strong>Note:</strong> New books will not be visible in the shop until a price is set by the sales manager.
          </p>
        </div>
        
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
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Title</th>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Author</th>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Category</th>
                <th style={{ padding: "15px", textAlign: "right", fontWeight: "500" }}>Price</th>
                <th style={{ padding: "15px", textAlign: "center", fontWeight: "500" }}>Stock</th>
                <th style={{ padding: "15px", textAlign: "center", fontWeight: "500" }}>Status</th>
                <th style={{ padding: "15px", textAlign: "center", fontWeight: "500" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id} style={{
                  borderBottom: "1px solid var(--border-color)"
                }}>
                  <td style={{ padding: "15px" }}>{book.title}</td>
                  <td style={{ padding: "15px" }}>{book.author}</td>
                  <td style={{ padding: "15px" }}>{book.category?.name || "N/A"}</td>
                  <td style={{ padding: "15px", textAlign: "right" }}>
                    {book.price ? `$${book.price.toFixed(2)}` : "Not set"}
                  </td>
                  <td style={{ 
                    padding: "15px", 
                    textAlign: "center",
                    color: book.stock <= 0 ? "#d32f2f" : book.stock < 5 ? "#f57c00" : "#388e3c"
                  }}>
                    {book.stock || 0}
                  </td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: "50px",
                      backgroundColor: book.price ? "#e8f5e9" : "#ffebee",
                      color: book.price ? "#388e3c" : "#d32f2f",
                      fontSize: "0.8rem"
                    }}>
                      {book.price ? "Active" : "Waiting for price"}
                    </span>
                  </td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                      <button
                        onClick={() => handleEditBook(book._id)}
                        style={{
                          padding: "8px",
                          backgroundColor: "var(--primary-color)",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                        title="Edit Book"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book._id)}
                        style={{
                          padding: "8px",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                        title="Delete Book"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Categories tab content
  const renderCategoriesTab = () => {
    return (
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
          <FaTags style={{ marginRight: "10px" }} />
          Categories
        </h2>
        
        {/* Add category form */}
        <form onSubmit={handleAddCategory} style={{ marginBottom: "30px" }}>
          <div style={{ display: "flex", gap: "15px" }}>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              style={{
                flex: 1,
                padding: "10px 15px",
                border: "1px solid var(--border-color)",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            />
            <button
              type="submit"
              disabled={addingCategory || !newCategoryName.trim()}
              style={{
                padding: "10px 20px",
                backgroundColor: addingCategory ? "#cccccc" : "var(--primary-color)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: addingCategory ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <FaPlus size={14} />
              Add Category
            </button>
          </div>
        </form>
        
        {/* Categories list */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" }}>
          {categories.map((category) => (
            <div key={category._id} style={{
              backgroundColor: "#f5f5f5",
              padding: "15px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span>{category.name}</span>
              <button
                onClick={() => handleDeleteCategory(category._id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f44336",
                  cursor: "pointer",
                  padding: "5px"
                }}
                title="Delete Category"
              >
                <FaTrash size={14} />
              </button>
            </div>
          ))}
          
          {categories.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "20px", color: "#757575" }}>
              No categories found. Add your first category above.
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Stock management tab content
  const renderStockTab = () => {
    return (
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
          <FaBoxes style={{ marginRight: "10px" }} />
          Stock Management
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
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Book</th>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Author</th>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Category</th>
                <th style={{ padding: "15px", textAlign: "center", fontWeight: "500" }}>Current Stock</th>
                <th style={{ padding: "15px", textAlign: "center", fontWeight: "500" }}>Update Stock</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id} style={{
                  borderBottom: "1px solid var(--border-color)"
                }}>
                  <td style={{ padding: "15px" }}>{book.title}</td>
                  <td style={{ padding: "15px" }}>{book.author}</td>
                  <td style={{ padding: "15px" }}>{book.category?.name || "N/A"}</td>
                  <td style={{ 
                    padding: "15px", 
                    textAlign: "center",
                    color: book.stock <= 0 ? "#d32f2f" : book.stock < 5 ? "#f57c00" : "#388e3c",
                    fontWeight: "bold"
                  }}>
                    {book.stock || 0}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                      <input
                        type="number"
                        min="0"
                        value={stockInputs[book._id] || 0}
                        onChange={(e) => handleStockInputChange(book._id, e.target.value)}
                        style={{
                          width: "80px",
                          padding: "8px",
                          border: "1px solid var(--border-color)",
                          borderRadius: "4px",
                          textAlign: "center"
                        }}
                      />
                      <button
                        onClick={() => handleUpdateStock(book._id)}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "var(--primary-color)",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.8rem"
                        }}
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Delivery management tab content
  const renderDeliveryTab = () => {
    // Filter orders based on status filter
    const filteredOrders = statusFilter === "all" 
      ? orders 
      : orders.filter(order => order.status?.toLowerCase() === statusFilter);
    
    // Get status display style
    const getStatusStyle = (status) => {
      switch(status?.toLowerCase()) {
        case "processing":
          return {
            backgroundColor: "#e1f5fe",
            color: "#0277bd"
          };
        case "in-transit":
          return {
            backgroundColor: "#e8f5e9",
            color: "#2e7d32"
          };
        case "delivered":
          return {
            backgroundColor: "#e0f2f1",
            color: "#00796b"
          };
        default:
          return {
            backgroundColor: "#f5f5f5",
            color: "#757575"
          };
      }
    };
    
    return (
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
          <FaTruck style={{ marginRight: "10px" }} />
          Delivery Management
        </h2>
        
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "#757575", fontSize: "0.9rem", margin: 0 }}>
            <strong>Note:</strong> Monitor and update the status of orders as they progress through the delivery pipeline.
          </p>
          
          {/* Status filter */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <label style={{ marginRight: "10px", color: "#757575" }}>Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid var(--border-color)",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            >
              <option value="all">All Orders</option>
              <option value="processing">Processing</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "#757575" }}>
            No orders found matching the selected filter.
          </div>
        ) : (
          <div>
            {filteredOrders.map((order) => (
              <div key={order._id} style={{
                marginBottom: "30px",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                overflow: "hidden"
              }}>
                {/* Order Header */}
                <div style={{
                  padding: "15px 20px",
                  backgroundColor: "#f5f5f5",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "500" }}>
                      Order #{order._id.substring(order._id.length - 6)}
                    </h3>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9rem", color: "#757575" }}>
                      {new Date(order.orderDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9rem", color: "#757575" }}>
                      <strong>Order ID:</strong> {order._id}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9rem", color: "#757575" }}>
                      <strong>Customer ID:</strong> {order.userId}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "6px 12px",
                      borderRadius: "50px",
                      ...getStatusStyle(order.status),
                      fontWeight: "500",
                      fontSize: "0.8rem",
                      textTransform: "capitalize",
                      marginRight: "15px"
                    }}>
                      {order.status}
                    </span>
                    <select
                      value={order.status || "processing"}
                      onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "4px",
                        fontSize: "0.9rem"
                      }}
                    >
                      <option value="processing">Processing</option>
                      <option value="in-transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
                
                {/* Customer Info */}
                <div style={{
                  padding: "15px 20px",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex"
                }}>
                  <div style={{ flex: "1" }}>
                    <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: "500", color: "#757575" }}>
                      Customer
                    </h4>
                    <p style={{ margin: "0", fontWeight: "500" }}>
                      {order.shippingInfo?.name || "N/A"}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9rem" }}>
                      {order.shippingInfo?.email || "No email provided"}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9rem" }}>
                      {order.shippingInfo?.phone || "No phone provided"}
                    </p>
                  </div>
                  <div style={{ flex: "2" }}>
                    <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: "500", color: "#757575" }}>
                      Shipping Address
                    </h4>
                    <p style={{ margin: "0", fontWeight: "500" }}>
                      {order.shippingInfo?.address || "No address provided"}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9rem" }}>
                      {order.shippingInfo?.city || ""}{order.shippingInfo?.city && order.shippingInfo?.state ? ", " : ""}{order.shippingInfo?.state || ""} {order.shippingInfo?.zip || ""}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9rem" }}>
                      {order.shippingInfo?.country || ""}
                    </p>
                  </div>
                </div>
                
                {/* Order Items */}
                <div style={{ padding: "15px 20px" }}>
                  <h4 style={{ margin: "0 0 15px", fontSize: "0.9rem", fontWeight: "500", color: "#757575" }}>
                    Order Items
                  </h4>
                  
                  <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                    {order.items && order.items.map((item, index) => (
                      <div key={index} style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom: index < order.items.length - 1 ? "1px solid #eee" : "none"
                      }}>
                        <div style={{ width: "50px", height: "70px", marginRight: "15px" }}>
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                            />
                          ) : (
                            <div style={{ 
                              width: "100%", 
                              height: "100%", 
                              backgroundColor: "#f5f5f5",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#bdbdbd"
                            }}>
                              <FaBook />
                            </div>
                          )}
                        </div>
                        <div style={{ flex: "1" }}>
                          <p style={{ margin: "0", fontWeight: "500" }}>{item.title}</p>
                          <p style={{ margin: "5px 0 0", fontSize: "0.9rem", color: "#757575" }}>
                            {item.author || "Unknown Author"}
                          </p>
                          <p style={{ margin: "5px 0 0", fontSize: "0.9rem", color: "#757575" }}>
                            <strong>Product ID:</strong> {item._id}
                          </p>
                        </div>
                        <div style={{ textAlign: "right", marginLeft: "20px" }}>
                          <p style={{ margin: "0", fontWeight: "500" }}>Qty: {item.quantity}</p>
                          <p style={{ margin: "5px 0 0", fontSize: "0.9rem" }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ 
                    marginTop: "20px", 
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    padding: "15px 0 0",
                    borderTop: "1px solid var(--border-color)"
                  }}>
                    <p style={{ margin: "0", fontSize: "1.1rem", fontWeight: "700" }}>
                      Total: ${order.total.toFixed(2)}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "0.8rem", color: "#757575", textAlign: "right" }}>
                      {order.items?.length || 0} {order.items?.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Invoice management tab content
  const renderInvoiceTab = () => {
    // Filter orders based on status filter
    const filteredOrders = invoiceFilter === "all" 
      ? orders 
      : orders.filter(order => order.status?.toLowerCase() === invoiceFilter);
    
    // Get status display style
    const getStatusStyle = (status) => {
      switch(status?.toLowerCase()) {
        case "processing":
          return {
            backgroundColor: "#e1f5fe",
            color: "#0277bd"
          };
        case "in-transit":
          return {
            backgroundColor: "#e8f5e9",
            color: "#2e7d32"
          };
        case "delivered":
          return {
            backgroundColor: "#e0f2f1",
            color: "#00796b"
          };
        default:
          return {
            backgroundColor: "#f5f5f5",
            color: "#757575"
          };
      }
    };
    
    return (
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
          <FaFileInvoiceDollar style={{ marginRight: "10px" }} />
          Invoice Management
        </h2>
        
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "#757575", fontSize: "0.9rem", margin: 0 }}>
            <strong>Note:</strong> View order invoices and detailed information.
          </p>
          
          {/* Status filter */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <label style={{ marginRight: "10px", color: "#757575" }}>Filter by status:</label>
            <select
              value={invoiceFilter}
              onChange={(e) => setInvoiceFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid var(--border-color)",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            >
              <option value="all">All Orders</option>
              <option value="processing">Processing</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "#757575" }}>
            No orders found matching the selected filter.
          </div>
        ) : (
          <div>
            {filteredOrders.map((order) => (
              <div key={order._id} style={{
                marginBottom: "30px",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                overflow: "hidden"
              }}>
                {/* Order Header */}
                <div style={{
                  padding: "15px 20px",
                  backgroundColor: "#f5f5f5",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "500" }}>
                      Order #{order._id.substring(order._id.length - 6)}
                    </h3>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9rem", color: "#757575" }}>
                      {new Date(order.orderDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9rem", color: "#757575" }}>
                      <strong>Order ID:</strong> {order._id}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9rem", color: "#757575" }}>
                      <strong>Customer ID:</strong> {order.userId}
                    </p>
                  </div>
                  <div>
                    <span style={{
                      display: "inline-block",
                      padding: "6px 12px",
                      borderRadius: "50px",
                      ...getStatusStyle(order.status),
                      fontWeight: "500",
                      fontSize: "0.8rem",
                      textTransform: "capitalize"
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                {/* Customer Info */}
                <div style={{
                  padding: "15px 20px",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex"
                }}>
                  <div style={{ flex: "1" }}>
                    <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: "500", color: "#757575" }}>
                      Customer
                    </h4>
                    <p style={{ margin: "0", fontWeight: "500" }}>
                      {order.shippingInfo?.name || "N/A"}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9rem" }}>
                      {order.shippingInfo?.email || "No email provided"}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9rem" }}>
                      {order.shippingInfo?.phone || "No phone provided"}
                    </p>
                  </div>
                  <div style={{ flex: "2" }}>
                    <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: "500", color: "#757575" }}>
                      Shipping Address
                    </h4>
                    <p style={{ margin: "0", fontWeight: "500" }}>
                      {order.shippingInfo?.address || "No address provided"}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9rem" }}>
                      {order.shippingInfo?.city || ""}{order.shippingInfo?.city && order.shippingInfo?.state ? ", " : ""}{order.shippingInfo?.state || ""} {order.shippingInfo?.zip || ""}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "0.9rem" }}>
                      {order.shippingInfo?.country || ""}
                    </p>
                  </div>
                </div>
                
                {/* Order Items */}
                <div style={{ padding: "15px 20px" }}>
                  <h4 style={{ margin: "0 0 15px", fontSize: "0.9rem", fontWeight: "500", color: "#757575" }}>
                    Order Items
                  </h4>
                  
                  <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                    {order.items && order.items.map((item, index) => (
                      <div key={index} style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom: index < order.items.length - 1 ? "1px solid #eee" : "none"
                      }}>
                        <div style={{ width: "50px", height: "70px", marginRight: "15px" }}>
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                            />
                          ) : (
                            <div style={{ 
                              width: "100%", 
                              height: "100%", 
                              backgroundColor: "#f5f5f5",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#bdbdbd"
                            }}>
                              <FaBook />
                            </div>
                          )}
                        </div>
                        <div style={{ flex: "1" }}>
                          <p style={{ margin: "0", fontWeight: "500" }}>{item.title}</p>
                          <p style={{ margin: "5px 0 0", fontSize: "0.9rem", color: "#757575" }}>
                            {item.author || "Unknown Author"}
                          </p>
                          <p style={{ margin: "5px 0 0", fontSize: "0.9rem", color: "#757575" }}>
                            <strong>Product ID:</strong> {item._id}
                          </p>
                        </div>
                        <div style={{ textAlign: "right", marginLeft: "20px" }}>
                          <p style={{ margin: "0", fontWeight: "500" }}>Qty: {item.quantity}</p>
                          <p style={{ margin: "5px 0 0", fontSize: "0.9rem" }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ 
                    marginTop: "20px", 
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    padding: "15px 0 0",
                    borderTop: "1px solid var(--border-color)"
                  }}>
                    <p style={{ margin: "0", fontSize: "1.1rem", fontWeight: "700" }}>
                      Total: ${order.total.toFixed(2)}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "0.8rem", color: "#757575", textAlign: "right" }}>
                      {order.items?.length || 0} {order.items?.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Comments tab content
  const renderCommentsTab = () => {
    const pendingComments = comments.filter(comment => !comment.status);
    const approvedComments = comments.filter(comment => comment.status);
    
    return (
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
          <FaComments style={{ marginRight: "10px" }} />
          Comments Management
        </h2>
        
        {comments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "#757575" }}>
            No comments found in the system.
          </div>
        ) : (
          <div>
            {/* Pending Comments Section */}
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{ 
                fontSize: "1.2rem", 
                marginBottom: "15px",
                backgroundColor: "#fff3e0",
                padding: "10px 15px",
                borderRadius: "4px",
                color: "#e65100",
                display: "flex",
                alignItems: "center"
              }}>
                <FaExclamationTriangle style={{ marginRight: "10px" }} />
                Pending Approval ({pendingComments.length})
              </h3>
              
              {pendingComments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#757575" }}>
                  No pending comments to review.
                </div>
              ) : (
                pendingComments.map(comment => (
                  <div key={comment._id} style={{
                    border: "1px solid #f0f0f0",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "15px"
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "15px" }}>
                      {comment.book.image ? (
                        <img 
                          src={comment.book.image} 
                          alt={comment.book.title} 
                          style={{ 
                            width: "60px", 
                            height: "90px", 
                            objectFit: "cover",
                            borderRadius: "4px" 
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "60px", 
                          height: "90px",
                          backgroundColor: "#f5f5f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "4px"
                        }}>
                          <FaBook size={20} color="#bdbdbd" />
                        </div>
                      )}
                      
                      <div style={{ flex: "1" }}>
                        <h4 style={{ margin: "0 0 5px", fontSize: "1rem" }}>
                          {comment.book.title}
                        </h4>
                        <p style={{ 
                          margin: "0 0 10px", 
                          fontSize: "0.9rem", 
                          color: "#757575" 
                        }}>
                          by {comment.book.author}
                        </p>
                        
                        <div style={{ 
                          backgroundColor: "#f9f9f9", 
                          padding: "12px", 
                          borderRadius: "6px",
                          margin: "10px 0"
                        }}>
                          <p style={{ margin: "0 0 5px" }}>{comment.text}</p>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <p style={{ margin: "10px 0 0", fontSize: "0.85rem", color: "#757575" }}>
                              <strong>By:</strong> {comment.user.name || comment.user.email || "Unknown User"}
                            </p>
                            <p style={{ margin: "5px 0 0", fontSize: "0.85rem", color: "#757575" }}>
                              <strong>Date:</strong> {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button
                              onClick={() => handleCommentStatus(comment._id, true)}
                              style={{
                                padding: "8px 12px",
                                backgroundColor: "#4caf50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "0.9rem"
                              }}
                            >
                              <FaCheck />
                              Approve
                            </button>
                            
                            <button
                              onClick={() => handleCommentStatus(comment._id, false)}
                              style={{
                                padding: "8px 12px",
                                backgroundColor: "#f44336",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "0.9rem"
                              }}
                            >
                              <FaTimes />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Approved Comments Section */}
            <div>
              <h3 style={{ 
                fontSize: "1.2rem", 
                marginBottom: "15px",
                backgroundColor: "#e8f5e9",
                padding: "10px 15px",
                borderRadius: "4px",
                color: "#2e7d32",
                display: "flex",
                alignItems: "center"
              }}>
                <FaCheck style={{ marginRight: "10px" }} />
                Approved Comments ({approvedComments.length})
              </h3>
              
              {approvedComments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#757575" }}>
                  No approved comments to display.
                </div>
              ) : (
                approvedComments.map(comment => (
                  <div key={comment._id} style={{
                    border: "1px solid #f0f0f0",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "15px"
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "15px" }}>
                      {comment.book.image ? (
                        <img 
                          src={comment.book.image} 
                          alt={comment.book.title} 
                          style={{ 
                            width: "60px", 
                            height: "90px", 
                            objectFit: "cover",
                            borderRadius: "4px" 
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "60px", 
                          height: "90px",
                          backgroundColor: "#f5f5f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "4px"
                        }}>
                          <FaBook size={20} color="#bdbdbd" />
                        </div>
                      )}
                      
                      <div style={{ flex: "1" }}>
                        <h4 style={{ margin: "0 0 5px", fontSize: "1rem" }}>
                          {comment.book.title}
                        </h4>
                        <p style={{ 
                          margin: "0 0 10px", 
                          fontSize: "0.9rem", 
                          color: "#757575" 
                        }}>
                          by {comment.book.author}
                        </p>
                        
                        <div style={{ 
                          backgroundColor: "#f9f9f9", 
                          padding: "12px", 
                          borderRadius: "6px",
                          margin: "10px 0"
                        }}>
                          <p style={{ margin: "0 0 5px" }}>{comment.text}</p>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <p style={{ margin: "10px 0 0", fontSize: "0.85rem", color: "#757575" }}>
                              <strong>By:</strong> {comment.user.name || comment.user.email || "Unknown User"}
                            </p>
                            <p style={{ margin: "5px 0 0", fontSize: "0.85rem", color: "#757575" }}>
                              <strong>Date:</strong> {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleCommentStatus(comment._id, false)}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#f44336",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              fontSize: "0.9rem"
                            }}
                          >
                            <FaTimes />
                            Disapprove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div style={{ backgroundColor: "var(--light-bg)", minHeight: "100vh" }}>
      <NavigationBar />
      
      <div className="container" style={{ padding: "60px 0" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "30px" 
        }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2.5rem",
            fontWeight: "500",
            color: "var(--primary-color)",
            margin: 0
          }}>
            Product Manager Dashboard
          </h1>
          
          {activeTab === "books" && (
            <button
              onClick={handleAddBook}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                backgroundColor: "var(--primary-color)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "0.9rem"
              }}
            >
              <FaPlus size={14} />
              Add New Book
            </button>
          )}
        </div>
        
        {/* Tabs */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid var(--border-color)",
          marginBottom: "30px"
        }}>
          <button
            onClick={() => setActiveTab("books")}
            style={{
              padding: "12px 20px",
              backgroundColor: activeTab === "books" ? "white" : "transparent",
              border: activeTab === "books" ? "1px solid var(--border-color)" : "none",
              borderBottom: activeTab === "books" ? "1px solid white" : "none",
              borderRadius: activeTab === "books" ? "4px 4px 0 0" : "0",
              marginBottom: activeTab === "books" ? "-1px" : "0",
              cursor: "pointer",
              fontWeight: activeTab === "books" ? "500" : "400",
              color: activeTab === "books" ? "var(--primary-color)" : "var(--text-color)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <FaBook size={14} />
            Books
          </button>
          
          <button
            onClick={() => setActiveTab("categories")}
            style={{
              padding: "12px 20px",
              backgroundColor: activeTab === "categories" ? "white" : "transparent",
              border: activeTab === "categories" ? "1px solid var(--border-color)" : "none",
              borderBottom: activeTab === "categories" ? "1px solid white" : "none",
              borderRadius: activeTab === "categories" ? "4px 4px 0 0" : "0",
              marginBottom: activeTab === "categories" ? "-1px" : "0",
              cursor: "pointer",
              fontWeight: activeTab === "categories" ? "500" : "400",
              color: activeTab === "categories" ? "var(--primary-color)" : "var(--text-color)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <FaTags size={14} />
            Categories
          </button>
          
          <button
            onClick={() => setActiveTab("stock")}
            style={{
              padding: "12px 20px",
              backgroundColor: activeTab === "stock" ? "white" : "transparent",
              border: activeTab === "stock" ? "1px solid var(--border-color)" : "none",
              borderBottom: activeTab === "stock" ? "1px solid white" : "none",
              borderRadius: activeTab === "stock" ? "4px 4px 0 0" : "0",
              marginBottom: activeTab === "stock" ? "-1px" : "0",
              cursor: "pointer",
              fontWeight: activeTab === "stock" ? "500" : "400",
              color: activeTab === "stock" ? "var(--primary-color)" : "var(--text-color)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <FaBoxes size={14} />
            Stock
          </button>
          
          <button
            onClick={() => setActiveTab("delivery")}
            style={{
              padding: "12px 20px",
              backgroundColor: activeTab === "delivery" ? "white" : "transparent",
              border: activeTab === "delivery" ? "1px solid var(--border-color)" : "none",
              borderBottom: activeTab === "delivery" ? "1px solid white" : "none",
              borderRadius: activeTab === "delivery" ? "4px 4px 0 0" : "0",
              marginBottom: activeTab === "delivery" ? "-1px" : "0",
              cursor: "pointer",
              fontWeight: activeTab === "delivery" ? "500" : "400",
              color: activeTab === "delivery" ? "var(--primary-color)" : "var(--text-color)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <FaTruck size={14} />
            Delivery
          </button>
          
          <button
            onClick={() => setActiveTab("invoice")}
            style={{
              padding: "12px 20px",
              backgroundColor: activeTab === "invoice" ? "white" : "transparent",
              border: activeTab === "invoice" ? "1px solid var(--border-color)" : "none",
              borderBottom: activeTab === "invoice" ? "1px solid white" : "none",
              borderRadius: activeTab === "invoice" ? "4px 4px 0 0" : "0",
              marginBottom: activeTab === "invoice" ? "-1px" : "0",
              cursor: "pointer",
              fontWeight: activeTab === "invoice" ? "500" : "400",
              color: activeTab === "invoice" ? "var(--primary-color)" : "var(--text-color)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <FaFileInvoiceDollar size={14} />
            Invoice
          </button>
          
          <button
            onClick={() => setActiveTab("comments")}
            style={{
              padding: "12px 20px",
              backgroundColor: activeTab === "comments" ? "white" : "transparent",
              border: activeTab === "comments" ? "1px solid var(--border-color)" : "none",
              borderBottom: activeTab === "comments" ? "1px solid white" : "none",
              borderRadius: activeTab === "comments" ? "4px 4px 0 0" : "0",
              marginBottom: activeTab === "comments" ? "-1px" : "0",
              cursor: "pointer",
              fontWeight: activeTab === "comments" ? "500" : "400",
              color: activeTab === "comments" ? "var(--primary-color)" : "var(--text-color)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <FaComments size={14} />
            Comments
          </button>
        </div>
        
        {/* Tab content */}
        {renderTabContent()}
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductManagerDashboard; 