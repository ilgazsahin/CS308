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

// Update book stock quantity
router.patch("/:id/stock", async (req, res) => {
    try {
        const { stock } = req.body;
        
        if (stock === undefined) {
            return res.status(400).json({ message: "Stock quantity is required" });
        }
        
        const book = await BookModel.findById(req.params.id);
        
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        
        book.stock = stock;
        await book.save();
        
        res.json({ message: "Stock updated successfully", stock: book.stock });
    } catch (err) {
        res.status(500).json({ message: "Error updating stock", error: err.message });
    }
});

// Decrease stock when items are purchased
router.post("/decrease-stock", async (req, res) => {
    try {
        const { items } = req.body;
        
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: "Items array is required" });
        }
        
        const updates = [];
        const errors = [];
        
        // Process each item in the order
        for (const item of items) {
            try {
                const book = await BookModel.findById(item._id);
                
                if (!book) {
                    errors.push({ id: item._id, error: "Book not found" });
                    continue;
                }
                
                // Check if we have enough stock
                if (book.stock < item.quantity) {
                    errors.push({ 
                        id: item._id, 
                        title: book.title,
                        error: "Insufficient stock", 
                        requested: item.quantity, 
                        available: book.stock 
                    });
                    continue;
                }
                
                // Decrease the stock
                book.stock -= item.quantity;
                await book.save();
                
                updates.push({ 
                    id: item._id, 
                    title: book.title,
                    newStock: book.stock 
                });
            } catch (err) {
                errors.push({ id: item._id, error: err.message });
            }
        }
        
        // If any errors occurred, return them with the update info
        if (errors.length > 0) {
            return res.status(errors.length === items.length ? 400 : 207).json({
                message: "Some stock updates failed",
                updates,
                errors
            });
        }
        
        res.json({ message: "Stock updated successfully", updates });
    } catch (err) {
        res.status(500).json({ message: "Error updating stock", error: err.message });
    }
});

module.exports = router;
