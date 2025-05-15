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

  

export default CommentApprovalPage;
