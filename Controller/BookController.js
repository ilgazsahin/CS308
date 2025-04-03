const express = require("express");
const router = express.Router();
const BookModel = require("../Models/BookModel");

// Add Book Endpoint
router.post("/", async (req, res) => {
    try {
        const newBook = await BookModel.create(req.body);
        res.status(201).json(newBook);
    } catch (err) {
        res.status(400).json({ message: "Book could not be added", error: err.message });
    }
});

// Get All Books Endpoint
router.get("/", async (req, res) => {
    try {
        const books = await BookModel.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: "Books could not be retrieved", error: err.message });
    }
});

// Get a Single Book by ID
router.get("/:id", async (req, res) => {
    try {
        const book = await BookModel.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving book", error: err.message });
    }
});


// Update a book by ID
router.put("/:id", async (req, res) => {
    try {
        const updatedBook = await BookModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedBook) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.json({ message: "Book updated successfully", book: updatedBook });
    } catch (err) {
        res.status(500).json({ message: "Error updating book", error: err.message });
    }
});


module.exports = router;
