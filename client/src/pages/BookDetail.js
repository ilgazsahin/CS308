import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import NavigationBar from "./HomePage/NavigationBar";
import Footer from "../components/Footer";
import { useCart } from "../components/CartContext";

const BookDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('orderId');
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // Book info
    const [book, setBook] = useState(null);
    // Comments list
    const [reviews, setReviews] = useState([]);
    // New comment form fields
    const [commentText, setCommentText] = useState("");
    // Button state
    const [showCheck, setShowCheck] = useState(false);
    // Purchase verification
    const [hasPurchased, setHasPurchased] = useState(false);
    const [isCheckingPurchase, setIsCheckingPurchase] = useState(true);
    // Add these state variables at the top with other state declarations
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [newRating, setNewRating] = useState(0);
    const [hasExistingComment, setHasExistingComment] = useState(false);
    const [hasExistingRating, setHasExistingRating] = useState(false);
    const [inWishlist, setInWishlist] = useState(false);

    
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

    // Define fetchReviews function
    const fetchReviews = async () => {
        try {
            const [ratingsResponse, commentsResponse] = await Promise.all([
                axios.get(`http://localhost:3001/api/ratings/book/${id}`),
                axios.get(`http://localhost:3001/api/comments/${id}`)
            ]);

            setAverageRating(ratingsResponse.data.averageRating);
            setTotalRatings(ratingsResponse.data.totalRatings);
            setReviews(commentsResponse.data.reviews);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    // Use fetchReviews in useEffect
    useEffect(() => {
        fetchReviews();
    }, [id]);

    // Check if user has purchased this book
    useEffect(() => {
        const checkPurchaseStatus = async () => {
            setIsCheckingPurchase(true);
            
            const userId = localStorage.getItem("userId");
            if (!userId) {
                setHasPurchased(false);
                setIsCheckingPurchase(false);
                return;
            }
            
            try {
                // Search through user's orders in localStorage
                let userHasPurchased = false;
                
                // Loop through localStorage to find orders for this user
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    
                    if (key.startsWith('order_')) {
                        try {
                            const orderData = JSON.parse(localStorage.getItem(key));
                            
                            // Check if this order belongs to the current user
                            if (orderData.userId === userId) {
                                // Check if this book is in the order items
                                const bookInOrder = orderData.items.some(item => item._id === id);
                                
                                if (bookInOrder) {
                                    userHasPurchased = true;
                                    break;
                                }
                            }
                        } catch (error) {
                            console.error('Error parsing order data:', error);
                        }
                    }
                }
                
                // Also check server orders API if available
                try {
                    const response = await axios.get(`http://localhost:3001/api/orders/check-purchase`, {
                        params: { userId, bookId: id }
                    });
                    
                    if (response.data.hasPurchased) {
                        userHasPurchased = true;
                    }
                } catch (error) {
                    // If server-side check fails, rely on local check
                    console.error("Error checking purchase status from server:", error);
                }
                
                setHasPurchased(userHasPurchased);
            } catch (error) {
                console.error("Error checking purchase status:", error);
            } finally {
                setIsCheckingPurchase(false);
            }
        };
        
        checkPurchaseStatus();
    }, [id]);
    useEffect(() => {
        const checkWishlist = async () => {
          const userId = localStorage.getItem("userId");
          if (!userId || !book?._id) return;
          try {
            const response = await axios.get(`http://localhost:3001/api/wishlist/${userId}`);
            const isInWishlist = response.data.some(item => item.bookId._id === book._id);
            setInWishlist(isInWishlist);
          } catch (error) {
            console.error("Error checking wishlist:", error);
          }
        };
      
        checkWishlist();
      }, [book]);
      
    // Add this useEffect to fetch ratings
    useEffect(() => {
        const fetchRatings = async () => {
            try {
                // Get average rating for the book
                const ratingRes = await axios.get(`http://localhost:3001/api/ratings/book/${id}`);
                setAverageRating(ratingRes.data.averageRating);
                setTotalRatings(ratingRes.data.totalRatings);
            } catch (error) {
                console.error("Error fetching ratings:", error);
            }
        };
        fetchRatings();
    }, [id]);

    useEffect(() => {
        setNewRating(0);
        const fetchOrderReview = async () => {
            if (!orderId) return;
            
            const userId = localStorage.getItem("userId");
            if (!userId) return;

            try {
                // Fetch rating for this specific order
                const ratingResponse = await axios.get(
                    `http://localhost:3001/api/ratings/book/${id}/order/${orderId}`
                );
                if (ratingResponse.data) {
                    setHasExistingRating(true);                // ← Rating already stored
                    setNewRating(0); 
                }

                // Fetch comment for this specific order
                const commentResponse = await axios.get(
                    `http://localhost:3001/api/comments/book/${id}/order/${orderId}`
                );
                if (commentResponse.data) {
                    setCommentText(commentResponse.data.text || '');
                }
            } catch (error) {
                console.error("Error fetching order review:", error);
            }
        };

        fetchOrderReview();
    }, [id, orderId]);

    

    useEffect(() => {
        setNewRating(0);
    }, [orderId]);   // triggers when they pick another order for the same book
    

    if (!book) return (
        <div>
            <NavigationBar />
            <div className="container" style={{textAlign: "center", padding: "100px 0"}}>
                <p>Loading Book Details...</p>
            </div>
        </div>
    );
    
    
    // Update the handleReviewSubmit function
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("userId");
        const orderId = searchParams.get('orderId');
        
        if (!userId || !orderId) {
            alert("You must be logged in and access this page from your order history.");
            return;
        }

        try {
            // Verify order status first
            const orderResponse = await axios.get(`http://localhost:3001/api/orders/${orderId}`);
            if (orderResponse.data.status.toLowerCase() !== "delivered") {
                alert("You can only review items from delivered orders.");
                return;
            }

            let ratingSubmitted = false;
            let commentSubmitted = false;
            let ratingExists = false;

            // Submit rating if provided and no existing rating
            if (newRating > 0) {
                try {
                    const ratingData = {
                        userId,
                        rating: newRating,
                        orderId
                    };
                    
                    if (!hasExistingRating) {
                        await axios.post(`http://localhost:3001/api/ratings/${id}`, ratingData);
                        ratingSubmitted = true;
                        setHasExistingRating(true);
                    } else {
                        // Rating already exists
                        ratingExists = true;
                    }
                    setNewRating(0);
                } catch (error) {
                    if (error.response?.data?.message) {
                        alert(error.response.data.message);
                        return;
                    }
                    throw error;
                }
            }

            // Submit comment if provided and no existing comment
            if (commentText.trim() && !hasExistingComment) {
                try {
                    const commentData = {
                        userId,
                        text: commentText.trim(),
                        orderId
                    };
                    
                    await axios.post(`http://localhost:3001/api/comments/${id}`, commentData);
                    commentSubmitted = true;
                    setHasExistingComment(true);
                } catch (error) {
                    if (error.response?.data?.message) {
                        alert(error.response.data.message);
                        return;
                    }
                    throw error;
                }
            }

            // Clear form
            setCommentText("");
            setNewRating(0);

            // Refresh reviews
            const response = await axios.get(`http://localhost:3001/api/comments/${id}`);
            setReviews(response.data.reviews);
            setAverageRating(response.data.averageRating);
            setTotalRatings(response.data.totalRatings);
            
            // Display appropriate message based on what was submitted
            if (ratingExists && !commentSubmitted) {
                alert("You have already submitted a rating for this book with this order.");
            } else if (commentSubmitted && ratingSubmitted) {
                alert("Thank you for your review! Your comment will be visible after approval.");
            } else if (commentSubmitted) {
                alert("Thank you for your comment! It will be visible after approval.");
            } else if (ratingSubmitted && hasExistingComment) {
                alert("Your rating has been submitted. You've already left a comment for this book.");
            } else if (ratingSubmitted) {
                alert("Thank you for your rating!");
            } else {
                alert("No changes were made to your review.");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review. Please try again.");
        }
    };

    const handleAddToCart = () => {
        // Don't allow adding to cart if out of stock
        if (!book.stock || book.stock <= 0) {
            alert("Sorry, this book is currently out of stock.");
            return;
        }
        
        // Add to cart first
        addToCart(book);
        
        // Show the check and green color
        setShowCheck(true);
        
        // Reset after animation completes (2 seconds)
        setTimeout(() => {
            setShowCheck(false);
        }, 2000);
    };

    // Helper function to display stock status
    const getStockStatus = () => {
        if (book.stock === undefined) return null;
        
        if (book.stock <= 0) {
            return (
                <div style={{
                    backgroundColor: "#fbe9e7",
                    color: "#d32f2f",
                    padding: "10px 15px",
                    borderRadius: "4px",
                    fontWeight: "500",
                    marginTop: "15px",
                    display: "inline-block"
                }}>
                    Out of Stock
                </div>
            );
        } else if (book.stock < 5) {
            return (
                <div style={{
                    backgroundColor: "#fff8e1",
                    color: "#f57c00",
                    padding: "10px 15px",
                    borderRadius: "4px",
                    fontWeight: "500",
                    marginTop: "15px",
                    display: "inline-block"
                }}>
                    Low Stock: Only {book.stock} left
                </div>
            );
        } else {
            return (
                <div style={{
                    backgroundColor: "#e8f5e9",
                    color: "#388e3c",
                    padding: "10px 15px",
                    borderRadius: "4px",
                    fontWeight: "500",
                    marginTop: "15px",
                    display: "inline-block"
                }}>
                    In Stock: {book.stock} available
                </div>
            );
        }
    };
    const handleAddToWishlist = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId || !book?._id) {
          alert("Please login to manage wishlist.");
          return;
        }
      
        try {
          if (inWishlist) {
            // Remove from wishlist
            await axios.delete(`http://localhost:3001/api/wishlist/${userId}/${book._id}`);
            alert("Removed from wishlist.");
            setInWishlist(false);
          } else {
            // Add to wishlist
            await axios.post("http://localhost:3001/api/wishlist", {
              userId,
              bookId: book._id
            });
            alert("Added to wishlist!");
            setInWishlist(true);
          }
        } catch (err) {
          console.error("Wishlist operation failed", err);
          alert("Failed to update wishlist.");
        }
      };
      
      
      
    // Only show the review form if there's an orderId in the URL
    const showReviewForm = !!searchParams.get('orderId');

    return (
        <div style={{backgroundColor: "var(--light-bg)", minHeight: "100vh"}}>
            {/* Animation style */}
            <style>
                {`
                    @keyframes fadeIn {
                        0% { opacity: 0; transform: scale(0.8); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                    
                    .add-cart-btn {
                        transition: background-color 0.4s ease;
                    }
                    
                    .add-cart-btn.added {
                        background-color: #4b6043 !important;
                    }
                    
                    .check-icon {
                        display: block;
                        width: 100%;
                        animation: fadeIn 0.4s ease-out;
                    }
                `}
            </style>
            
            <NavigationBar />

            <div className="container" style={{padding: "60px 0"}}>
                {/* Breadcrumb */}
                <div style={{marginBottom: "40px"}}>
                    <Link to="/" style={{textDecoration: "none", color: "var(--light-text)"}}>Home</Link>
                    <span style={{margin: "0 10px", color: "var(--light-text)"}}>›</span>
                    <Link to="/products" style={{textDecoration: "none", color: "var(--light-text)"}}>Products</Link>
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
                        
                        {/* Stock Status */}
                        {getStockStatus()}
                        
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
                            <button 
                                onClick={handleAddToCart}
                                disabled={!book.stock || book.stock <= 0}
                                className={`btn btn-primary add-cart-btn ${showCheck ? 'added' : ''}`}
                                style={{
                                    padding: "12px 25px",
                                    backgroundColor: !book.stock || book.stock <= 0 ? "#cccccc" : "var(--primary-color)",
                                    color: "white",
                                    border: "none",
                                    cursor: !book.stock || book.stock <= 0 ? "not-allowed" : "pointer",
                                    fontWeight: "500",
                                    fontSize: "0.9rem",
                                    position: "relative",
                                    overflow: "hidden",
                                    width: "150px"
                                }}
                            >
                                {showCheck ? (
                                    <span className="check-icon">
                                        ✓ ADDED
                                    </span>
                                ) : !book.stock || book.stock <= 0 ? "OUT OF STOCK" : "ADD TO CART"}
                            </button>
                            
                            <button
                            onClick={handleAddToWishlist}
                            className="btn"
                            style={{
                                padding: "12px 25px",
                                border: "1px solid var(--border-color)",
                                backgroundColor: "transparent",
                                color: inWishlist ? "#d32f2f" : "var(--primary-color)",
                                cursor: "pointer",
                                fontWeight: "500",
                                fontSize: "0.9rem"
                            }}
                            >
                            {inWishlist ? "REMOVE FROM WISHLIST" : "ADD TO WISHLIST"}
                            </button>

                    </div>
                </div>
            </div>

                {/* Book Rating Summary */}
                <div style={{
                    backgroundColor: "white",
                    padding: "40px",
                    marginBottom: "30px"
                }}>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.8rem",
                        marginBottom: "20px",
                        color: "var(--primary-color)"
                    }}>Ratings & Reviews</h2>
                    
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "30px"
                    }}>
                        {/* Average Rating Display */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            marginRight: "30px"
                        }}>
                            <span style={{
                                fontSize: "3rem",
                                fontWeight: "bold",
                                color: "var(--primary-color)",
                                marginRight: "15px"
                            }}>
                                {averageRating.toFixed(1)}
                            </span>
                            <div>
                                <div style={{display: "flex", marginBottom: "5px"}}>
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const fullStars = Math.floor(averageRating);
                                        const hasHalfStar = averageRating % 1 >= 0.5;
                                        
                                        if (star <= fullStars) {
                                            return (
                                                <span key={star} style={{
                                                    color: "var(--accent-color)",
                                                    fontSize: "1.2rem",
                                                    marginRight: "2px"
                                                }}>★</span>
                                            ); // Full star
                                        } else if (star === fullStars + 1 && hasHalfStar) {
                                            return (
                                                <span key={star} style={{ 
                                                    position: "relative",
                                                    fontSize: "1.2rem",
                                                    marginRight: "2px"
                                                }}>
                                                    <span style={{ color: "#ddd" }}>☆</span>
                                                    <span style={{ 
                                                        position: "absolute", 
                                                        left: 0,
                                                        top: 0,
                                                        width: "50%",
                                                        overflow: "hidden",
                                                        color: "var(--accent-color)"
                                                    }}>★</span>
                                                </span>
                                            ); // Half star
                                        } else {
                                            return (
                                                <span key={star} style={{
                                                    color: "#ddd",
                                                    fontSize: "1.2rem",
                                                    marginRight: "2px"
                                                }}>☆</span>
                                            ); // Empty star
                                        }
                                    })}
                                </div>
                                <span style={{color: "var(--light-text)", fontSize: "0.9rem"}}>
                                    {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Review Form */}
                    {showReviewForm && (
                        <form onSubmit={handleReviewSubmit}>
                            {showReviewForm && (
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
                                                onClick={() => setNewRating(star)}
                                                style={{
                                                    color: star <= newRating ? "var(--accent-color)" : "#ddd",
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
                            )}
                            
                            {!hasExistingComment && (
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
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
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
                            )}

                            {(!hasExistingComment || !hasExistingRating) && (
                                <button 
                                    type="submit"
                                    style={{
                                        backgroundColor: "var(--primary-color)",
                                        color: "white",
                                        padding: "12px 25px",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontWeight: "500"
                                    }}
                                >
                                    Submit Review
                                </button>
                            )}
                        </form>
                    )}
                </div>

                {/* Reviews List */}
                <div style={{backgroundColor: "white", padding: "40px"}}>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.8rem",
                        marginBottom: "30px",
                        color: "var(--primary-color)"
                    }}>Reviews ({reviews.length})</h2>

                    {reviews.length > 0 ? (
                        <div style={{marginBottom: "50px"}}>
                            {reviews.map((review) => (
                                <div key={review._id} style={{
                                    borderBottom: "1px solid var(--border-color)",
                                    paddingBottom: "20px",
                                    marginBottom: "20px"
                                }}>
                                    <div style={{display: "flex", justifyContent: "space-between", marginBottom: "10px"}}>
                                        <p style={{fontWeight: "500", color: "var(--primary-color)"}}>
                                            {review.user.name || review.user.email}
                                        </p>
                                        <p style={{color: "var(--light-text)", fontSize: "0.9rem"}}>
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    
                                    {review.rating && (
                                        <div style={{display: "flex", marginBottom: "10px"}}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span key={star} style={{
                                                    color: star <= review.rating ? "var(--accent-color)" : "#ddd",
                                                    marginRight: "5px",
                                                    fontSize: "1.2rem"
                                                }}>★</span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {review.text && (
                                        <p style={{lineHeight: "1.6", color: "var(--text-color)"}}>{review.text}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No reviews yet. Be the first to review this book!</p>
                    )}
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default BookDetail;