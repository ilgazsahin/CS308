import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";

const ProductsPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function fetchBooks() {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:3001/api/books");
                // Only use real books from the database
                setBooks(response.data);
            } catch (error) {
                console.error("An error occurred while fetching books:", error);
                setBooks([]);
            } finally {
                setLoading(false);
            }
        }
        fetchBooks();
    }, []);

    return (
        <div style={{ backgroundColor: "var(--light-bg)", minHeight: "100vh" }}>
            <NavigationBar />
            
            <div className="container" style={{padding: "60px 0"}}>
                {/* Breadcrumb */}
                <div style={{marginBottom: "40px"}}>
                    <Link to="/" style={{textDecoration: "none", color: "var(--light-text)"}}>Home</Link>
                    <span style={{margin: "0 10px", color: "var(--light-text)"}}>›</span>
                    <span style={{color: "var(--primary-color)"}}>Products</span>
                </div>
                
                <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "2.5rem",
                    fontWeight: "500",
                    marginBottom: "40px",
                    color: "var(--primary-color)",
                    textAlign: "center"
                }}>All Products</h1>
                
                {loading ? (
                    <div style={{textAlign: "center", padding: "50px 0"}}>
                        <p>Loading products...</p>
                    </div>
                ) : books.length > 0 ? (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "30px",
                        marginBottom: "50px"
                    }}>
                        {books.map((book) => (
                            <div key={book._id} className="book-card">
                                <Link
                                    to={`/book/${book._id}`}
                                    style={{
                                        textDecoration: "none",
                                        color: "inherit",
                                    }}
                                >
                                    <div style={{
                                        height: "380px",
                                        overflow: "hidden",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#f5f5f5",
                                        position: "relative"
                                    }}>
                                        <img
                                            src={book.image}
                                            alt={book.title}
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                                objectFit: "cover"
                                            }}
                                        />
                                        <div style={{
                                            position: "absolute",
                                            bottom: "20px",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            opacity: 0,
                                            transition: "opacity 0.3s ease",
                                            backgroundColor: "white",
                                            padding: "10px 20px",
                                            fontWeight: "500"
                                        }} className="add-to-cart-btn">
                                            ADD TO CART
                                        </div>
                                    </div>
                                </Link>
                                <div style={{ padding: "20px 10px", textAlign: "center" }}>
                                    <h3 className="book-title">{book.title}</h3>
                                    <p className="book-author">{book.author}</p>
                                    <p className="book-price">${book.price || "35.00"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        textAlign: "center", 
                        padding: "50px 0", 
                        backgroundColor: "white",
                        marginBottom: "50px"
                    }}>
                        <p style={{marginBottom: "20px"}}>No products found in the database.</p>
                        <p>Please make sure your MongoDB database is properly set up and contains books in the 'books' collection.</p>
                    </div>
                )}
            </div>
            
            <Footer />
        </div>
    );
};

export default ProductsPage; 