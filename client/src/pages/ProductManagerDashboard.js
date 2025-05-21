import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";
import { FaBook, FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import axios from "axios";

const ProductManagerDashboard = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
          // User is authorized, fetch books
          fetchBooks();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);
  
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
        </div>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <p>Loading books...</p>
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
              color: "var(--primary-color)"
            }}>
              <FaBook style={{ marginRight: "10px" }} />
              Book Inventory
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
                    <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Title</th>
                    <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Author</th>
                    <th style={{ padding: "15px", textAlign: "left", fontWeight: "500" }}>Category</th>
                    <th style={{ padding: "15px", textAlign: "right", fontWeight: "500" }}>Price</th>
                    <th style={{ padding: "15px", textAlign: "center", fontWeight: "500" }}>Stock</th>
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
                      <td style={{ padding: "15px", textAlign: "right" }}>${book.price?.toFixed(2) || "0.00"}</td>
                      <td style={{ 
                        padding: "15px", 
                        textAlign: "center",
                        color: book.stock <= 0 ? "#d32f2f" : book.stock < 5 ? "#f57c00" : "#388e3c"
                      }}>
                        {book.stock || 0}
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
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductManagerDashboard; 