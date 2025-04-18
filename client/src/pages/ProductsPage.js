import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";
import { FaSearch } from "react-icons/fa";

const ProductsPage = () => {
    const [books, setBooks] = useState([]);
    const [displayedBooks, setDisplayedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState("default"); // default, name-asc, name-desc, price-asc, price-desc, rating-desc, rating-asc
    const [searchQuery, setSearchQuery] = useState(""); // New state for search query
    const [bookRatings, setBookRatings] = useState({}); // Store book ratings

    useEffect(() => {
        async function fetchBooks() {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:3001/api/books");
                // Only use real books from the database
                setBooks(response.data);
                setDisplayedBooks(response.data);

                // Fetch ratings for all books
                fetchBookRatings(response.data);
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

    // Fetch ratings for all books
    const fetchBookRatings = async (bookList) => {
        try {
            const ratingsObj = {};

            // Fetch ratings for each book
            for (const book of bookList) {
                try {
                    const response = await axios.get(`http://localhost:3001/api/comments/${book._id}`);
                    const comments = response.data;

                    // Calculate average rating
                    if (comments.length > 0) {
                        const totalRating = comments.reduce((sum, comment) => sum + (comment.rating || 0), 0);
                        const averageRating = totalRating / comments.length;
                        ratingsObj[book._id] = averageRating;
                    } else {
                        ratingsObj[book._id] = 0; // No ratings yet
                    }
                } catch (err) {
                    console.error(`Error fetching ratings for book ${book._id}:`, err);
                    ratingsObj[book._id] = 0;
                }
            }

            setBookRatings(ratingsObj);
        } catch (error) {
            console.error("Error fetching book ratings:", error);
        }
    };

    // Filter books based on search query and apply sorting
    useEffect(() => {
        let filteredBooks = [...books];

        // Filter by search query if not empty
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            filteredBooks = filteredBooks.filter(book =>
                book.title.toLowerCase().includes(query) ||
                (book.author && book.author.toLowerCase().includes(query)) ||
                (book.description && book.description.toLowerCase().includes(query))
            );
        }

        // Apply current sort option to filtered books
        sortBooks(filteredBooks);
    }, [searchQuery, books, sortOption, bookRatings]);

    // Handle sorting
    const handleSort = (option) => {
        setSortOption(option);
        sortBooks([...displayedBooks], option);
    };

    // Sort books helper function
    const sortBooks = (booksToSort, option = sortOption) => {
        let sortedBooks = [...booksToSort];

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
            case "rating-desc": // Most popular (highest rating) first
                sortedBooks.sort((a, b) => {
                    const ratingA = bookRatings[a._id] || 0;
                    const ratingB = bookRatings[b._id] || 0;
                    return ratingB - ratingA;
                });
                break;
            case "rating-asc": // Least popular (lowest rating) first
                sortedBooks.sort((a, b) => {
                    const ratingA = bookRatings[a._id] || 0;
                    const ratingB = bookRatings[b._id] || 0;
                    return ratingA - ratingB;
                });
                break;
            default:
                // Default order (as returned from API)
                break;
        }

        setDisplayedBooks(sortedBooks);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Handle search form submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Search is already handled by the useEffect
    };

    // Function to render rating stars
    const renderRatingStars = (bookId) => {
        const rating = bookRatings[bookId] || 0;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "10px",
                color: "#FFD700" // Gold color for stars
            }}>
                {[...Array(5)].map((_, i) => {
                    if (i < fullStars) {
                        return <span key={i}>★</span>; // Full star
                    } else if (i === fullStars && hasHalfStar) {
                        return <span key={i}>⯨</span>; // Half star (approximation)
                    } else {
                        return <span key={i} style={{ color: "#e0e0e0" }}>☆</span>; // Empty star
                    }
                })}
                {rating > 0 && (
                    <span style={{
                        fontSize: "0.8rem",
                        marginLeft: "5px",
                        color: "var(--light-text)"
                    }}>
                        ({rating.toFixed(1)})
                    </span>
                )}
            </div>
        );
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
                    marginBottom: "30px",
                    color: "var(--primary-color)",
                    textAlign: "center"
                }}>All Products</h1>

                {/* Search Bar */}
                {!loading && (
                    <div style={{
                        maxWidth: "500px",
                        margin: "0 auto 40px auto"
                    }}>
                        <form onSubmit={handleSearchSubmit} style={{
                            display: "flex",
                            width: "100%",
                            alignItems: "center",
                            position: "relative"
                        }}>
                            <input
                                type="text"
                                placeholder="Search by title, author, or description..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                style={{
                                    width: "100%",
                                    padding: "12px 20px",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "4px",
                                    fontSize: "0.95rem",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    position: "absolute",
                                    right: "15px",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "var(--primary-color)",
                                    fontSize: "1rem"
                                }}
                            >
                                <FaSearch />
                            </button>
                        </form>
                    </div>
                )}

                {/* Sorting UI */}
                {!loading && books.length > 0 && (
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "30px",
                        alignItems: "center"
                    }}>
                        <div>
                            {displayedBooks.length} {displayedBooks.length === 1 ? 'book' : 'books'} found
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
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
                                <option value="rating-desc">Most Popular</option>
                                <option value="rating-asc">Least Popular</option>
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="price-asc">Price (Low to High)</option>
                                <option value="price-desc">Price (High to Low)</option>
                            </select>
                        </div>
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
                                                marginBottom: "5px"
                                            }}>{book.author}</p>
                                            {renderRatingStars(book._id)}
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
                        {searchQuery ? (
                            <div>
                                <p style={{marginBottom: "20px"}}>No books found matching "{searchQuery}"</p>
                                <button
                                    onClick={() => setSearchQuery("")}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "var(--primary-color)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontWeight: "500"
                                    }}
                                >
                                    Clear Search
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p style={{marginBottom: "20px"}}>No products found in the database.</p>
                                <p>Please make sure your MongoDB database is properly set up and contains books in the 'books' collection.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default ProductsPage;