import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";
import { FaShoppingBag, FaExclamationTriangle, FaChartBar, FaSearch, FaBook, FaPercent, FaTags, FaMoneyBillWave, FaUsers, FaFileInvoiceDollar, FaCalendarAlt, FaPrint, FaChartLine, FaUndo, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  
  // Add state for analytics
  const [analyticsStartDate, setAnalyticsStartDate] = useState('');
  const [analyticsEndDate, setAnalyticsEndDate] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [analyticsView, setAnalyticsView] = useState('line'); // 'line', 'bar'
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // Add states for refund management
  const [refundRequests, setRefundRequests] = useState([]);
  const [refundAmounts, setRefundAmounts] = useState({});
  const [refundNotes, setRefundNotes] = useState({});
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundSearch, setRefundSearch] = useState('');
  const [filteredRefundRequests, setFilteredRefundRequests] = useState([]);
  
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

  // Function to calculate analytics data
  const calculateAnalytics = () => {
    if (!analyticsStartDate || !analyticsEndDate) {
      alert("Please select both start and end dates");
      return;
    }
    
    setAnalyticsLoading(true);
    
    const startDateObj = new Date(analyticsStartDate);
    const endDateObj = new Date(analyticsEndDate);
    endDateObj.setHours(23, 59, 59, 999); // Set to end of day
    
    // Filter orders within the date range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDateObj && orderDate <= endDateObj;
    });
    
    if (filteredOrders.length === 0) {
      setAnalyticsData({
        labels: [],
        revenueData: [],
        costData: [],
        profitData: [],
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0
      });
      setAnalyticsLoading(false);
      return;
    }
    
    // Group orders by period (day, week, month)
    const groupedOrders = {};
    const labels = [];
    
    // Sort orders by date
    filteredOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Group orders by period
    filteredOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      let periodKey = '';
      
      if (analyticsPeriod === 'daily') {
        // Format: "MMM DD, YYYY"
        periodKey = orderDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      } else if (analyticsPeriod === 'weekly') {
        // Get the first day of the week (Sunday)
        const weekStart = new Date(orderDate);
        weekStart.setDate(orderDate.getDate() - orderDate.getDay());
        periodKey = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`;
      } else if (analyticsPeriod === 'monthly') {
        // Format: "MMM YYYY"
        periodKey = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      
      if (!groupedOrders[periodKey]) {
        groupedOrders[periodKey] = [];
        labels.push(periodKey);
      }
      
      groupedOrders[periodKey].push(order);
    });
    
    // Calculate revenue, cost, and profit for each period
    const revenueData = [];
    const costData = [];
    const profitData = [];
    
    labels.forEach(label => {
      const periodOrders = groupedOrders[label];
      
      // Calculate revenue for the period
      const revenue = periodOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      // Calculate cost (50% of the revenue as per requirement)
      const cost = revenue * 0.5;
      
      // Calculate profit
      const profit = revenue - cost;
      
      revenueData.push(revenue);
      costData.push(cost);
      profitData.push(profit);
    });
    
    // Calculate totals
    const totalRevenue = revenueData.reduce((sum, value) => sum + value, 0);
    const totalCost = costData.reduce((sum, value) => sum + value, 0);
    const totalProfit = profitData.reduce((sum, value) => sum + value, 0);
    
    setAnalyticsData({
      labels,
      revenueData,
      costData,
      profitData,
      totalRevenue,
      totalCost,
      totalProfit
    });
    
    setAnalyticsLoading(false);
  };
  
  // Reset analytics data
  const resetAnalytics = () => {
    setAnalyticsStartDate('');
    setAnalyticsEndDate('');
    setAnalyticsData(null);
  };
  
  // Function to print an invoice
  const printInvoice = (order) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // Generate the invoice HTML
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order._id.substring(order._id.length - 6)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .invoice-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .invoice-header h1 {
            font-size: 28px;
            color: #5d4037;
            margin: 0 0 10px 0;
          }
          .invoice-title {
            text-align: center;
            margin: 20px 0;
          }
          .invoice-title h2 {
            margin: 0;
            font-size: 24px;
          }
          .customer-info {
            display: flex;
            flex-wrap: wrap;
            margin: 20px 0;
            padding: 20px 0;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
          }
          .customer-section {
            flex: 1;
            min-width: 250px;
            margin-bottom: 20px;
          }
          .customer-section h4 {
            color: #5d4037;
            margin: 0 0 10px 0;
            font-size: 16px;
          }
          .customer-section p {
            margin: 5px 0;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .items-table th {
            text-align: left;
            padding: 10px;
            border-bottom: 2px solid #eee;
          }
          .items-table td {
            padding: 10px;
            border-bottom: 1px solid #eee;
          }
          .items-table th:last-child,
          .items-table td:last-child {
            text-align: right;
          }
          .items-table th:nth-child(2),
          .items-table td:nth-child(2) {
            text-align: center;
          }
          .items-table th:nth-child(3),
          .items-table td:nth-child(3) {
            text-align: right;
          }
          .summary {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
          .summary-table {
            width: 300px;
          }
          .summary-table td {
            padding: 5px 0;
          }
          .summary-table td:first-child {
            text-align: left;
          }
          .summary-table td:last-child {
            text-align: right;
          }
          .summary-table tr.total {
            font-weight: bold;
            font-size: 18px;
            border-top: 1px solid #eee;
          }
          .summary-table tr.total td {
            padding-top: 10px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 14px;
            color: #757575;
          }
          .footer p {
            margin: 5px 0;
          }
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <h1>BookStore</h1>
          <p>123 Book Street, Reading City</p>
          <p>Email: info@bookstore.com</p>
          <p>Phone: (123) 456-7890</p>
        </div>
        
        <div class="invoice-title">
          <h2>INVOICE</h2>
          <p>#${order._id.substring(order._id.length - 6)}</p>
          <p>${new Date(order.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric'
            })}</p>
        </div>
        
        <div class="customer-info">
          <div class="customer-section">
            <h4>Customer Information</h4>
            <p><strong>${order.shippingInfo?.name || "N/A"}</strong></p>
            <p>${order.shippingInfo?.email || "No email provided"}</p>
            <p>${order.shippingInfo?.phone || "No phone provided"}</p>
          </div>
          <div class="customer-section">
            <h4>Shipping Address</h4>
            <p><strong>${order.shippingInfo?.address || "No address provided"}</strong></p>
            <p>${order.shippingInfo?.city || ""}${order.shippingInfo?.city && order.shippingInfo?.state ? ", " : ""}${order.shippingInfo?.state || ""} ${order.shippingInfo?.zip || ""}</p>
            <p>${order.shippingInfo?.country || ""}</p>
          </div>
        </div>
        
        <h4>Order Items</h4>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items && order.items.map(item => `
              <tr>
                <td>
                  <div><strong>${item.title}</strong></div>
                  <div style="color: #757575; font-size: 0.9em;">${item.author || "Unknown Author"}</div>
                </td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <table class="summary-table">
            <tr>
              <td>Subtotal:</td>
              <td>$${order.total.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Shipping:</td>
              <td>$0.00</td>
            </tr>
            <tr class="total">
              <td>Total:</td>
              <td>$${order.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>For any questions regarding this invoice, please contact support@bookstore.com</p>
        </div>
        
        <script>
          // Auto print when loaded
          window.onload = function() {
            window.print();
            // Close the window after printing (but only if not canceled)
            setTimeout(function() {
              if (!window.document.execCommand) {
                window.close();
              }
            }, 1000);
          };
        </script>
      </body>
      </html>
    `;
    
    // Write the HTML to the new window
    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  // Fetch all orders with refund-requested status
  const fetchRefundRequests = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/orders");
      
      // Filter orders with 'refund-requested' status
      const refundReqs = response.data.filter(order => 
        order.status.toLowerCase() === 'refund-requested'
      );
      
      // Sort by date, newest first
      refundReqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log("Refund requests:", refundReqs);
      setRefundRequests(refundReqs);
      setFilteredRefundRequests(refundReqs);
      
      // Initialize refundAmounts with default values (full refund)
      const amounts = {};
      refundReqs.forEach(order => {
        amounts[order._id] = order.total;
      });
      setRefundAmounts(amounts);
      
      // Initialize refundNotes
      const notes = {};
      refundReqs.forEach(order => {
        notes[order._id] = '';
      });
      setRefundNotes(notes);
      
    } catch (error) {
      console.error("Error fetching refund requests:", error);
      setError("Failed to load refund requests. Please try again later.");
    }
  };

  // Process a refund (approve or reject)
  const handleProcessRefund = async (orderId, approved) => {
    try {
      setProcessingRefund(true);
      
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      
      console.log("Processing refund:", {
        orderId,
        approved,
        processorId: userId,
        notes: refundNotes[orderId],
        refundAmount: approved ? refundAmounts[orderId] : 0
      });
      
      const response = await axios.patch(`http://localhost:3001/api/orders/${orderId}/process-refund`, {
        approved,
        processorId: userId,
        notes: refundNotes[orderId],
        refundAmount: approved ? refundAmounts[orderId] : 0
      });
      
      console.log("Refund processed:", response.data);
      
      // Remove the processed refund request from the list
      setRefundRequests(refundRequests.filter(req => req._id !== orderId));
      setFilteredRefundRequests(filteredRefundRequests.filter(req => req._id !== orderId));
      
      // Show success message
      alert(approved ? "Refund approved successfully!" : "Refund request rejected.");
      
      // Refresh orders list
      fetchOrders();
      
    } catch (error) {
      console.error("Error processing refund:", error);
      let errorMessage = "Failed to process refund. Please try again.";
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setProcessingRefund(false);
    }
  };

  // Handle refund amount change
  const handleRefundAmountChange = (orderId, value) => {
    const numValue = parseFloat(value);
    const order = refundRequests.find(req => req._id === orderId);
    
    if (order && numValue > order.total) {
      alert(`Refund amount cannot exceed the order total ($${order.total.toFixed(2)})`);
      setRefundAmounts({...refundAmounts, [orderId]: order.total});
      return;
    }
    
    if (numValue < 0) {
      alert("Refund amount cannot be negative");
      setRefundAmounts({...refundAmounts, [orderId]: 0});
      return;
    }
    
    setRefundAmounts({...refundAmounts, [orderId]: numValue || 0});
  };

  // Handle refund notes change
  const handleRefundNotesChange = (orderId, value) => {
    setRefundNotes({...refundNotes, [orderId]: value});
  };

  // Handle refund search
  const handleRefundSearch = (value) => {
    setRefundSearch(value);
    
    if (!value.trim()) {
      setFilteredRefundRequests(refundRequests);
      return;
    }
    
    const searchTerm = value.toLowerCase();
    const filtered = refundRequests.filter(order => 
      (order.orderId && order.orderId.toString().includes(searchTerm)) ||
      (order._id && order._id.toString().includes(searchTerm)) ||
      (order.shippingInfo && order.shippingInfo.name && order.shippingInfo.name.toLowerCase().includes(searchTerm)) ||
      (order.shippingInfo && order.shippingInfo.email && order.shippingInfo.email.toLowerCase().includes(searchTerm))
    );
    
    setFilteredRefundRequests(filtered);
  };

  // Fetch refund requests when activeTab changes to 'refunds'
  useEffect(() => {
    if (activeTab === 'refunds') {
      fetchRefundRequests();
    }
  }, [activeTab]);

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <NavigationBar />
      
      <div className="container" style={{ padding: "40px 0" }}>
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ 
            fontFamily: "'Playfair Display', serif",
            fontSize: "2.5rem",
            color: "var(--primary-color)",
            marginBottom: "10px"
          }}>
            Sales Manager Dashboard
          </h1>
          <p style={{ color: "var(--light-text)", fontSize: "1.1rem" }}>
            Manage your store's pricing, discounts, and refunds
          </p>
        </div>
        
        {/* Dashboard Stats */}
        <div style={{ 
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "40px" 
        }}>
          <div style={{
            flex: "1 1 200px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
              <FaMoneyBillWave style={{ color: "#4caf50", fontSize: "24px", marginRight: "10px" }} />
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "500" }}>Total Sales</h3>
            </div>
            <p style={{ fontSize: "1.8rem", fontWeight: "700", margin: 0, color: "var(--primary-color)" }}>
              ${stats.totalSales.toFixed(2)}
            </p>
          </div>
          
          <div style={{
            flex: "1 1 200px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
              <FaShoppingBag style={{ color: "#2196f3", fontSize: "24px", marginRight: "10px" }} />
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "500" }}>Total Orders</h3>
            </div>
            <p style={{ fontSize: "1.8rem", fontWeight: "700", margin: 0, color: "var(--primary-color)" }}>
              {stats.totalOrders}
            </p>
          </div>
          
          <div style={{
            flex: "1 1 200px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
              <FaFileInvoiceDollar style={{ color: "#9c27b0", fontSize: "24px", marginRight: "10px" }} />
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "500" }}>Average Order Value</h3>
            </div>
            <p style={{ fontSize: "1.8rem", fontWeight: "700", margin: 0, color: "var(--primary-color)" }}>
              ${stats.averageOrderValue.toFixed(2)}
            </p>
          </div>
          
          <div style={{
            flex: "1 1 200px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
              <FaExclamationTriangle style={{ color: "#ff9800", fontSize: "24px", marginRight: "10px" }} />
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "500" }}>Pending Orders</h3>
            </div>
            <p style={{ fontSize: "1.8rem", fontWeight: "700", margin: 0, color: "var(--primary-color)" }}>
              {stats.pendingOrders}
            </p>
          </div>
        </div>
        
        {/* Dashboard Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", marginBottom: "30px" }}>
          <div 
            onClick={() => setActiveTab("books")} 
            style={{
              padding: "15px 20px",
              cursor: "pointer",
              borderBottom: activeTab === "books" ? "3px solid var(--primary-color)" : "3px solid transparent",
              color: activeTab === "books" ? "var(--primary-color)" : "var(--light-text)",
              fontWeight: activeTab === "books" ? "600" : "400",
              display: "flex",
              alignItems: "center"
            }}
          >
            <FaBook style={{ marginRight: "8px" }} />
            Price Management
          </div>
          
          <div 
            onClick={() => setActiveTab("discounts")} 
            style={{
              padding: "15px 20px",
              cursor: "pointer",
              borderBottom: activeTab === "discounts" ? "3px solid var(--primary-color)" : "3px solid transparent",
              color: activeTab === "discounts" ? "var(--primary-color)" : "var(--light-text)",
              fontWeight: activeTab === "discounts" ? "600" : "400",
              display: "flex",
              alignItems: "center"
            }}
          >
            <FaPercent style={{ marginRight: "8px" }} />
            Discounts
          </div>
          
          <div 
            onClick={() => setActiveTab("orders")} 
            style={{
              padding: "15px 20px",
              cursor: "pointer",
              borderBottom: activeTab === "orders" ? "3px solid var(--primary-color)" : "3px solid transparent",
              color: activeTab === "orders" ? "var(--primary-color)" : "var(--light-text)",
              fontWeight: activeTab === "orders" ? "600" : "400",
              display: "flex",
              alignItems: "center"
            }}
          >
            <FaFileInvoiceDollar style={{ marginRight: "8px" }} />
            View Invoices
          </div>
          
          <div 
            onClick={() => setActiveTab("refunds")} 
            style={{
              padding: "15px 20px",
              cursor: "pointer",
              borderBottom: activeTab === "refunds" ? "3px solid var(--primary-color)" : "3px solid transparent",
              color: activeTab === "refunds" ? "var(--primary-color)" : "var(--light-text)",
              fontWeight: activeTab === "refunds" ? "600" : "400",
              display: "flex",
              alignItems: "center"
            }}
          >
            <FaUndo style={{ marginRight: "8px" }} />
            Refund Requests
          </div>
          
          <div 
            onClick={() => setActiveTab("analytics")} 
            style={{
              padding: "15px 20px",
              cursor: "pointer",
              borderBottom: activeTab === "analytics" ? "3px solid var(--primary-color)" : "3px solid transparent",
              color: activeTab === "analytics" ? "var(--primary-color)" : "var(--light-text)",
              fontWeight: activeTab === "analytics" ? "600" : "400",
              display: "flex",
              alignItems: "center"
            }}
          >
            <FaChartBar style={{ marginRight: "8px" }} />
            Sales Analytics
          </div>
        </div>
        
        {loading ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <p>Loading data...</p>
          </div>
        ) : error ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            color: "#f44336"
          }}>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 20px",
                backgroundColor: "var(--primary-color)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "15px"
              }}
            >
              Retry
            </button>
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
        ) : activeTab === "orders" ? (
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
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                        
                        {/* Print Button - Direct approach */}
                        <button
                          type="button"
                          onClick={() => printInvoice(order)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "6px 12px",
                            backgroundColor: "#4caf50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.8rem"
                          }}
                        >
                          <FaPrint size={14} />
                          Print/PDF
                        </button>
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
                          <div 
                            key={index}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "10px 0",
                              borderBottom: index < order.items.length - 1 ? "1px solid #eee" : "none"
                            }}
                          >
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
        ) : activeTab === "refunds" ? (
          <div style={{ 
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            overflow: "hidden" 
          }}>
            <div style={{ padding: "20px" }}>
              <h2 style={{ 
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.8rem",
                color: "var(--primary-color)",
                marginTop: "0",
                marginBottom: "20px"
              }}>
                Manage Refund Requests
              </h2>
              
              <p style={{ color: "var(--light-text)", marginBottom: "20px" }}>
                Review and process customer refund requests. Approve or reject requests and determine refund amounts.
              </p>
              
              {/* Search */}
              <div style={{ 
                display: "flex", 
                alignItems: "center",
                marginBottom: "20px",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                padding: "5px 15px"
              }}>
                <FaSearch style={{ color: "var(--light-text)", marginRight: "10px" }} />
                <input 
                  type="text"
                  placeholder="Search by order ID, customer name or email..."
                  value={refundSearch}
                  onChange={(e) => handleRefundSearch(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    padding: "10px 0",
                    width: "100%",
                    backgroundColor: "transparent"
                  }}
                />
              </div>
              
              {filteredRefundRequests.length === 0 ? (
                <div style={{ 
                  padding: "40px", 
                  textAlign: "center",
                  borderRadius: "4px",
                  backgroundColor: "#f8f9fa",
                  marginBottom: "20px"
                }}>
                  <FaUndo style={{ fontSize: "48px", color: "#bdbdbd", marginBottom: "15px" }} />
                  <h3 style={{ margin: "0 0 10px", fontWeight: "500", color: "var(--primary-color)" }}>
                    No Refund Requests
                  </h3>
                  <p style={{ color: "var(--light-text)" }}>
                    There are currently no pending refund requests to process.
                  </p>
                </div>
              ) : (
                <div>
                  {filteredRefundRequests.map((order) => (
                    <div 
                      key={order._id}
                      style={{ 
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        overflow: "hidden"
                      }}
                    >
                      {/* Order header */}
                      <div style={{ 
                        padding: "15px 20px",
                        backgroundColor: "#fff8e1",
                        borderBottom: "1px solid var(--border-color)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap"
                      }}>
                        <div>
                          <h3 style={{ margin: "0 0 5px", fontWeight: "500" }}>
                            Order #{order.orderId || order._id}
                          </h3>
                          <p style={{ margin: "0", color: "var(--light-text)", fontSize: "0.9rem" }}>
                            Requested on {new Date(order.refundRequest?.requestedAt || order.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ 
                          padding: "8px 15px",
                          backgroundColor: "#ff9800",
                          color: "white",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: "500"
                        }}>
                          Refund Requested
                        </div>
                      </div>
                      
                      {/* Order details */}
                      <div style={{ padding: "20px" }}>
                        {/* Customer info */}
                        <div style={{ marginBottom: "20px" }}>
                          <h4 style={{ margin: "0 0 10px", fontWeight: "500", color: "var(--primary-color)" }}>
                            Customer Information
                          </h4>
                          <p style={{ margin: "0 0 5px" }}>
                            <strong>Name:</strong> {order.shippingInfo?.name || "N/A"}
                          </p>
                          <p style={{ margin: "0 0 5px" }}>
                            <strong>Email:</strong> {order.shippingInfo?.email || "N/A"}
                          </p>
                          <p style={{ margin: "0" }}>
                            <strong>Phone:</strong> {order.shippingInfo?.phone || "N/A"}
                          </p>
                        </div>
                        
                        {/* Order items */}
                        <div style={{ marginBottom: "20px" }}>
                          <h4 style={{ margin: "0 0 10px", fontWeight: "500", color: "var(--primary-color)" }}>
                            Order Items
                          </h4>
                          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                            {order.items.map((item, index) => (
                              <div 
                                key={index}
                                style={{
                                  display: "flex",
                                  padding: "10px 0",
                                  borderBottom: index < order.items.length - 1 ? "1px solid #eee" : "none"
                                }}
                              >
                                <img 
                                  src={item.image}
                                  alt={item.title}
                                  style={{
                                    width: "40px",
                                    height: "60px",
                                    objectFit: "cover",
                                    marginRight: "15px"
                                  }}
                                />
                                <div style={{ flex: 1 }}>
                                  <p style={{ margin: "0 0 5px", fontWeight: "500" }}>
                                    {item.title}
                                  </p>
                                  <p style={{ margin: "0", color: "var(--light-text)", fontSize: "0.9rem" }}>
                                    Qty: {item.quantity} × ${item.price}
                                  </p>
                                </div>
                                <div style={{ fontWeight: "500" }}>
                                  ${(item.quantity * item.price).toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Refund reason */}
                        <div style={{ marginBottom: "20px" }}>
                          <h4 style={{ margin: "0 0 10px", fontWeight: "500", color: "var(--primary-color)" }}>
                            Refund Reason
                          </h4>
                          <div style={{ 
                            padding: "15px",
                            backgroundColor: "#f5f5f5",
                            borderRadius: "4px",
                            fontStyle: "italic",
                            color: "#555"
                          }}>
                            "{order.refundRequest?.reason || "No reason provided"}"
                          </div>
                        </div>
                        
                        {/* Order total */}
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between",
                          padding: "15px 0",
                          borderTop: "1px solid var(--border-color)",
                          marginBottom: "20px"
                        }}>
                          <span style={{ fontWeight: "500", fontSize: "1.1rem" }}>Order Total:</span>
                          <span style={{ fontWeight: "600", fontSize: "1.1rem", color: "var(--primary-color)" }}>
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Refund amount input */}
                        <div style={{ marginBottom: "20px" }}>
                          <h4 style={{ margin: "0 0 10px", fontWeight: "500", color: "var(--primary-color)" }}>
                            Refund Amount
                          </h4>
                          <input 
                            type="number"
                            value={refundAmounts[order._id] || order.total}
                            onChange={(e) => handleRefundAmountChange(order._id, e.target.value)}
                            min="0"
                            max={order.total}
                            step="0.01"
                            style={{
                              width: "100%",
                              padding: "12px 15px",
                              border: "1px solid var(--border-color)",
                              borderRadius: "4px",
                              fontSize: "1rem"
                            }}
                          />
                          <p style={{ margin: "5px 0 0", fontSize: "0.9rem", color: "var(--light-text)" }}>
                            The maximum refund amount is ${order.total.toFixed(2)}
                          </p>
                        </div>
                        
                        {/* Notes input */}
                        <div style={{ marginBottom: "20px" }}>
                          <h4 style={{ margin: "0 0 10px", fontWeight: "500", color: "var(--primary-color)" }}>
                            Processing Notes (Optional)
                          </h4>
                          <textarea 
                            value={refundNotes[order._id] || ''}
                            onChange={(e) => handleRefundNotesChange(order._id, e.target.value)}
                            placeholder="Add notes about this refund (will be visible to the customer)"
                            style={{
                              width: "100%",
                              padding: "12px 15px",
                              border: "1px solid var(--border-color)",
                              borderRadius: "4px",
                              minHeight: "100px",
                              resize: "vertical",
                              fontSize: "1rem"
                            }}
                          />
                        </div>
                        
                        {/* Action buttons */}
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "flex-end",
                          gap: "15px"
                        }}>
                          <button
                            onClick={() => handleProcessRefund(order._id, false)}
                            disabled={processingRefund}
                            style={{
                              padding: "12px 20px",
                              backgroundColor: "#f44336",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: processingRefund ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              opacity: processingRefund ? 0.7 : 1
                            }}
                          >
                            <FaTimesCircle style={{ marginRight: "8px" }} />
                            Reject Refund
                          </button>
                          <button
                            onClick={() => handleProcessRefund(order._id, true)}
                            disabled={processingRefund}
                            style={{
                              padding: "12px 20px",
                              backgroundColor: "#4caf50",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: processingRefund ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              opacity: processingRefund ? 0.7 : 1
                            }}
                          >
                            <FaCheckCircle style={{ marginRight: "8px" }} />
                            Approve Refund
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "analytics" ? (
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
              <FaChartLine style={{ marginRight: "10px" }} />
              Sales Analytics
            </h2>
            
            {/* Analytics Controls */}
            <div style={{ 
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "30px"
            }}>
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
                    padding: "0 10px",
                    backgroundColor: "white"
                  }}>
                    <FaCalendarAlt style={{ color: "var(--light-text)" }} />
                    <input 
                      type="date"
                      value={analyticsStartDate}
                      onChange={(e) => setAnalyticsStartDate(e.target.value)}
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
                    padding: "0 10px",
                    backgroundColor: "white"
                  }}>
                    <FaCalendarAlt style={{ color: "var(--light-text)" }} />
                    <input 
                      type="date"
                      value={analyticsEndDate}
                      onChange={(e) => setAnalyticsEndDate(e.target.value)}
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
                    Group By
                  </label>
                  <select
                    value={analyticsPeriod}
                    onChange={(e) => setAnalyticsPeriod(e.target.value)}
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      minWidth: "120px",
                      backgroundColor: "white"
                    }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontSize: "0.9rem", 
                    color: "#757575" 
                  }}>
                    Chart Type
                  </label>
                  <select
                    value={analyticsView}
                    onChange={(e) => setAnalyticsView(e.target.value)}
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      minWidth: "120px",
                      backgroundColor: "white"
                    }}
                  >
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                  </select>
                </div>
                
                <div style={{ marginLeft: "auto" }}>
                  <button
                    onClick={calculateAnalytics}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <FaChartBar />
                    Generate Report
                  </button>
                  
                  <button
                    onClick={resetAnalytics}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#f5f5f5",
                      color: "#757575",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      marginTop: "10px",
                      width: "100%"
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
              
              <div style={{ fontSize: "0.9rem", color: "#757575" }}>
                <p><strong>Note:</strong> Product cost is calculated as 50% of the sale price for this analysis.</p>
              </div>
            </div>
            
            {/* Analytics Results */}
            {analyticsLoading ? (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <p>Generating analytics...</p>
              </div>
            ) : analyticsData ? (
              <div>
                {/* Summary Cards */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: "20px",
                  marginBottom: "30px"
                }}>
                  <div style={{
                    backgroundColor: "#e3f2fd",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)"
                  }}>
                    <h3 style={{ fontSize: "1rem", color: "#0d47a1", margin: "0 0 10px 0" }}>
                      Total Revenue
                    </h3>
                    <p style={{ fontSize: "1.8rem", fontWeight: "500", margin: 0, color: "#0d47a1" }}>
                      ${analyticsData.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  
                  <div style={{
                    backgroundColor: "#ffebee",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)"
                  }}>
                    <h3 style={{ fontSize: "1rem", color: "#c62828", margin: "0 0 10px 0" }}>
                      Total Cost
                    </h3>
                    <p style={{ fontSize: "1.8rem", fontWeight: "500", margin: 0, color: "#c62828" }}>
                      ${analyticsData.totalCost.toFixed(2)}
                    </p>
                  </div>
                  
                  <div style={{
                    backgroundColor: "#e8f5e9",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)"
                  }}>
                    <h3 style={{ fontSize: "1rem", color: "#2e7d32", margin: "0 0 10px 0" }}>
                      Total Profit
                    </h3>
                    <p style={{ fontSize: "1.8rem", fontWeight: "500", margin: 0, color: "#2e7d32" }}>
                      ${analyticsData.totalProfit.toFixed(2)}
                    </p>
                  </div>
                  
                  <div style={{
                    backgroundColor: "#f3e5f5",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)"
                  }}>
                    <h3 style={{ fontSize: "1rem", color: "#6a1b9a", margin: "0 0 10px 0" }}>
                      Profit Margin
                    </h3>
                    <p style={{ fontSize: "1.8rem", fontWeight: "500", margin: 0, color: "#6a1b9a" }}>
                      {analyticsData.totalRevenue ? (analyticsData.totalProfit / analyticsData.totalRevenue * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
                
                {/* Chart */}
                <div style={{ 
                  backgroundColor: "white", 
                  borderRadius: "8px",
                  border: "1px solid #eee",
                  padding: "20px",
                  height: "400px",
                  marginBottom: "30px"
                }}>
                  {analyticsData.labels.length > 0 ? (
                    analyticsView === 'line' ? (
                      <Line
                        data={{
                          labels: analyticsData.labels,
                          datasets: [
                            {
                              label: 'Revenue',
                              data: analyticsData.revenueData,
                              borderColor: '#2196f3',
                              backgroundColor: 'rgba(33, 150, 243, 0.1)',
                              tension: 0.3,
                            },
                            {
                              label: 'Cost',
                              data: analyticsData.costData,
                              borderColor: '#f44336',
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                              tension: 0.3,
                            },
                            {
                              label: 'Profit',
                              data: analyticsData.profitData,
                              borderColor: '#4caf50',
                              backgroundColor: 'rgba(76, 175, 80, 0.1)',
                              tension: 0.3,
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: true,
                              text: `Sales Analytics (${analyticsPeriod.charAt(0).toUpperCase() + analyticsPeriod.slice(1)})`,
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function(value) {
                                  return '$' + value;
                                }
                              }
                            }
                          }
                        }}
                      />
                    ) : (
                      <Bar
                        data={{
                          labels: analyticsData.labels,
                          datasets: [
                            {
                              label: 'Revenue',
                              data: analyticsData.revenueData,
                              backgroundColor: 'rgba(33, 150, 243, 0.7)',
                            },
                            {
                              label: 'Cost',
                              data: analyticsData.costData,
                              backgroundColor: 'rgba(244, 67, 54, 0.7)',
                            },
                            {
                              label: 'Profit',
                              data: analyticsData.profitData,
                              backgroundColor: 'rgba(76, 175, 80, 0.7)',
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: true,
                              text: `Sales Analytics (${analyticsPeriod.charAt(0).toUpperCase() + analyticsPeriod.slice(1)})`,
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function(value) {
                                  return '$' + value;
                                }
                              }
                            }
                          }
                        }}
                      />
                    )
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <p style={{ color: "#757575" }}>No data available for the selected date range.</p>
                    </div>
                  )}
                </div>
                
                {/* Data Table */}
                {analyticsData.labels.length > 0 && (
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
                          <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Period</th>
                          <th style={{ padding: "15px", textAlign: "right", fontWeight: "500" }}>Revenue</th>
                          <th style={{ padding: "15px", textAlign: "right", fontWeight: "500" }}>Cost</th>
                          <th style={{ padding: "15px", textAlign: "right", fontWeight: "500" }}>Profit</th>
                          <th style={{ padding: "15px", textAlign: "right", fontWeight: "500" }}>Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.labels.map((label, index) => (
                          <tr key={index} style={{
                            borderBottom: "1px solid var(--border-color)"
                          }}>
                            <td style={{ padding: "15px" }}>{label}</td>
                            <td style={{ padding: "15px", textAlign: "right", color: "#2196f3", fontWeight: "500" }}>
                              ${analyticsData.revenueData[index].toFixed(2)}
                            </td>
                            <td style={{ padding: "15px", textAlign: "right", color: "#f44336", fontWeight: "500" }}>
                              ${analyticsData.costData[index].toFixed(2)}
                            </td>
                            <td style={{ padding: "15px", textAlign: "right", color: "#4caf50", fontWeight: "500" }}>
                              ${analyticsData.profitData[index].toFixed(2)}
                            </td>
                            <td style={{ padding: "15px", textAlign: "right", color: "#6a1b9a", fontWeight: "500" }}>
                              {(analyticsData.profitData[index] / analyticsData.revenueData[index] * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                        <tr style={{
                          borderTop: "2px solid var(--border-color)",
                          backgroundColor: "#fafafa"
                        }}>
                          <td style={{ padding: "15px", fontWeight: "600" }}>Total</td>
                          <td style={{ padding: "15px", textAlign: "right", color: "#2196f3", fontWeight: "600" }}>
                            ${analyticsData.totalRevenue.toFixed(2)}
                          </td>
                          <td style={{ padding: "15px", textAlign: "right", color: "#f44336", fontWeight: "600" }}>
                            ${analyticsData.totalCost.toFixed(2)}
                          </td>
                          <td style={{ padding: "15px", textAlign: "right", color: "#4caf50", fontWeight: "600" }}>
                            ${analyticsData.totalProfit.toFixed(2)}
                          </td>
                          <td style={{ padding: "15px", textAlign: "right", color: "#6a1b9a", fontWeight: "600" }}>
                            {(analyticsData.totalProfit / analyticsData.totalRevenue * 100).toFixed(1)}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                padding: "40px 20px", 
                textAlign: "center",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                border: "1px dashed #ddd"
              }}>
                <FaChartBar size={48} style={{ color: "#bdbdbd", marginBottom: "20px" }} />
                <h3 style={{ color: "#757575", fontSize: "1.2rem", fontWeight: "normal", marginBottom: "10px" }}>
                  No Analytics Data
                </h3>
                <p style={{ color: "#9e9e9e" }}>
                  Select a date range and click "Generate Report" to view sales analytics.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
      
      <Footer />
    </div>
  );
};

export default SalesManagerDashboard; 