import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditBook = () => {
    const { id } = useParams(); // Book ID from the URL
    const navigate = useNavigate();
    const [book, setBook] = useState({
        title: "",
        author: "",
        description: "",
        publishedYear: "",
        image: "",
        price: "",
        stock: 0
    });
    const [message, setMessage] = useState("");

    // Fetch the book details when component mounts or the id changes
    useEffect(() => {
        async function fetchBook() {
            try {
                const response = await axios.get(`http://localhost:3001/api/books/${id}`);
                setBook(response.data);
            } catch (error) {
                console.error("Error fetching book details:", error);
            }
        }
        fetchBook();
    }, [id]);

    // Handle changes to form fields
    const handleChange = (e) => {
        setBook({ ...book, [e.target.name]: e.target.value });
    };

    // Handle form submission to update the book
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Optionally convert publishedYear and price to numbers
        const updatedBook = {
            ...book,
            publishedYear: book.publishedYear ? Number(book.publishedYear) : undefined,
            price: book.price ? Number(book.price) : undefined,
            stock: book.stock ? Number(book.stock) : 0
        };

        try {
            const response = await axios.put(`http://localhost:3001/api/books/${id}`, updatedBook);
            setMessage("Book updated successfully!");
            // Optionally, redirect to the book details page after a short delay
            setTimeout(() => {
                navigate(`/book/${id}`);
            }, 1000);
        } catch (error) {
            setMessage("Error updating book: " + (error.response?.data?.message || error.message));
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
            <h2>Edit Book</h2>
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
                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={book.price}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
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
                <button type="submit" style={styles.button}>
                    Save Changes
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "20px",
        fontFamily: "sans-serif",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    message: {
        color: "green",
        marginBottom: "1rem",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    input: {
        padding: "0.5rem",
        borderRadius: "4px",
        border: "1px solid #ccc",
    },
    textArea: {
        height: "80px",
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
    button: {
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        padding: "0.75rem",
        borderRadius: "4px",
        cursor: "pointer",
        marginTop: "10px",
    },
};

export default EditBook;
