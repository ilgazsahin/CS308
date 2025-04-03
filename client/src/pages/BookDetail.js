import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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

    if (!book) return <div style={styles.loading}>Loading Book Details...</div>;

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
        <div style={styles.pageContainer}>
            {/* Back Button */}
            <button onClick={() => navigate("/")} style={styles.backButton}>
                &larr; Back to Main Page
            </button>

            <div style={styles.bookContainer}>
                {/* Book Image */}
                <div style={styles.imageContainer}>
                    <img src={book.image} alt={book.title} style={styles.bookImage} />
                </div>

                {/* Book Info + Buttons */}
                <div style={styles.infoContainer}>
                    <h1 style={styles.bookTitle}>{book.title}</h1>
                    <p style={styles.authorText}>
                        <strong>Author:</strong> {book.author}
                    </p>

                    {/* Display price if available */}
                    {book.price !== undefined && (
                        <p style={styles.priceText}>
                            <strong>Price: </strong>${book.price.toFixed(2)}
                        </p>
                    )}

                    <p style={styles.description}>
                        {book.description || "No description available."}
                    </p>

                    {/* Buttons in a small row */}
                    <div style={styles.buttonRow}>
                        <button style={styles.addCartButton}>Add to Cart</button>
                        <button style={styles.secondaryButton}>Add to Wishlist</button>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div style={styles.commentsSection}>
                <h2 style={styles.commentsHeader}>Comments & Ratings</h2>

                {comments.length > 0 ? (
                    comments.map((c) => (
                        <div key={c._id} style={styles.commentCard}>
                            <p>
                                <strong>User:</strong>{" "}
                                {c.user ? c.user.name || c.user.email : "Unknown User"}
                            </p>
                            <p>
                                <strong>Comment:</strong> {c.text}
                            </p>
                            <p>
                                <strong>Rating:</strong> {c.rating}
                            </p>
                            <p style={styles.commentDate}>
                                Posted on: {new Date(c.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>No comments yet.</p>
                )}

                {/* Add new comment form */}
                <div style={styles.newCommentCard}>
                    <h3>Add a Comment</h3>
                    <form onSubmit={handleCommentSubmit}>
                        <div style={{ marginBottom: "10px" }}>
                            <label>Comment:</label>
                            <textarea
                                style={styles.commentTextArea}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                            <label>Rating (0-5): </label>
                            <input
                                type="number"
                                min="0"
                                max="5"
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                required
                                style={styles.ratingInput}
                            />
                        </div>
                        <button type="submit" style={styles.submitButton}>
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

/* --- Inline Styles for a Modern Look --- */
const styles = {
    pageContainer: {
        margin: "20px auto",
        maxWidth: "1200px",
        fontFamily: "Arial, sans-serif",
    },
    backButton: {
        marginBottom: "20px",
        padding: "8px 16px",
        backgroundColor: "#6c757d",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
    bookContainer: {
        display: "flex",
        gap: "40px",
        marginBottom: "40px",
    },
    imageContainer: {
        flex: "1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
    },
    bookImage: {
        maxWidth: "100%",
        maxHeight: "500px",
        objectFit: "cover",
    },

    /*
     * 1) Flex column so the text and buttons are stacked.
     * 2) alignItems: 'flex-start' to align text & buttons to the left.
     */
    infoContainer: {
        flex: "2",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
    },
    bookTitle: {
        fontSize: "24px",
        margin: 0,
        marginBottom: "10px",
    },
    authorText: {
        fontSize: "16px",
        marginBottom: "10px",
        color: "#555",
    },
    priceText: {
        fontSize: "18px",
        color: "#007bff",
        marginBottom: "20px",
    },
    description: {
        fontSize: "16px",
        lineHeight: "1.5",
    },

    /*
     * Flex row for the two buttons, with a gap so they aren’t stuck together.
     */
    buttonRow: {
        display: "flex",
        flexDirection: "row",
        gap: "10px",
        marginTop: "20px",
    },
    addCartButton: {
        padding: "12px 20px",
        backgroundColor: "#ff4757",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "16px",
    },
    secondaryButton: {
        padding: "12px 20px",
        backgroundColor: "#f0f0f0",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "16px",
    },

    commentsSection: {
        marginTop: "20px",
    },
    commentsHeader: {
        fontSize: "20px",
        marginBottom: "10px",
    },
    commentCard: {
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "10px",
        backgroundColor: "#fff",
    },
    commentDate: {
        fontSize: "12px",
        color: "#888",
    },
    newCommentCard: {
        marginTop: "20px",
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fafafa",
    },
    commentTextArea: {
        width: "98%",
        marginTop: "5px",
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        resize: "vertical",
    },
    ratingInput: {
        width: "60px",
        marginLeft: "5px",
        padding: "4px",
        borderRadius: "4px",
        border: "1px solid #ccc",
    },
    submitButton: {
        padding: "8px 16px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
    loading: {
        textAlign: "center",
        marginTop: "50px",
        fontSize: "18px",
    },
};

export default BookDetail;
