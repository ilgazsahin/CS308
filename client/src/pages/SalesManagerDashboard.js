import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";
import { FaShoppingBag, FaExclamationTriangle, FaChartBar, FaSearch, FaBook, FaPercent, FaTags, FaMoneyBillWave, FaUsers, FaFileInvoiceDollar, FaCalendarAlt } from "react-icons/fa";
import axios from "axios";

const SalesManagerDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookSearch, setBookSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState('books');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    pendingOrders: 0
  });
  
  // Add a state for new prices - store as an object with book IDs as keys
  const [newPrices, setNewPrices] = useState({});
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [discountRate, setDiscountRate] = useState(10);
  const [sendNotifications, setSendNotifications] = useState(true);
  
  // Add state for date range filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
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
          // User is authorized, fetch data
          fetchOrders();
          fetchBooks();
          fetchCategories();
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
      
      // Sort orders by date, newest first
      const sortedOrders = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
      
      // Calculate statistics
      const totalOrders = sortedOrders.length;
      const totalSales = sortedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const pendingOrders = sortedOrders.filter(order => 
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

  const fetchBooks = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/books");
      setBooks(response.data);
      setFilteredBooks(response.data);
      
      // Initialize new prices with current prices
      const priceObj = {};
      response.data.forEach(book => {
        priceObj[book._id] = book.price || '';
      });
      setNewPrices(priceObj);
    } catch (error) {
      console.error("Error fetching books:", error);
      setError("Failed to load books. Please try again later.");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
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

  // Handle price input change
  const handlePriceChange = (bookId, value) => {
    setNewPrices({
      ...newPrices,
      [bookId]: value === '' ? '' : parseFloat(value)
    });
  };

  useEffect(() => {
    if (books.length > 0) {
      let filtered = [...books];
      
      // Apply category filter
      if (selectedCategory) {
        filtered = filtered.filter(book => book.category && book.category._id === selectedCategory);
      }
      
      // Apply search filter
      if (bookSearch) {
        const searchTerm = bookSearch.toLowerCase();
        filtered = filtered.filter(book => 
          book.title.toLowerCase().includes(searchTerm) || 
          book.author.toLowerCase().includes(searchTerm)
        );
      }
      
      setFilteredBooks(filtered);
    }
  }, [books, selectedCategory, bookSearch]);

  // Handle book selection for discount
  const handleSelectBook = (bookId) => {
    if (selectedBooks.includes(bookId)) {
      setSelectedBooks(selectedBooks.filter(id => id !== bookId));
    } else {
      setSelectedBooks([...selectedBooks, bookId]);
    }
  };

  // Handle select all books for discount
  const handleSelectAllBooks = () => {
    if (selectedBooks.length === filteredBooks.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(filteredBooks.map(book => book._id));
    }
  };

  // Handle updating the price of a book
  const handleUpdatePrice = async (bookId, newPrice) => {
    try {
      await axios.put(`http://localhost:3001/api/books/${bookId}`, { price: newPrice });
      
      // Update the book price in local state
      setBooks(books.map(book => 
        book._id === bookId ? { ...book, price: newPrice } : book
      ));
      
      // Show success message
      alert("Price updated successfully!");
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Failed to update price. Please try again.");
    }
  };

  // Check if price is changed for a book
  const isPriceChanged = (bookId, currentPrice) => {
    return newPrices[bookId] !== undefined && newPrices[bookId] !== currentPrice;
  };

  // Handle applying discount to selected books
  const handleApplyDiscount = async () => {
    if (selectedBooks.length === 0) {
      alert("Please select at least one book to apply the discount.");
      return;
    }

    // Validate that we have a valid discount rate
    if (!discountRate || discountRate <= 0 || discountRate >= 100) {
      alert("Please enter a valid discount rate between 1 and 99.");
      return;
    }

    try {
      // Show loading state or disable button while processing
      setLoading(true);
      
      console.log("Applying discount to books:", selectedBooks);
      console.log("Discount rate:", discountRate);
      console.log("Send notifications:", sendNotifications);
      
      // Verify selected books still exist and have prices
      const validBooks = selectedBooks.filter(bookId => {
        const book = books.find(b => b._id === bookId);
        return book && book.price;
      });
      
      if (validBooks.length === 0) {
        alert("None of the selected books have prices set. Please select books with prices.");
        setLoading(false);
        return;
      }
      
      if (validBooks.length < selectedBooks.length) {
        const difference = selectedBooks.length - validBooks.length;
        console.warn(`${difference} selected books were filtered out because they don't have prices.`);
      }
      
      // Use POST instead of PUT to avoid route parameter conflicts
      const response = await axios.post(`http://localhost:3001/api/books/apply-discount`, {
        bookIds: validBooks,
        discountRate: parseInt(discountRate, 10),
        sendNotifications
      });
      
      console.log("Discount response:", response.data);
      
      // Refresh books data
      await fetchBooks();
      
      // Reset selection
      setSelectedBooks([]);
      
      // Show success message with information about the operation
      const { updatedBooks, failedBooks, notifiedUsers } = response.data;
      
      let message = `Discount of ${discountRate}% applied successfully to ${updatedBooks.length} books!`;
      
      if (notifiedUsers > 0) {
        message += `\n${notifiedUsers} users have been notified about the discount.`;
      }
      
      if (failedBooks && failedBooks.length > 0) {
        message += `\nFailed to apply discount to ${failedBooks.length} books.`;
      }
      
      alert(message);
    } catch (error) {
      console.error("Error applying discount:", error);
      let errorMessage = "Failed to apply discount. Please try again.";
      
      // Try to extract specific error information from the response
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage += " " + error.response.data.message;
        }
        if (error.response.data.error) {
          errorMessage += " Details: " + error.response.data.error;
        }
      } else if (error.message) {
        errorMessage += " " + error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add function to filter orders by date range
  const handleFilterOrdersByDate = () => {
    if (!startDate && !endDate) {
      setFilteredOrders(orders);
      return;
    }
    
    let filtered = [...orders];
    
    if (startDate) {
      const startDateObj = new Date(startDate);
      filtered = filtered.filter(order => new Date(order.createdAt) >= startDateObj);
    }
    
    if (endDate) {
      const endDateObj = new Date(endDate);
      // Set time to end of day
      endDateObj.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => new Date(order.createdAt) <= endDateObj);
    }
    
    setFilteredOrders(filtered);
  };
  
  // Reset date filters
  const handleResetDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilteredOrders(orders);
  };
  
  // Apply date filter when dates change
  useEffect(() => {
    handleFilterOrdersByDate();
  }, [startDate, endDate, orders]);

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

        {/* Dashboard Tabs */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ 
            display: "flex", 
            borderBottom: "1px solid var(--border-color)",
            overflow: "auto",
            whiteSpace: "nowrap"
          }}>
            <button
              onClick={() => setActiveTab("books")}
              style={{
                padding: "15px 25px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === "books" ? "3px solid var(--primary-color)" : "3px solid transparent",
                color: activeTab === "books" ? "var(--primary-color)" : "var(--light-text)",
                fontWeight: activeTab === "books" ? "600" : "400",
                cursor: "pointer",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <FaBook />
              Manage Book Prices
            </button>
            <button
              onClick={() => setActiveTab("discounts")}
              style={{
                padding: "15px 25px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === "discounts" ? "3px solid var(--primary-color)" : "3px solid transparent",
                color: activeTab === "discounts" ? "var(--primary-color)" : "var(--light-text)",
                fontWeight: activeTab === "discounts" ? "600" : "400",
                cursor: "pointer",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <FaPercent />
              Apply Discounts
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              style={{
                padding: "15px 25px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === "orders" ? "3px solid var(--primary-color)" : "3px solid transparent",
                color: activeTab === "orders" ? "var(--primary-color)" : "var(--light-text)",
                fontWeight: activeTab === "orders" ? "600" : "400",
                cursor: "pointer",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <FaFileInvoiceDollar />
              View Invoices
            </button>
          </div>
        </div>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <p>Loading data...</p>
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
        ) : activeTab === "books" ? (
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
              Manage Book Prices
            </h2>
            
            {/* Search and Filter */}
            <div style={{ 
              display: "flex", 
              gap: "15px", 
              marginBottom: "20px",
              flexWrap: "wrap" 
            }}>
              <div style={{ flex: "1" }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "0 10px" 
                }}>
                  <FaSearch style={{ color: "var(--light-text)" }} />
                  <input 
                    type="text"
                    placeholder="Search books..."
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    style={{
                      border: "none",
                      padding: "10px",
                      width: "100%",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    minWidth: "150px"
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Books Table */}
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
                    <th style={{ padding: "15px", textAlign: "right", fontWeight: "500" }}>Current Price</th>
                    <th style={{ padding: "15px", textAlign: "center", fontWeight: "500" }}>New Price</th>
                    <th style={{ padding: "15px", textAlign: "center", fontWeight: "500" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book._id} style={{
                      borderBottom: "1px solid var(--border-color)"
                    }}>
                      <td style={{ padding: "15px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                          <img 
                            src={book.image} 
                            alt={book.title}
                            style={{ width: "40px", height: "60px", objectFit: "cover" }}
                          />
                          <span>{book.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: "15px" }}>{book.author}</td>
                      <td style={{ padding: "15px" }}>{book.category?.name || "Uncategorized"}</td>
                      <td style={{ padding: "15px", textAlign: "right", fontWeight: "500" }}>
                        {book.price ? `$${book.price.toFixed(2)}` : "Not set"}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newPrices[book._id]}
                          onChange={(e) => handlePriceChange(book._id, e.target.value)}
                          style={{
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            width: "80px",
                            textAlign: "center"
                          }}
                        />
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <button
                          onClick={() => handleUpdatePrice(book._id, newPrices[book._id])}
                          disabled={!isPriceChanged(book._id, book.price)}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "var(--primary-color)",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: !isPriceChanged(book._id, book.price) ? "default" : "pointer",
                            opacity: !isPriceChanged(book._id, book.price) ? "0.6" : "1",
                            fontSize: "0.9rem"
                          }}
                        >
                          Update Price
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "discounts" ? (
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
              <FaPercent style={{ marginRight: "10px" }} />
              Apply Discounts
            </h2>
            
            {/* Search and Filter */}
            <div style={{ 
              display: "flex", 
              gap: "15px", 
              marginBottom: "20px",
              flexWrap: "wrap" 
            }}>
              <div style={{ flex: "1" }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "0 10px" 
                }}>
                  <FaSearch style={{ color: "var(--light-text)" }} />
                  <input 
                    type="text"
                    placeholder="Search books..."
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    style={{
                      border: "none",
                      padding: "10px",
                      width: "100%",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    minWidth: "150px"
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Discount Controls */}
            <div style={{
              padding: "20px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              marginBottom: "20px"
            }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                    Discount Rate (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(parseInt(e.target.value) || 10)}
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      width: "100px"
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                    Notify Users
                  </label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      id="sendNotifications"
                      checked={sendNotifications}
                      onChange={() => setSendNotifications(!sendNotifications)}
                      style={{ marginRight: "8px" }}
                    />
                    <label htmlFor="sendNotifications">
                      Send email to users with these books in their wishlist
                    </label>
                  </div>
                </div>
                
                <div style={{ marginLeft: "auto" }}>
                  <button
                    onClick={handleApplyDiscount}
                    disabled={selectedBooks.length === 0 || loading}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: selectedBooks.length === 0 || loading ? "default" : "pointer",
                      opacity: selectedBooks.length === 0 || loading ? "0.6" : "1",
                      fontSize: "1rem",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="fa-spin" style={{ display: "inline-block", fontSize: "1rem", animation: "fa-spin 1s infinite linear" }}>↻</span>
                        Applying...
                      </>
                    ) : (
                      <>
                        Apply {discountRate}% Discount
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Books Table */}
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
                    <th style={{ padding: "15px", textAlign: "center", fontWeight: "500", width: "50px" }}>
                      <input
                        type="checkbox"
                        checked={filteredBooks.length > 0 && selectedBooks.length === filteredBooks.length}
                        onChange={handleSelectAllBooks}
                      />
                    </th>
                    <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Book</th>
                    <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Author</th>
                    <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Category</th>
                    <th style={{ padding: "15px", textAlign: "right", fontWeight: "500" }}>Current Price</th>
                    <th style={{ padding: "15px", textAlign: "right", fontWeight: "500" }}>After Discount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.filter(book => book.price !== null && book.price !== undefined).map((book) => (
                    <tr key={book._id} style={{
                      borderBottom: "1px solid var(--border-color)",
                      backgroundColor: selectedBooks.includes(book._id) ? "rgba(33, 150, 243, 0.05)" : "transparent"
                    }}>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={selectedBooks.includes(book._id)}
                          onChange={() => handleSelectBook(book._id)}
                        />
                      </td>
                      <td style={{ padding: "15px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                          <img 
                            src={book.image} 
                            alt={book.title}
                            style={{ width: "40px", height: "60px", objectFit: "cover" }}
                          />
                          <span>{book.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: "15px" }}>{book.author}</td>
                      <td style={{ padding: "15px" }}>{book.category?.name || "Uncategorized"}</td>
                      <td style={{ padding: "15px", textAlign: "right", fontWeight: "500" }}>
                        {book.price ? `$${book.price.toFixed(2)}` : "Not set"}
                      </td>
                      <td style={{ padding: "15px", textAlign: "right", fontWeight: "500", color: "#4caf50" }}>
                        {book.price ? 
                          `$${(book.price - (book.price * discountRate / 100)).toFixed(2)}` : 
                          "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredBooks.filter(book => book.price !== null && book.price !== undefined).length === 0 && (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <p>No books with prices available to discount.</p>
                </div>
              )}
            </div>
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
              <FaFileInvoiceDollar style={{ marginRight: "10px" }} />
              Invoices
            </h2>
            
            {/* Date Range Filter */}
            <div style={{ 
              display: "flex", 
              gap: "15px", 
              marginBottom: "20px",
              flexWrap: "wrap",
              alignItems: "flex-end"
            }}>
              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "0.9rem", 
                  color: "#757575" 
                }}>
                  Start Date
                </label>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "0 10px" 
                }}>
                  <FaCalendarAlt style={{ color: "var(--light-text)" }} />
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      border: "none",
                      padding: "10px",
                      width: "150px",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "0.9rem", 
                  color: "#757575" 
                }}>
                  End Date
                </label>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "0 10px" 
                }}>
                  <FaCalendarAlt style={{ color: "var(--light-text)" }} />
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      border: "none",
                      padding: "10px",
                      width: "150px",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
              
              <button
                onClick={handleResetDateFilter}
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#f5f5f5",
                  color: "#757575",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                Reset Filters
              </button>
            </div>
            
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#757575" }}>
                No invoices found for the selected date range.
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
                    {/* Invoice Header */}
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
                          Invoice #{order._id.substring(order._id.length - 6)}
                        </h3>
                        <p style={{ margin: "5px 0 0", fontSize: "0.9rem", color: "#757575" }}>
                          {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
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
                        <div>
                          <p style={{ margin: "0", fontSize: "1.1rem", fontWeight: "700" }}>
                            Total: ${order.total.toFixed(2)}
                          </p>
                          <p style={{ margin: "5px 0 0", fontSize: "0.8rem", color: "#757575", textAlign: "right" }}>
                            {order.items?.length || 0} {order.items?.length === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default SalesManagerDashboard; 