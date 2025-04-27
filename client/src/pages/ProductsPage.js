import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";
import { FaSearch, FaFilter } from "react-icons/fa";

const ProductsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [displayedBooks, setDisplayedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState("default"); // default, name-asc, name-desc, price-asc, price-desc, rating-desc, rating-asc
    const [searchQuery, setSearchQuery] = useState(""); // New state for search query
    const [bookRatings, setBookRatings] = useState({}); // Store book ratings
    const [categories, setCategories] = useState([]); // Available categories
    const [selectedCategory, setSelectedCategory] = useState(""); // Selected category filter

    // Parse query parameters when component mounts or URL changes
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const categoryParam = queryParams.get('category');
        const searchParam = queryParams.get('search');
        
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
        
        if (searchParam) {
            setSearchQuery(searchParam);
        }
    }, [location.search]);

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
        
        async function fetchCategories() {
            try {
                const response = await axios.get("http://localhost:3001/api/books/categories");
                setCategories(response.data);
            } catch (error) {
                console.error("An error occurred while fetching categories:", error);
                setCategories([]);
            }
        }
        
        fetchBooks();
        fetchCategories();
    }, []);

    // Fetch ratings for all books
    const fetchBookRatings = async (bookList) => {
        try {
            const ratingsObj = {};

            // Fetch ratings for each book
            for (const book of bookList) {
                try {
                    const response = await axios.get(`http://localhost:3001/api/ratings/book/${book._id}`);
                    ratingsObj[book._id] = response.data.averageRating;
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

    // Handle sort changes
    const handleSort = (option) => {
        setSortOption(option);
        setDisplayedBooks(sortBooks(filterBooks(books, searchQuery, selectedCategory), option));
    };
    
    // Filter books by search and category
    const filterBooks = (booksToFilter, query, category) => {
        let filtered = booksToFilter;
        
        // Apply search filter
        if (query) {
            const searchTerm = query.toLowerCase().trim();
            filtered = filtered.filter(book => {
                const searchString = `${book.title} ${book.author} ${book.description || ''}`.toLowerCase();
                return searchString.includes(searchTerm);
            });
        }
        
        // Apply category filter
        if (category) {
            filtered = filtered.filter(book => book.category === category);
        }
        
        return filtered;
    };
    
    // Handle category filter change
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        
        // Update URL with category parameter
        const queryParams = new URLSearchParams(location.search);
        if (category) {
            queryParams.set('category', category);
        } else {
            queryParams.delete('category');
        }
        
        navigate({
            pathname: location.pathname,
            search: queryParams.toString()
        });
    };
    
    // Apply search, category, and sort when books data or filters change
    useEffect(() => {
        if (books.length > 0) {
            const filteredBooks = filterBooks(books, searchQuery, selectedCategory);
            setDisplayedBooks(sortBooks(filteredBooks));
        }
    }, [books, searchQuery, selectedCategory]);

    // Sort books helper function
    const sortBooks = (booksToSort, option = sortOption) => {
        const booksCopy = [...booksToSort];
        
        switch (option) {
            case 'rating-desc':
                // Sort by highest rating first
                return booksCopy.sort((a, b) => (bookRatings[b._id] || 0) - (bookRatings[a._id] || 0));
            case 'rating-asc':
                // Sort by lowest rating first
                return booksCopy.sort((a, b) => (bookRatings[a._id] || 0) - (bookRatings[b._id] || 0));
            case 'name-asc':
                // Sort alphabetically by title
                return booksCopy.sort((a, b) => a.title.localeCompare(b.title));
            case 'name-desc':
                // Sort reverse alphabetically by title
                return booksCopy.sort((a, b) => b.title.localeCompare(a.title));
            case 'price-asc':
                // Sort by lowest price first
                return booksCopy.sort((a, b) => (a.price || 0) - (b.price || 0));
            case 'price-desc':
                // Sort by highest price first
                return booksCopy.sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'stock-asc':
                // Sort by lowest stock first
                return booksCopy.sort((a, b) => (a.stock || 0) - (b.stock || 0));
            case 'stock-desc':
                // Sort by highest stock first
                return booksCopy.sort((a, b) => (b.stock || 0) - (a.stock || 0));
            default:
                // Default sorting (keep original order)
                return booksCopy;
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Handle search form submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        
        // Update URL with search parameter
        const queryParams = new URLSearchParams(location.search);
        if (searchQuery.trim()) {
            queryParams.set('search', searchQuery);
        } else {
            queryParams.delete('search');
        }
        
        navigate({
            pathname: location.pathname,
            search: queryParams.toString()
        });
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
                        return (
                            <span key={i} style={{ position: "relative" }}>
                                <span style={{ color: "#e0e0e0" }}>☆</span>
                                <span style={{ 
                                    position: "absolute", 
                                    left: 0,
                                    top: 0,
                                    width: "50%",
                                    overflow: "hidden" 
                                }}>★</span>
                            </span>
                        ); // Half star
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

    // Add this function to display stock status badge
    const getStockBadge = (stock) => {
        if (stock === undefined || stock === null) return null;
        
        if (stock <= 0) {
            return (
                <div style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: "#fbe9e7",
                    color: "#d32f2f",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    fontWeight: "500",
                    fontSize: "0.8rem",
                    zIndex: 2
                }}>
                    Out of Stock
                </div>
            );
        } else if (stock < 5) {
            return (
                <div style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: "#fff8e1",
                    color: "#f57c00",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    fontWeight: "500",
                    fontSize: "0.8rem",
                    zIndex: 2
                }}>
                    Low Stock: {stock}
                </div>
            );
        }
        return null;
    };

    // Function to render category badge
    const getCategoryBadge = (category) => {
        if (!category) return null;
        
        return (
            <div style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                backgroundColor: "var(--primary-color)",
                color: "#ffffff",
                padding: "5px 10px",
                borderRadius: "4px",
                fontWeight: "500",
                fontSize: "0.8rem",
                zIndex: 2
            }}>
                {category}
            </div>
        );
    };

    // Listen for URL search parameter changes from the header search
    useEffect(() => {
        const handleUrlSearchUpdate = (event) => {
            if (event.detail && event.detail.search !== undefined) {
                setSearchQuery(event.detail.search);
            }
        };
        
        window.addEventListener('urlSearchUpdate', handleUrlSearchUpdate);
        
        return () => {
            window.removeEventListener('urlSearchUpdate', handleUrlSearchUpdate);
        };
    }, []);

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
                    {selectedCategory && (
                        <>
                            <span style={{margin: "0 10px", color: "var(--light-text)"}}>›</span>
                            <span style={{
                                color: "var(--primary-color)",
                                fontSize: "0.9rem",
                                fontWeight: "500"
                            }}>{selectedCategory}</span>
                        </>
                    )}
                </div>

                <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "2.8rem",
                    fontWeight: "500",
                    marginBottom: "30px",
                    color: "var(--primary-color)",
                    textAlign: "center"
                }}>
                    {selectedCategory ? `${selectedCategory} Books` : "All Products"}
                </h1>

                {/* Active filters display */}
                {!loading && (selectedCategory || searchQuery) && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "20px",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        maxWidth: "500px",
                        margin: "0 auto 30px auto"
                    }}>
                        {selectedCategory && (
                            <div style={{
                                background: "var(--primary-color)",
                                color: "white",
                                padding: "5px 12px",
                                borderRadius: "15px",
                                fontSize: "0.85rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px"
                            }}>
                                Category: {selectedCategory}
                                <span 
                                    onClick={() => handleCategoryChange("")}
                                    style={{ cursor: "pointer", fontWeight: "bold" }}
                                >
                                    ×
                                </span>
                            </div>
                        )}
                        
                        {searchQuery && (
                            <div style={{
                                background: "var(--primary-color)",
                                color: "white",
                                padding: "5px 12px",
                                borderRadius: "15px",
                                fontSize: "0.85rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px"
                            }}>
                                Search: "{searchQuery}"
                                <span 
                                    onClick={() => {
                                        setSearchQuery("");
                                        // Update URL to remove search parameter
                                        const queryParams = new URLSearchParams(location.search);
                                        queryParams.delete('search');
                                        navigate({
                                            pathname: location.pathname,
                                            search: queryParams.toString()
                                        });
                                    }}
                                    style={{ cursor: "pointer", fontWeight: "bold" }}
                                >
                                    ×
                                </span>
                            </div>
                        )}
                        
                        {(selectedCategory || searchQuery) && (
                            <button
                                onClick={() => {
                                    // Clear both category and search
                                    handleCategoryChange("");
                                    setSearchQuery("");
                                    // Clear URL parameters
                                    navigate(location.pathname);
                                }}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--primary-color)",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    fontSize: "0.85rem"
                                }}
                            >
                                Clear All
                            </button>
                        )}
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
                                <option value="stock-asc">Stock (Low to High)</option>
                                <option value="stock-desc">Stock (High to Low)</option>
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
                                        {getStockBadge(book.stock)}
                                        {getCategoryBadge(book.category)}
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
                        {searchQuery || selectedCategory ? (
                            <div>
                                <p style={{marginBottom: "20px"}}>
                                    No books found matching your criteria
                                    {searchQuery ? ` "${searchQuery}"` : ""}
                                    {selectedCategory ? ` in category "${selectedCategory}"` : ""}
                                </p>
                                <button
                                    onClick={() => {
                                        handleCategoryChange("");
                                        setSearchQuery("");
                                    }}
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
                                    Clear Filters
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