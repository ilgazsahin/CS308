import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import NavigationBar from "./NavigationBar";


const HomePage = () => {
    const [books, setBooks] = useState([]);

    // For pagination
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 10;
    const totalPages = Math.ceil(books.length / booksPerPage);
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

    useEffect(() => {
        async function fetchBooks() {
            try {
                const response = await axios.get("http://localhost:3001/api/books");
                setBooks(response.data);
            } catch (error) {
                console.error("An error occurred while fetching books:", error);
            }
        }
        fetchBooks();
    }, []);

    return (
        <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <NavigationBar />

            <div style={{ textAlign: "center", padding: "40px 20px", marginTop: "20px" }}>
                <h2 style={{ marginBottom: "30px", fontSize: "24px" }}>Explore Our Books</h2>

                {/* Book grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "30px",
                        maxWidth: "1200px",
                        margin: "0 auto",
                    }}
                >
                    {currentBooks.map((book) => (
                        <Link
                            to={`/book/${book._id}`}
                            key={book._id}
                            style={{
                                textDecoration: "none",
                                color: "inherit",
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: "#fff",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                    overflow: "hidden",
                                    transition: "transform 0.2s",
                                    cursor: "pointer",
                                }}
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        height: "220px",
                                        backgroundColor: "#f0f0f0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        overflow: "hidden",
                                    }}
                                >
                                    <img
                                        src={book.image}
                                        alt={book.title}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                            objectFit: "cover",
                                            transition: "transform 0.3s",
                                        }}
                                    />
                                </div>
                                <div style={{ padding: "15px" }}>
                                    <h3
                                        style={{
                                            fontSize: "16px",
                                            margin: "10px 0",
                                            textAlign: "left",
                                            color: "#333",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {book.title}
                                    </h3>
                                    {/*
                    If you have additional info like author or price, you can display it here.
                    Example:
                    <p style={{ fontSize: "14px", color: "#777", textAlign: "left" }}>
                      by {book.author}
                    </p>
                    <p style={{ fontSize: "14px", fontWeight: "bold", textAlign: "left" }}>
                      ${book.price}
                    </p>
                  */}
                                    <div
                                        style={{
                                            textAlign: "left",
                                            marginTop: "10px",
                                        }}
                                    >
                                        <button
                                            style={{
                                                backgroundColor: "#007bff",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "4px",
                                                padding: "8px 12px",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                            }}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Pagination */}
                <div style={{ marginTop: "30px" }}>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{
                            marginRight: "10px",
                            padding: "8px 16px",
                            backgroundColor: "#6c757d",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        }}
                    >
                        Previous
                    </button>
                    <span style={{ margin: "0 15px" }}>
            Page {currentPage} of {totalPages}
          </span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{
                            marginLeft: "10px",
                            padding: "8px 16px",
                            backgroundColor: "#6c757d",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        }}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
