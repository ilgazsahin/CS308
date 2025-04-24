import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard() {
  // For listing existing books
  const [books, setBooks] = useState([]);

  // For adding a new book; note the added price field
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    description: "",
    publishedYear: "",
    image: "",
    price: "",
    stock: 10 // Default stock value
  });
  const [message, setMessage] = useState("");
  const [stockUpdateMessage, setStockUpdateMessage] = useState("");

  // Fetch existing books on mount
  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await axios.get("http://localhost:3001/api/books");
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    }
    fetchBooks();
  }, []);

  // Handle input changes for the Add Book form
  const handleChange = (e) => {
    setNewBook({ ...newBook, [e.target.name]: e.target.value });
  };

  // Handle the Add Book submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Optionally, convert price and publishedYear to numbers if needed:
    const bookToSend = {
      ...newBook,
      publishedYear: newBook.publishedYear ? Number(newBook.publishedYear) : undefined,
      price: newBook.price ? Number(newBook.price) : undefined,
      stock: newBook.stock ? Number(newBook.stock) : 10
    };

    try {
      const response = await axios.post("http://localhost:3001/api/books", bookToSend);
      setMessage("Book added successfully!");
      // Clear form
      setNewBook({
        title: "",
        author: "",
        description: "",
        publishedYear: "",
        image: "",
        price: "",
        stock: 10
      });
      // Re-fetch books to update the list
      const updatedList = await axios.get("http://localhost:3001/api/books");
      setBooks(updatedList.data);
    } catch (error) {
      setMessage("Error adding book: " + (error.response?.data?.message || error.message));
    }
  };

  // Handle stock update
  const handleStockChange = async (bookId, newStock) => {
    try {
      // Ensure stock is a valid number and not negative
      const stockValue = parseInt(newStock, 10);
      if (isNaN(stockValue) || stockValue < 0) {
        setStockUpdateMessage("Stock must be a valid non-negative number");
        return;
      }

      // Update the stock via API
      await axios.patch(`http://localhost:3001/api/books/${bookId}/stock`, {
        stock: stockValue
      });

      // Update the local state
      setBooks(books.map(book => 
        book._id === bookId ? { ...book, stock: stockValue } : book
      ));

      setStockUpdateMessage("Stock updated successfully!");
      
      // Clear the message after 3 seconds
      setTimeout(() => setStockUpdateMessage(""), 3000);
    } catch (error) {
      setStockUpdateMessage("Error updating stock: " + (error.response?.data?.message || error.message));
    }
  };

  // Format stock status for display
  const getStockStatusStyle = (stock) => {
    if (stock === undefined || stock === null) return {};
    
    if (stock <= 0) {
      return { color: "#d32f2f", fontWeight: "bold" }; // Red for out of stock
    } else if (stock < 5) {
      return { color: "#f57c00", fontWeight: "bold" }; // Orange for low stock
    } else {
      return { color: "#388e3c" }; // Green for in stock
    }
  };

  return (
      <div style={styles.dashboardContainer}>
        <header style={styles.header}>
          <h1>Admin Dashboard</h1>
          <div style={styles.headerLinks}>
            <Link to="/admin/stock" style={styles.headerLink}>Stock Management</Link>
            <Link to="/admin/manage-orders" style={styles.headerLink}>Manage Orders</Link>
            <Link to="/home" style={styles.headerLink}>Go to Store</Link>
          </div>
        </header>

        <div style={styles.contentContainer}>
          <div style={styles.addBookSection}>
            <h2>Add a New Book</h2>
            {message && <p style={{ color: "green" }}>{message}</p>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={newBook.title}
                  onChange={handleChange}
                  required
                  style={styles.inputField}
              />
              <input
                  type="text"
                  name="author"
                  placeholder="Author"
                  value={newBook.author}
                  onChange={handleChange}
                  required
                  style={styles.inputField}
              />
              <textarea
                  name="description"
                  placeholder="Description"
                  value={newBook.description}
                  onChange={handleChange}
                  style={styles.textArea}
              />
              <input
                  type="number"
                  name="publishedYear"
                  placeholder="Published Year"
                  value={newBook.publishedYear}
                  onChange={handleChange}
                  style={styles.inputField}
              />
              <input
                  type="text"
                  name="image"
                  placeholder="Image URL"
                  value={newBook.image}
                  onChange={handleChange}
                  required
                  style={styles.inputField}
              />
              <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={newBook.price}
                  onChange={handleChange}
                  required
                  style={styles.inputField}
              />
              <input
                  type="number"
                  name="stock"
                  placeholder="Stock Quantity"
                  value={newBook.stock}
                  onChange={handleChange}
                  required
                  style={styles.inputField}
              />
              <button type="submit" style={styles.addButton}>
                Add Book
              </button>
            </form>
          </div>

          <div style={styles.bookListSection}>
            <h2>Existing Books</h2>
            {stockUpdateMessage && <p style={{ color: "green" }}>{stockUpdateMessage}</p>}
            <table style={styles.table}>
              <thead>
              <tr>
                <th style={styles.tableHeader}>Title</th>
                <th style={styles.tableHeader}>Author</th>
                <th style={styles.tableHeader}>Published Year</th>
                <th style={styles.tableHeader}>Price</th>
                <th style={styles.tableHeader}>Stock</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
              </thead>
              <tbody>
              {books.map((book) => (
                  <tr key={book._id}>
                    <td style={styles.tableCell}>{book.title}</td>
                    <td style={styles.tableCell}>{book.author}</td>
                    <td style={styles.tableCell}>{book.publishedYear}</td>
                    <td style={styles.tableCell}>
                      {book.price !== undefined ? `$${book.price.toFixed(2)}` : ""}
                    </td>
                    <td style={styles.tableCell}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                          type="number"
                          min="0"
                          value={book.stock !== undefined ? book.stock : 0}
                          onChange={(e) => handleStockChange(book._id, e.target.value)}
                          style={{ ...styles.stockInput, ...getStockStatusStyle(book.stock) }}
                        />
                        <span style={getStockStatusStyle(book.stock)}>
                          {book.stock <= 0 ? 'Out of stock' : 
                           book.stock < 5 ? 'Low stock' : 'In stock'}
                        </span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      {/* Edit link navigates to an EditBook page */}
                      <Link to={`/editbook/${book._id}`} style={styles.linkButton}>
                        Edit
                      </Link>

                      {/* Details link */}
                      <a href={`/book/${book._id}`} style={styles.linkButton}>
                        Details
                      </a>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}

// Simple inline styles for demonstration
const styles = {
  dashboardContainer: {
    fontFamily: "sans-serif",
  },
  header: {
    backgroundColor: "#333",
    color: "#fff",
    padding: "1rem",
    textAlign: "center",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLinks: {
    display: "flex",
    gap: "1rem",
  },
  headerLink: {
    color: "#fff",
    textDecoration: "none",
    padding: "5px 10px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "4px",
    transition: "background-color 0.3s ease",
  },
  contentContainer: {
    display: "flex",
    margin: "2rem",
    gap: "2rem",
  },
  addBookSection: {
    flex: "1",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "1rem",
  },
  bookListSection: {
    flex: "2",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginTop: "1rem",
  },
  inputField: {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  stockInput: {
    width: "60px",
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    textAlign: "center"
  },
  textArea: {
    height: "80px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    padding: "0.5rem",
  },
  addButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "0.75rem",
    cursor: "pointer",
    borderRadius: "4px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "1rem",
  },
  tableHeader: {
    backgroundColor: "#f8f8f8",
    textAlign: "left",
    padding: "0.5rem",
    borderBottom: "2px solid #ccc",
  },
  tableCell: {
    padding: "0.5rem",
    borderBottom: "1px solid #ccc",
  },
  linkButton: {
    color: "#007bff",
    textDecoration: "none",
    marginRight: "0.5rem",
  },
};

export default Dashboard;
