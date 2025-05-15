import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function SalesManagerDashboard() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState("");
  const [discount, setDiscount] = useState(0); // Yüzde olarak (%)
  const [selectedBooks, setSelectedBooks] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role || role !== "sales manager") {
      navigate("/unauthorized");
    }
    fetchBooks();
  }, [navigate]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/books");
      setBooks(res.data);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  const handlePriceChange = async (bookId, newPrice) => {
    try {
      await axios.patch(`http://localhost:3001/api/books/${bookId}/price`, {
        price: parseFloat(newPrice)
      });
      setBooks(prev =>
        prev.map(book =>
          book._id === bookId ? { ...book, price: parseFloat(newPrice) } : book
        )
      );
      setMessage("Price updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error updating price:", err);
      setMessage("Failed to update price.");
    }
  };

  const handleCheckboxChange = (bookId) => {
    setSelectedBooks((prevSelected) =>
      prevSelected.includes(bookId)
        ? prevSelected.filter(id => id !== bookId)
        : [...prevSelected, bookId]
    );
  };

  const applyDiscount = async () => {
    try {
      const res = await axios.patch("http://localhost:3001/api/books/discount", {
        bookIds: selectedBooks,
        discountRate: discount // örn: 20 ise %20
      });

      setMessage("Discount applied successfully!");
      fetchBooks();
      setSelectedBooks([]);
      setDiscount(0);
    } catch (err) {
      console.error("Error applying discount:", err);
      setMessage("Failed to apply discount.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Sales Manager Dashboard</h2>
      <div style={{ marginBottom: "1rem" }}>
        <Link to="/admin/invoices" style={styles.linkButton}>View Invoices</Link>
        <Link to="/sales-manager/profit-report" style={styles.linkButton}>Profit/Loss Report</Link>
        <Link to="/sales-manager/manage-refunds" style={styles.linkButton}>Manage Refunds</Link>

      </div>

      <div style={{ margin: "1rem 0" }}>
        <input
          type="number"
          min="0"
          max="100"
          value={discount}
          onChange={(e) => setDiscount(parseFloat(e.target.value))}
          placeholder="Discount %"
          style={styles.input}
        />
        <button onClick={applyDiscount} style={styles.applyButton}>
          Apply Discount to Selected
        </button>
      </div>

      {message && <p style={{ color: "green" }}>{message}</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Select</th>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Current Price</th>
            <th style={styles.th}>Set New Price</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book._id}>
              <td style={styles.td}>
                <input
                  type="checkbox"
                  checked={selectedBooks.includes(book._id)}
                  onChange={() => handleCheckboxChange(book._id)}
                />
              </td>
              <td style={styles.td}>{book.title}</td>
              <td style={styles.td}>${book.price}</td>
              <td style={styles.td}>
                <input
                  type="number"
                  min="0"
                  defaultValue={book.price}
                  onBlur={(e) => handlePriceChange(book._id, e.target.value)}
                  style={styles.input}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  linkButton: {
    marginRight: "1rem",
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "white",
    textDecoration: "none",
    borderRadius: "5px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px"
  },
  th: {
    textAlign: "left",
    padding: "10px",
    backgroundColor: "#f2f2f2"
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #ddd"
  },
  input: {
    padding: "6px",
    width: "100px"
  },
  applyButton: {
    marginLeft: "10px",
    padding: "8px 12px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default SalesManagerDashboard;
