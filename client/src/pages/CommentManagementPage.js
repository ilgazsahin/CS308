import React, { useEffect, useState } from "react";
import axios from "axios";

const CommentManagementPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "product manager") return;

    const fetchAllComments = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/comments/all");
        setComments(res.data);
      } catch (err) {
        console.error("Error fetching comments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllComments();
  }, [role]);

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await axios.delete(`http://localhost:3001/api/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  if (role !== "product manager") {
    return <h2 style={{ padding: "100px", textAlign: "center" }}>Access Denied</h2>;
  }

  return (
    <div style={{ backgroundColor: "var(--light-bg)", minHeight: "100vh", padding: "60px 0" }}>
      <div className="container">
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "2rem",
          color: "var(--primary-color)",
          marginBottom: "30px"
        }}>
          All Comments (Admin View)
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : comments.length === 0 ? (
          <p>No comments available.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} style={{
              background: "white",
              padding: "25px",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              marginBottom: "25px"
            }}>
              <p style={{ marginBottom: "8px" }}>
                <strong>User:</strong> {comment.user?.name || "Unknown"}
              </p>
              <p style={{ marginBottom: "8px" }}>
                <strong>Book:</strong> {comment.book?.title || "Unknown"}
              </p>
              <p style={{ marginBottom: "8px" }}>
                <strong>Comment:</strong> {comment.text}
              </p>
              <p style={{ marginBottom: "8px" }}>
                <strong>Status:</strong>{" "}
                <span style={{
                  color: comment.status ? "#4caf50" : "#f57c00",
                  fontWeight: "bold"
                }}>
                  {comment.status ? "Approved" : "Pending"}
                </span>
              </p>
              <p style={{ marginBottom: "15px", color: "gray", fontSize: "0.9rem" }}>
                {new Date(comment.createdAt).toLocaleString()}
              </p>

              <button
                onClick={() => handleDelete(comment._id)}
                style={{
                  backgroundColor: "#d32f2f",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentManagementPage;
