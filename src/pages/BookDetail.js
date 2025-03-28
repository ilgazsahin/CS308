import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';

const BookDetail = () => {
  // Book ID from URL param
  const { id } = useParams();  

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
        console.error('Error fetching book details:', error);
      }
    };
    fetchBookDetail();
  }, [id]);

  // Fetch comments for this book
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/books/${id}/comments`);
        setComments(res.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
  }, [id]);

  // If no book is loaded yet, show nothing or a loader
  if (!book) return <div>Loading Book Details...</div>;

  // Handle the form submit for adding a comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    // Example: get userId from localStorage
    // In a real app, you'd decode JWT or something more secure
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("You must be logged in first!");
      return;
    }

    try {
      // POST to our new endpoint
      await axios.post(`http://localhost:3001/api/books/${id}/comments`, {
        userId,
        text,
        rating
      });

      // Clear the form
      setText("");
      setRating(0);

      // Re-fetch the comments to see the newly added one
      const res = await axios.get(`http://localhost:3001/api/books/${id}/comments`);
      setComments(res.data);

    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      {/* Book info */}
      <h1>{book.title}</h1>
      <p><strong>Author:</strong> {book.author}</p>
      <p><strong>Description:</strong> {book.description}</p>
      <img src={book.image} alt={book.title} style={{ maxWidth: "200px" }} />
      
      {/* Comments Section */}
      <div style={{ marginTop: "40px" }}>
        <h2>Comments & Ratings</h2>

        {/* List existing comments */}
        {comments.length > 0 ? (
          comments.map((c) => (
            <div 
              key={c._id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "10px"
              }}
            >
              {/* If we populated user info, show user name/email */}
              <p>
                <strong>User:</strong>{" "}
                {c.user ? c.user.name || c.user.email : "Unknown User"}
              </p>
              <p><strong>Comment:</strong> {c.text}</p>
              <p><strong>Rating:</strong> {c.rating}</p>
              <p style={{ fontSize: "12px", color: "#888" }}>
                Posted on: {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}

        {/* Add new comment form */}
        <div 
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "8px"
          }}
        >
          <h3>Add a Comment</h3>
          <form onSubmit={handleCommentSubmit}>
            <div>
              <label>Comment:</label>
              <textarea
                style={{ width: "100%", height: "60px" }}
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
            <div style={{ marginTop: "10px" }}>
              <label>Rating (0-5): </label>
              <input
                type="number"
                min="0"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
