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

  
export default CommentManagementPage;
