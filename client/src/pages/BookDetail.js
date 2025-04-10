import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Book info
    const [book, setBook] = useState(null);
    // Comments list
    const [comments, setComments] = useState([]);
    // New comment form fields
    const [text, setText] = useState("");
    const [rating, setRating] = useState(0);

    // Fetch the book details on mount/update
    useEffect(() => {
        const fetchBookDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/books/${id}`);
                setBook(response.data);
            } catch (error) {
                console.error("Error fetching book details:", error);
            }
        };
        fetchBookDetail();
    }, [id]);

    // Fetch comments for this book
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/api/comments/${id}`);
                setComments(res.data);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };
        fetchComments();
    }, [id]);

    if (!book) return (
        <div>
            <NavigationBar />
            <div className="container" style={{textAlign: "center", padding: "100px 0"}}>
                <p>Loading Book Details...</p>
            </div>
        </div>
    );

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        // Get userId from localStorage
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("You must be logged in first!");
            return;
        }

        // Ensure rating is sent as a number
        const numericRating = parseInt(rating, 10);

        try {
            await axios.post(`http://localhost:3001/api/comments/${id}`, {
                userId,
                text,
                rating: numericRating,  // Ensure it's a number
            });

            setText("");
            setRating(0);

            // Refresh comments after adding a new one
            const res = await axios.get(`http://localhost:3001/api/comments/${id}`);
            setComments(res.data);
        } catch (error) {
            console.error("Error adding comment:", error);
            alert("Failed to submit comment. Please try again.");
        }
    };

    return (
        <div style={{backgroundColor: "var(--light-bg)", minHeight: "100vh"}}>
            <NavigationBar />
            
            <div className="container" style={{padding: "60px 0"}}>
                {/* Breadcrumb */}
                <div style={{marginBottom: "40px"}}>
                    <Link to="/" style={{textDecoration: "none", color: "var(--light-text)"}}>Home</Link>
                    <span style={{margin: "0 10px", color: "var(--light-text)"}}>›</span>
                    <Link to="/shop" style={{textDecoration: "none", color: "var(--light-text)"}}>Shop</Link>
                    <span style={{margin: "0 10px", color: "var(--light-text)"}}>›</span>
                    <span style={{color: "var(--primary-color)"}}>{book.title}</span>
                </div>
                
                <div style={{
                    display: "flex", 
                    gap: "60px",
                    backgroundColor: "white",
                    padding: "40px",
                    marginBottom: "60px"
                }}>
                    {/* Book Image */}
                    <div style={{flex: "1"}}>
                        <div style={{
                            backgroundColor: "#f8f8f8", 
                            height: "500px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <img 
                                src={book.image} 
                                alt={book.title} 
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain"
                                }} 
                            />
                        </div>
                    </div>

                    {/* Book Info */}
                    <div style={{flex: "1"}}>
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "2.5rem",
                            fontWeight: "500",
                            marginBottom: "20px",
                            color: "var(--primary-color)"
                        }}>{book.title}</h1>
                        
                        <p style={{
                            fontSize: "1.5rem",
                            fontWeight: "500",
                            marginBottom: "20px",
                            color: "var(--accent-color)"
                        }}>${book.price ? book.price.toFixed(2) : "35.00"}</p>
                        
                        <p style={{
                            fontSize: "1rem",
                            color: "var(--light-text)",
                            marginBottom: "10px"
                        }}><strong>Author:</strong> {book.author}</p>
                        
                        {book.publishedYear && (
                            <p style={{
                                fontSize: "1rem",
                                color: "var(--light-text)",
                                marginBottom: "10px"
                            }}><strong>Published:</strong> {book.publishedYear}</p>
                        )}
                        
                        <div style={{
                            width: "40px",
                            height: "3px",
                            backgroundColor: "var(--accent-color)",
                            margin: "20px 0"
                        }}></div>
                        
                        <p style={{
                            lineHeight: "1.7",
                            color: "var(--text-color)",
                            marginBottom: "30px"
                        }}>{book.description || "No description available."}</p>
                        
                        <div style={{display: "flex", gap: "15px", marginTop: "30px"}}>
                            <button className="btn btn-primary" style={{
                                padding: "12px 25px",
                                backgroundColor: "var(--primary-color)",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: "500",
                                fontSize: "0.9rem"
                            }}>ADD TO CART</button>
                            
                            <button className="btn" style={{
                                padding: "12px 25px",
                                border: "1px solid var(--border-color)",
                                backgroundColor: "transparent",
                                color: "var(--primary-color)",
                                cursor: "pointer",
                                fontWeight: "500",
                                fontSize: "0.9rem"
                            }}>ADD TO WISHLIST</button>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div style={{backgroundColor: "white", padding: "40px"}}>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.8rem",
                        marginBottom: "30px",
                        color: "var(--primary-color)"
                    }}>Reviews ({comments.length})</h2>

                    {comments.length > 0 ? (
                        <div style={{marginBottom: "50px"}}>
                            {comments.map((c) => (
                                <div key={c._id} style={{
                                    borderBottom: "1px solid var(--border-color)",
                                    paddingBottom: "20px",
                                    marginBottom: "20px"
                                }}>
                                    <div style={{display: "flex", justifyContent: "space-between", marginBottom: "10px"}}>
                                        <p style={{fontWeight: "500", color: "var(--primary-color)"}}>
                                            {c.user ? c.user.name || c.user.email : "Anonymous"}
                                        </p>
                                        <p style={{color: "var(--light-text)", fontSize: "0.9rem"}}>
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    
                                    <div style={{display: "flex", marginBottom: "10px"}}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span key={star} style={{
                                                color: star <= c.rating ? "var(--accent-color)" : "#ddd",
                                                marginRight: "5px",
                                                fontSize: "1.2rem"
                                            }}>★</span>
                                        ))}
                                    </div>
                                    
                                    <p style={{lineHeight: "1.6", color: "var(--text-color)"}}>{c.text}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{marginBottom: "40px", color: "var(--light-text)"}}>No reviews yet. Be the first to review this book!</p>
                    )}

                    {/* Add Review Form */}
                    <div>
                        <h3 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "1.4rem",
                            marginBottom: "20px",
                            color: "var(--primary-color)"
                        }}>Add a Review</h3>
                        
                        <form onSubmit={handleCommentSubmit}>
                            <div style={{marginBottom: "20px"}}>
                                <label style={{
                                    display: "block", 
                                    marginBottom: "10px",
                                    color: "var(--primary-color)",
                                    fontWeight: "500"
                                }}>
                                    Your Rating
                                </label>
                                <div style={{display: "flex", marginBottom: "10px"}}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            type="button"
                                            key={star} 
                                            onClick={() => setRating(star)}
                                            style={{
                                                color: star <= rating ? "var(--accent-color)" : "#ddd",
                                                marginRight: "5px",
                                                fontSize: "1.5rem",
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer"
                                            }}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div style={{marginBottom: "20px"}}>
                                <label style={{
                                    display: "block", 
                                    marginBottom: "10px",
                                    color: "var(--primary-color)",
                                    fontWeight: "500"
                                }}>
                                    Your Review
                                </label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "15px",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: "4px",
                                        height: "150px",
                                        resize: "vertical"
                                    }}
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                style={{
                                    padding: "12px 25px",
                                    backgroundColor: "var(--primary-color)",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: "500",
                                    fontSize: "0.9rem"
                                }}
                            >
                                SUBMIT REVIEW
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default BookDetail;
