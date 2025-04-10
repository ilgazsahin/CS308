import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import NavigationBar from "./NavigationBar";
import Footer from "../../components/Footer";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const HomePage = () => {
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function fetchBooks() {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:3001/api/books");
                // Only use real books from the database - no placeholders
                if (response.data.length > 0) {
                    setFeaturedBooks(response.data);
                    // Start at the first slide
                    setCurrentSlide(0);
                } else {
                    // Empty array if no books found
                    setFeaturedBooks([]);
                }
            } catch (error) {
                console.error("An error occurred while fetching books:", error);
                setFeaturedBooks([]);
            } finally {
                setLoading(false);
            }
        }
        fetchBooks();
    }, []);

    // Handle slider navigation - only if we have books
    const nextSlide = () => {
        if (featuredBooks.length > 0) {
            setCurrentSlide((prevSlide) => 
                prevSlide === featuredBooks.length - 1 ? 0 : prevSlide + 1
            );
        }
    };
    
    const prevSlide = () => {
        if (featuredBooks.length > 0) {
            setCurrentSlide((prevSlide) => 
                prevSlide === 0 ? featuredBooks.length - 1 : prevSlide - 1
            );
        }
    };
    
    const goToSlide = (slideIndex) => {
        if (featuredBooks.length > 0) {
            setCurrentSlide(slideIndex);
        }
    };

    // Current featured book for display
    const currentFeaturedBook = featuredBooks.length > 0 ? featuredBooks[currentSlide] : null;

    return (
        <div style={{ backgroundColor: "var(--light-bg)", minHeight: "100vh" }}>
            <NavigationBar />

            {loading ? (
                <div style={{ 
                    backgroundColor: "white", 
                    padding: "80px 0", 
                    textAlign: "center" 
                }}>
                    <div className="container">
                        <p>Loading books...</p>
                    </div>
                </div>
            ) : featuredBooks.length === 0 ? (
                <div style={{ 
                    backgroundColor: "white", 
                    padding: "80px 0", 
                    textAlign: "center" 
                }}>
                    <div className="container">
                        <h2 style={{ 
                            fontSize: "2rem", 
                            marginBottom: "1rem",
                            fontWeight: "400",
                            fontFamily: "'Playfair Display', serif",
                        }}>
                            Welcome to Booksaw
                        </h2>
                        <p style={{ marginBottom: "2rem", color: "var(--light-text)" }}>
                            No books available at the moment. Check back soon or visit our products page.
                        </p>
                        <Link 
                            to="/products" 
                            style={{
                                display: "inline-block",
                                padding: "12px 25px",
                                border: "1px solid var(--border-color)",
                                color: "var(--primary-color)",
                                textDecoration: "none",
                                fontWeight: "500",
                                transition: "all 0.3s ease"
                            }}
                        >
                            BROWSE PRODUCTS
                        </Link>
                    </div>
                </div>
            ) : (
                /* Hero Banner Section - Only show if we have books */
                <section style={{ 
                    backgroundColor: "white", 
                    padding: "80px 0", 
                    position: "relative",
                    overflow: "hidden"
                }}>
                    {/* Left arrow navigation - only if we have more than 1 book */}
                    {featuredBooks.length > 1 && (
                        <button 
                            onClick={prevSlide}
                            style={{
                                position: "absolute",
                                left: "20px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "white",
                                border: "none",
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                                zIndex: 2,
                                cursor: "pointer"
                            }}
                        >
                            <FaArrowLeft color="var(--primary-color)" />
                        </button>
                    )}

                    <div className="container" style={{ 
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        position: "relative",
                        zIndex: 1
                    }}>
                        <div style={{ maxWidth: "500px" }}>
                            <h1 style={{ 
                                fontSize: "4rem", 
                                marginBottom: "1.5rem",
                                fontWeight: "400"
                            }}>
                                {currentFeaturedBook.title}
                            </h1>
                            <p style={{ 
                                marginBottom: "2rem", 
                                lineHeight: "1.6",
                                color: "var(--light-text)"
                            }}>
                                {currentFeaturedBook.description || "No description available."}
                            </p>
                            <Link 
                                to={`/book/${currentFeaturedBook._id}`} 
                                style={{
                                    display: "inline-block",
                                    padding: "12px 25px",
                                    border: "1px solid var(--border-color)",
                                    color: "var(--primary-color)",
                                    textDecoration: "none",
                                    fontWeight: "500",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                LEARN MORE
                            </Link>
                        </div>
                        <div style={{ 
                            width: "400px", 
                            height: "500px", 
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <img 
                                src={currentFeaturedBook.image} 
                                alt={currentFeaturedBook.title} 
                                style={{ 
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)"
                                }}
                            />
                        </div>
                    </div>
                    
                    {/* Right arrow navigation - only if we have more than 1 book */}
                    {featuredBooks.length > 1 && (
                        <button 
                            onClick={nextSlide}
                            style={{
                                position: "absolute",
                                right: "20px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "white",
                                border: "none",
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                                zIndex: 2,
                                cursor: "pointer"
                            }}
                        >
                            <FaArrowRight color="var(--primary-color)" />
                        </button>
                    )}
                    
                    {/* Pagination dots for hero slider - only if we have more than 1 book */}
                    {featuredBooks.length > 1 && (
                        <div style={{ 
                            position: "absolute", 
                            bottom: "30px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            gap: "8px"
                        }}>
                            {featuredBooks.map((_, index) => (
                                <button 
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    style={{ 
                                        width: "10px", 
                                        height: "10px", 
                                        borderRadius: "50%", 
                                        background: currentSlide === index ? "var(--accent-color)" : "#ccc",
                                        border: "none",
                                        cursor: "pointer"
                                    }}
                                ></button>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Add Footer */}
            <Footer />
        </div>
    );
};

export default HomePage;
