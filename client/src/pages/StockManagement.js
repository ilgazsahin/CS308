import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const StockManagement = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [filter, setFilter] = useState("all"); // all, low, out

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:3001/api/books");
            setBooks(response.data);
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStockChange = async (bookId, newStock) => {
        try {
            // Ensure stock is a valid number and not negative
            const stockValue = parseInt(newStock, 10);
            if (isNaN(stockValue) || stockValue < 0) {
                setMessage("Stock must be a valid non-negative number");
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

            setMessage("Stock updated successfully!");
            
            // Clear the message after 3 seconds
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            setMessage("Error updating stock: " + (error.response?.data?.message || error.message));
        }
    };

    // Filter books based on their stock status
    const filteredBooks = books.filter(book => {
        if (filter === "all") return true;
        if (filter === "low") return book.stock > 0 && book.stock < 5;
        if (filter === "out") return book.stock <= 0;
        return true;
    });

    // Format stock status
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
            <header style={styles.header}>
                <h1>Stock Management</h1>
                <Link to="/admin" style={styles.backLink}>Back to Dashboard</Link>
            </header>

            {message && <div style={styles.message}>{message}</div>}

            <div style={styles.controls}>
                <div style={styles.filter}>
                    <label htmlFor="filter">Filter by Status: </label>
                    <select 
                        id="filter" 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        style={styles.select}
                    >
                        <option value="all">All Items</option>
                        <option value="low">Low Stock (1-4 items)</option>
                        <option value="out">Out of Stock</option>
                    </select>
                </div>
                <button 
                    onClick={fetchBooks} 
                    style={styles.refreshButton}
                >
                    Refresh Stock
                </button>
            </div>

            {loading ? (
                <p>Loading book inventory...</p>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Book</th>
                                <th style={styles.th}>Current Stock</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBooks.length > 0 ? (
                                filteredBooks.map(book => (
                                    <tr key={book._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={styles.bookInfo}>
                                                <img 
                                                    src={book.image} 
                                                    alt={book.title} 
                                                    style={styles.bookImage} 
                                                />
                                                <div>
                                                    <h3 style={styles.bookTitle}>{book.title}</h3>
                                                    <p style={styles.bookAuthor}>{book.author}</p>
                                                    <p style={styles.bookPrice}>${book.price?.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <input
                                                type="number"
                                                min="0"
                                                value={book.stock !== undefined ? book.stock : 0}
                                                onChange={(e) => handleStockChange(book._id, e.target.value)}
                                                style={{...styles.stockInput, ...getStockStatusStyle(book.stock)}}
                                            />
                                        </td>
                                        <td style={{...styles.td, ...getStockStatusStyle(book.stock)}}>
                                            {book.stock <= 0 ? 'Out of stock' : 
                                             book.stock < 5 ? `Low stock (${book.stock} remaining)` : 
                                             `In stock (${book.stock} available)`}
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.actions}>
                                                <button 
                                                    onClick={() => handleStockChange(book._id, book.stock + 1)}
                                                    style={styles.incrementButton}
                                                >
                                                    +1
                                                </button>
                                                <button 
                                                    onClick={() => handleStockChange(book._id, book.stock + 5)}
                                                    style={styles.incrementButton}
                                                >
                                                    +5
                                                </button>
                                                <button 
                                                    onClick={() => handleStockChange(book._id, Math.max(0, book.stock - 1))}
                                                    style={styles.decrementButton}
                                                    disabled={book.stock <= 0}
                                                >
                                                    -1
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{...styles.td, textAlign: "center"}}>
                                        No books match the current filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "sans-serif",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        paddingBottom: "20px",
        borderBottom: "1px solid #eee",
    },
    backLink: {
        textDecoration: "none",
        color: "#007bff",
        fontWeight: "500",
    },
    message: {
        padding: "10px",
        marginBottom: "20px",
        backgroundColor: "#e8f5e9",
        color: "#2e7d32",
        borderRadius: "4px",
    },
    controls: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
    },
    filter: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    select: {
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
    },
    refreshButton: {
        padding: "8px 16px",
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
        borderRadius: "4px",
        cursor: "pointer",
    },
    tableContainer: {
        overflowX: "auto",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        border: "1px solid #eee",
    },
    th: {
        padding: "12px",
        textAlign: "left",
        backgroundColor: "#f8f8f8",
        borderBottom: "2px solid #ddd",
    },
    tr: {
        borderBottom: "1px solid #eee",
    },
    td: {
        padding: "12px",
        verticalAlign: "middle",
    },
    bookInfo: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },
    bookImage: {
        width: "60px",
        height: "80px",
        objectFit: "cover",
    },
    bookTitle: {
        margin: "0 0 5px 0",
        fontSize: "1rem",
        fontWeight: "500",
    },
    bookAuthor: {
        margin: "0 0 5px 0",
        fontSize: "0.9rem",
        color: "#666",
    },
    bookPrice: {
        margin: "0",
        fontWeight: "500",
    },
    stockInput: {
        width: "60px",
        padding: "8px",
        textAlign: "center",
        borderRadius: "4px",
        border: "1px solid #ccc",
    },
    actions: {
        display: "flex",
        gap: "8px",
    },
    incrementButton: {
        padding: "5px 10px",
        backgroundColor: "#e8f5e9",
        color: "#2e7d32",
        border: "1px solid #c8e6c9",
        borderRadius: "4px",
        cursor: "pointer",
    },
    decrementButton: {
        padding: "5px 10px",
        backgroundColor: "#ffebee",
        color: "#c62828",
        border: "1px solid #ffcdd2",
        borderRadius: "4px",
        cursor: "pointer",
    },
};

export default StockManagement; 