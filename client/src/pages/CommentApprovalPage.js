import React, { useEffect, useState } from "react";
import axios from "axios";

const CommentApprovalPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "product manager") return;

    const fetchComments = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/comments/pending");
        setComments(res.data);
      } catch (err) {
        console.error("Error fetching pending comments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [role]);

  const updateStatus = async (commentId, status) => {
    try {
      await axios.patch(`http://localhost:3001/api/comments/${commentId}/status`, { status });
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      console.error("Failed to update comment", err);
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
          Pending Comments for Approval
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : comments.length === 0 ? (
          <p>No pending comments.</p>
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
              <p style={{ marginBottom: "15px", color: "gray", fontSize: "0.9rem" }}>
                {new Date(comment.createdAt).toLocaleString()}
              </p>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => updateStatus(comment._id, true)}
                  style={{
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(comment._id, false)}
                  style={{
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentApprovalPage;
