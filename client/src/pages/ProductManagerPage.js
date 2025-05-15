import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    description: "",
    publishedYear: "",
    image: "",
    price: "",
    stock: 10,
    category: ""
  });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [message, setMessage] = useState("");
  const [stockUpdateMessage, setStockUpdateMessage] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role || role !== "product manager") {
      navigate("/unauthorized");
    }

    fetchBooks();
    fetchCategories();
  }, [navigate]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/books");
      setBooks(res.data);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/categories");
      setCategories(res.data); 
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };
  

  const handleChange = (e) => {
    setNewBook({ ...newBook, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bookToSend = {
      ...newBook,
      publishedYear: Number(newBook.publishedYear),
      price: Number(newBook.price),
      stock: Number(newBook.stock)
    };
    try {
      await axios.post("http://localhost:3001/api/books", bookToSend);
      setMessage("Book added successfully!");
      setNewBook({
        title: "",
        author: "",
        description: "",
        publishedYear: "",
        image: "",
        price: "",
        stock: 10,
        category: ""
      });
      fetchBooks();
    } catch (error) {
      setMessage("Error adding book: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (bookId) => {
    try {
      await axios.delete(`http://localhost:3001/api/books/${bookId}`);
      fetchBooks();
    } catch (err) {
      console.error("Error deleting book:", err);
    }
  };

  const handleStockChange = async (bookId, newStock) => {
    try {
      const value = parseInt(newStock);
      if (isNaN(value) || value < 0) return;
      await axios.patch(`http://localhost:3001/api/books/${bookId}/stock`, { stock: value });
      setBooks(books.map(book =>
        book._id === bookId ? { ...book, stock: value } : book
      ));
      setStockUpdateMessage("Stock updated successfully!");
      setTimeout(() => setStockUpdateMessage(""), 3000);
    } catch (err) {
      setStockUpdateMessage("Error updating stock.");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Category name cannot be empty");
      return;
    }
  
    try {
      await axios.post("http://localhost:3001/api/categories", { category: newCategory.trim() });
      setNewCategory("");
      fetchCategories();
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };
  

  const handleDeleteCategory = async (category) => {
    try {
      await axios.delete(`http://localhost:3001/api/categories/${category}`);
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const getStockStatusStyle = (stock) => {
    if (stock <= 0) return { color: "#d32f2f", fontWeight: "bold" };
    if (stock < 5) return { color: "#f57c00", fontWeight: "bold" };
    return { color: "#388e3c" };
  };

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.header}>
        <h1>Product Manager Dashboard</h1>
        <div style={styles.headerLinks}>
          <Link to="/admin/invoices" style={styles.headerLink}>View Invoices</Link>
          <Link to="/admin/approval" style={styles.headerLink}>Comment Approval</Link>
          <Link to="/admin/manage-orders" style={styles.headerLink}>Manage Orders</Link>
          <Link to="/admin/commentmanagement" style={styles.headerLink}>Manage Comment</Link>

          <Link to="/home" style={styles.headerLink}>Go to Store</Link>
        </div>
      </header>

      <div style={styles.contentContainer}>
        {/* Book Form */}
        <div style={styles.addBookSection}>
          <h2>Add a New Book</h2>
          {message && <p style={{ color: "green" }}>{message}</p>}
          <form onSubmit={handleSubmit} style={styles.form}>
            {["title", "author", "description", "publishedYear", "image", "price", "stock"].map((field) => (
              <input key={field} type={field === "description" ? "text" : "text"} name={field} placeholder={field} value={newBook[field]} onChange={handleChange} required style={styles.inputField} />
            ))}
            <select name="category" value={newBook.category} onChange={handleChange} required style={styles.inputField}>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button type="submit" style={styles.addButton}>Add Book</button>
          </form>
        </div>

        {/* Book Table */}
        <div style={styles.bookListSection}>
          <h2>Existing Books</h2>
          {stockUpdateMessage && <p style={{ color: "green" }}>{stockUpdateMessage}</p>}
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Title</th>
                <th style={styles.tableHeader}>Author</th>
                <th style={styles.tableHeader}>Year</th>
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
                  <td style={styles.tableCell}>${book.price?.toFixed(2)}</td>
                  <td style={styles.tableCell}>
                    <input type="number" value={book.stock} onChange={(e) => handleStockChange(book._id, e.target.value)} style={{ ...styles.stockInput, ...getStockStatusStyle(book.stock) }} />
                  </td>
                  <td style={styles.tableCell}>
                    <Link to={`/editbook/${book._id}`} style={styles.linkButton}>Edit</Link>
                    <button onClick={() => handleDelete(book._id)} style={{
                            marginLeft: 10,
                            background: "none",
                            border: "none",
                            color: "#d32f2f",
                            textDecoration: "underline",
                            cursor: "pointer",
                            padding: 0,
                            font: "inherit"
                          }}>Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Category Management */}
        <div style={styles.addBookSection}>
          <h2>Manage Categories</h2>
          <input
            type="text"
            placeholder="New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            style={styles.inputField}
          />
          <button onClick={handleAddCategory} style={styles.addButton}>Add Category</button>
          <ul>
            {categories.map((cat) => (
              <li key={cat}>
                {cat}
                <button onClick={() => handleDeleteCategory(cat)} style={{ marginLeft: 10, color: "red" }}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboardContainer: { fontFamily: "sans-serif" },
  header: {
    backgroundColor: "#333", color: "#fff", padding: "1rem",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  headerLinks: { display: "flex", gap: "1rem" },
  headerLink: {
    color: "#fff", textDecoration: "none", padding: "5px 10px",
    backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "4px"
  },
  contentContainer: { display: "flex", flexWrap: "wrap", gap: "2rem", padding: "2rem" },
  addBookSection: { flex: "1 1 400px", border: "1px solid #ccc", borderRadius: "8px", padding: "1rem" },
  bookListSection: { flex: "2 1 600px", border: "1px solid #ccc", borderRadius: "8px", padding: "1rem" },
  form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  inputField: { padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" },
  stockInput: { width: "60px", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", textAlign: "center" },
  addButton: { backgroundColor: "#28a745", color: "#fff", border: "none", padding: "0.75rem", borderRadius: "4px", marginTop: "10px" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "1rem" },
  tableHeader: { backgroundColor: "#f8f8f8", textAlign: "left", padding: "0.5rem", borderBottom: "2px solid #ccc" },
  tableCell: { padding: "0.5rem", borderBottom: "1px solid #ccc" },
  linkButton: { color: "#007bff", textDecoration: "none", marginRight: "0.5rem", cursor: "pointer" },
};

export default Dashboard;
