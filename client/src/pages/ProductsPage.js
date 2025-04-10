import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";

const ProductsPage = () => {
    const [books, setBooks] = useState([]);
    const [displayedBooks, setDisplayedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState("default"); // default, name-asc, name-desc, price-asc, price-desc
    
    useEffect(() => {
        async function fetchBooks() {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:3001/api/books");
                // Only use real books from the database
                setBooks(response.data);
                setDisplayedBooks(response.data);
            } catch (error) {
                console.error("An error occurred while fetching books:", error);
                setBooks([]);
                setDisplayedBooks([]);
            } finally {
                setLoading(false);
            }
        }
        fetchBooks();
    }, []);

    // Handle sorting
    const handleSort = (option) => {
        setSortOption(option);
        
        let sortedBooks = [...books];
        
        switch (option) {
            case "name-asc":
                sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "name-desc":
                sortedBooks.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case "price-asc":
                sortedBooks.sort((a, b) => {
                    const priceA = a.price || 0;
                    const priceB = b.price || 0;
                    return priceA - priceB;
                });
                break;
            case "price-desc":
                sortedBooks.sort((a, b) => {
                    const priceA = a.price || 0;
                    const priceB = b.price || 0;
                    return priceB - priceA;
                });
                break;
            default:
                // Default order (as returned from API)
                sortedBooks = [...books];
        }
        
        setDisplayedBooks(sortedBooks);
    };

    return (
        <div style={{ backgroundColor: "var(--light-bg)", minHeight: "100vh" }}>
            <NavigationBar />
            
            <div className="container" style={{padding: "60px 0"}}>
                {/* Breadcrumb */}
                <div style={{
                    marginBottom: "20px", 
                    textAlign: "center",
                    fontFamily: "'Inter', sans-serif"
                }}>
                    <Link to="/" style={{
                        textDecoration: "none", 
                        color: "var(--light-text)",
                        fontSize: "0.9rem"
                    }}>Home</Link>
                    <span style={{margin: "0 10px", color: "var(--light-text)"}}>›</span>
                    <span style={{
                        color: "var(--primary-color)",
                        fontSize: "0.9rem"
                    }}>Products</span>
                </div>
                
                <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "2.8rem",
                    fontWeight: "500",
                    marginBottom: "50px",
                    color: "var(--primary-color)",
                    textAlign: "center"
                }}>All Products</h1>
                
                {/* Sorting UI */}
                {!loading && books.length > 0 && (
                    <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginBottom: "30px",
                        alignItems: "center"
                    }}>
                        <span style={{
                            marginRight: "10px", 
                            color: "var(--primary-color)",
                            fontWeight: "500",
                            fontSize: "1rem"
                        }}>Sort by:</span>
                        <select 
                            value={sortOption}
                            onChange={(e) => handleSort(e.target.value)}
                            style={{
                                padding: "8px 12px",
                                border: "1px solid #ddd",
                                borderRadius: "3px",
                                backgroundColor: "white",
                                color: "var(--primary-color)",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                fontSize: "0.9rem",
                                minWidth: "180px",
                                appearance: "none",
                                backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"%23555\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>')",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 8px center",
                                paddingRight: "30px"
                            }}
                        >
                            <option value="default">Default</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="price-asc">Price (Low to High)</option>
                            <option value="price-desc">Price (High to Low)</option>
                        </select>
                    </div>
                )}
                
                {loading ? (
                    <div style={{textAlign: "center", padding: "50px 0"}}>
                        <p>Loading products...</p>
                    </div>
                ) : displayedBooks.length > 0 ? (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                        gap: "30px",
                        marginBottom: "50px"
                    }}>
                        {displayedBooks.map((book) => (
                            <div key={book._id} className="book-card" style={{
                                backgroundColor: "white",
                                transition: "transform 0.3s ease",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <Link
                                    to={`/book/${book._id}`}
                                    style={{
                                        textDecoration: "none",
                                        color: "inherit",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column"
                                    }}
                                >
                                    <div style={{
                                        height: "350px",
                                        overflow: "hidden",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#f5f5f5",
                                        position: "relative",
                                        flexGrow: 0
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
                                    </div>
                                    <div style={{ 
                                        padding: "20px 15px", 
                                        textAlign: "center",
                                        flexGrow: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between"
                                    }}>
                                        <div>
                                            <h3 style={{
                                                fontSize: "1.1rem",
                                                fontWeight: "500",
                                                marginBottom: "6px",
                                                fontFamily: "'Playfair Display', serif",
                                                color: "var(--primary-color)"
                                            }}>{book.title}</h3>
                                            <p style={{
                                                fontSize: "0.9rem",
                                                color: "var(--light-text)",
                                                marginBottom: "15px"
                                            }}>{book.author}</p>
                                        </div>
                                        <p style={{
                                            fontSize: "1rem",
                                            fontWeight: "500",
                                            color: "var(--primary-color)"
                                        }}>${book.price || "35.00"}</p>
                                    </div>
                                </Link>
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