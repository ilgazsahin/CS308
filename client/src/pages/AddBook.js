import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function AddBook() {
  const navigate = useNavigate();
  const [book, setBook] = useState({
    title: "",
    author: "",
    description: "",
    publishedYear: "",
    image: "",
    stock: 0,
    category: ""
  });
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch categories when component mounts
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get("http://localhost:3001/api/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Convert publishedYear and stock to numbers
      const newBook = {
        ...book,
        publishedYear: book.publishedYear ? Number(book.publishedYear) : undefined,
        stock: book.stock ? Number(book.stock) : 0
      };

      const response = await axios.post("http://localhost:3001/api/books", newBook);
      setMessage("Book added successfully!");
      
      // Redirect to product manager dashboard after a short delay
      setTimeout(() => {
        navigate("/product-manager");
      }, 1000);
    } catch (error) {
      setMessage("Error adding book: " + (error.response?.data?.message || error.message));
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
    <div style={styles.container}>
      <div style={styles.backButtonContainer}>
        <Link to="/product-manager" style={styles.backButton}>
          <FaArrowLeft style={{ marginRight: "8px" }} /> Back to Dashboard
        </Link>
      </div>
      
      <h2 style={styles.title}>Add New Book</h2>
      
      {message && <p style={styles.message}>{message}</p>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={book.title}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={book.author}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={book.description}
          onChange={handleChange}
          style={styles.textArea}
        />
        <input
          type="number"
          name="publishedYear"
          placeholder="Published Year"
          value={book.publishedYear}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="text"
          name="image"
          placeholder="Image URL"
          value={book.image}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <div style={styles.formGroup}>
          <label htmlFor="category" style={styles.label}>Category:</label>
          <select
            id="category"
            name="category"
            value={book.category}
            onChange={handleChange}
            required
            style={styles.select}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.stockContainer}>
          <label htmlFor="stock" style={styles.stockLabel}>Stock Quantity:</label>
          <input
            id="stock"
            type="number"
            name="stock"
            min="0"
            placeholder="Stock Quantity"
            value={book.stock}
            onChange={handleChange}
            required
            style={{...styles.stockInput, ...getStockStatusStyle(book.stock)}}
          />
          <span style={{...getStockStatusStyle(book.stock), marginLeft: "10px"}}>
            {book.stock <= 0 ? 'Out of stock' : 
            book.stock < 5 ? 'Low stock' : 'In stock'}
          </span>
        </div>
        <div style={styles.buttonContainer}>
          <button type="submit" style={styles.button}>
            Add Book
          </button>
          <button 
            type="button" 
            onClick={() => navigate("/product-manager")}
            style={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "30px",
    fontFamily: "sans-serif",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    position: "relative",
    backgroundColor: "white"
  },
  backButtonContainer: {
    marginBottom: "20px",
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    color: "var(--primary-color)",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500"
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "var(--primary-color)",
    fontSize: "1.8rem",
    fontFamily: "'Playfair Display', serif",
  },
  message: {
    color: "green",
    marginBottom: "1rem",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  textArea: {
    height: "100px",
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontWeight: "bold",
  },
  select: {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  stockContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0.5rem 0",
  },
  stockLabel: {
    minWidth: "120px",
    fontWeight: "bold",
  },
  stockInput: {
    width: "80px",
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    textAlign: "center",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  button: {
    flex: 1,
    backgroundColor: "var(--primary-color)",
    color: "#fff",
    border: "none",
    padding: "0.75rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "500",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    color: "#333",
    border: "1px solid #ccc",
    padding: "0.75rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "500",
  }
};

export default AddBook;
