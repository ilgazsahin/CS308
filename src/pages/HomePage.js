import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

const HomePage = () => {
  const [books, setBooks] = useState([]);

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;
  const totalPages = Math.ceil(books.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  // **Retrieve user info** from localStorage
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  // Decide what text to show
  const authStatus = userId
    ? `Logged in as ${userName || "Unknown User"}`
    : "Not logged in";

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await axios.get('http://localhost:3001/api/books');
        setBooks(response.data);
      } catch (error) {
        console.error('An error occurred while fetching books:', error);
      }
    }
    fetchBooks();
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      {/* Top-right corner status */}
      <div style={{ position: "absolute", top: 10, right: 10, fontWeight: "bold" }}>
        {authStatus}
      </div>

      <h1>Home Page</h1>

      <Link to="/register" style={{ display: "block", margin: "10px", textDecoration: "none", color: "#007bff" }}>
        Register
      </Link>
      <Link to="/login" style={{ display: "block", margin: "10px", textDecoration: "none", color: "#007bff" }}>
        Login
      </Link>
      <Link to="/login" style={{ display: "block", margin: "10px", textDecoration: "none", color: "#ff4757" }}>
        Logout
      </Link>
      
      {/* Book grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginTop: "20px" }}>
        {currentBooks.map((book) => (
          <Link to={`/book/${book._id}`} key={book._id} style={{ textDecoration: "none", color: "black" }}>
            <div style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
              <img 
                src={book.image} 
                alt={book.title} 
                style={{ width: "80px", height: "120px", objectFit: "cover", marginBottom: "10px" }} 
              />
              <h3 style={{ fontSize: "14px" }}>{book.title}</h3>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Pagination */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span style={{ margin: "0 15px" }}>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default HomePage;
