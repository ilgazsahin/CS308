import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    description: "",
    publishedYear: "",
    image: "",
    price: "",
    stock: 10,
    category: ""
  });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [message, setMessage] = useState("");
  const [stockUpdateMessage, setStockUpdateMessage] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role || role !== "product manager") {
      navigate("/unauthorized");
    }

    fetchBooks();
    fetchCategories();
  }, [navigate]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/books");
      setBooks(res.data);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/categories");
      setCategories(res.data); 
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };
  

  const handleChange = (e) => {
    setNewBook({ ...newBook, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bookToSend = {
      ...newBook,
      publishedYear: Number(newBook.publishedYear),
      price: Number(newBook.price),
      stock: Number(newBook.stock)
    };
    try {
      await axios.post("http://localhost:3001/api/books", bookToSend);
      setMessage("Book added successfully!");
      setNewBook({
        title: "",
        author: "",
        description: "",
        publishedYear: "",
        image: "",
        price: "",
        stock: 10,
        category: ""
      });
      fetchBooks();
    } catch (error) {
      setMessage("Error adding book: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (bookId) => {
    try {
      await axios.delete(`http://localhost:3001/api/books/${bookId}`);
      fetchBooks();
    } catch (err) {
      console.error("Error deleting book:", err);
    }
  };

  const handleStockChange = async (bookId, newStock) => {
    try {
      const value = parseInt(newStock);
      if (isNaN(value) || value < 0) return;
      await axios.patch(`http://localhost:3001/api/books/${bookId}/stock`, { stock: value });
      setBooks(books.map(book =>
        book._id === bookId ? { ...book, stock: value } : book
      ));
      setStockUpdateMessage("Stock updated successfully!");
      setTimeout(() => setStockUpdateMessage(""), 3000);
    } catch (err) {
      setStockUpdateMessage("Error updating stock.");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Category name cannot be empty");
      return;
    }
  
    try {
      await axios.post("http://localhost:3001/api/categories", { category: newCategory.trim() });
      setNewCategory("");
      fetchCategories();
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };
  

  const handleDeleteCategory = async (category) => {
    try {
      await axios.delete(`http://localhost:3001/api/categories/${category}`);
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const getStockStatusStyle = (stock) => {
    if (stock <= 0) return { color: "#d32f2f", fontWeight: "bold" };
    if (stock < 5) return { color: "#f57c00", fontWeight: "bold" };
    return { color: "#388e3c" };
  };

 