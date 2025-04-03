import React, { useState } from "react";
import axios from "axios";

function AddBook() {
  const [book, setBook] = useState({
    title: "",
    author: "",
    description: "",
    publishedYear: "",
    image: null
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Gönderilen kitap:", book); // 🛠 Konsolda bak!
  
    try {
      const response = await axios.post("http://localhost:3001/books", book);
      setMessage(response.data.message);
      setBook({ title: "", author: "", description: "", publishedYear: "", image: "" }); // image'ı da sıfırla
    } catch (error) {
      setMessage("Error adding book: " + error.response?.data?.message || error.message);
    }
  };
  

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Add Book</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Title" value={book.title} onChange={handleChange} required style={{ width: "100%", marginBottom: "10px", padding: "8px" }} />
        <input type="text" name="author" placeholder="Author" value={book.author} onChange={handleChange} required style={{ width: "100%", marginBottom: "10px", padding: "8px" }} />
        <textarea name="description" placeholder="Description" value={book.description} onChange={handleChange} style={{ width: "100%", marginBottom: "10px", padding: "8px" }} />

        <input type="number" name="publishedYear" placeholder="Published Year" value={book.publishedYear} onChange={handleChange} style={{ width: "100%", marginBottom: "10px", padding: "8px" }} />
        <input name="image" placeholder="image" value={book.image} onChange={handleChange} style={{ width: "100%", marginBottom: "10px", padding: "8px" }} />

        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }}>Add Book</button>
      </form>
    </div>
  );
}

export default AddBook;
