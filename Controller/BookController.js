const express = require("express");
const router = express.Router();
const BookModel = require("../Models/BookModel");
const WishlistModel = require("../Models/WishListModel");
const UserModel = require("../Models/UserModel");

const { sendDiscountNotification } = require("../utils/emailService");
  
// Get All Categories - Moving this route before the ID route to avoid path conflicts
router.get("/categories", async (req, res) => {
    try {
        // Extract categories from the model's schema
        const categories = BookModel.schema.path('category').enumValues;
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: "Categories could not be retrieved", error: err.message });
    }
});

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
        const { category } = req.query;
        const filter = {};
        
        // Add category filter if provided
        if (category) {
            filter.category = category;
        }
        
        const books = await BookModel.find(filter);
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
// Update book price (sales manager)
router.patch("/:id/price", async (req, res) => {
    try {
      const { price } = req.body;
  
      if (price === undefined || isNaN(price)) {
        return res.status(400).json({ message: "Invalid price value" });
      }
  
      const book = await BookModel.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      book.price = Number(price);
      await book.save();
  
      res.json({ message: "Price updated successfully", book });
    } catch (err) {
      res.status(500).json({ message: "Error updating price", error: err.message });
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


// Apply discount to selected books
router.patch("/discount", async (req, res) => {
    try {
      const { bookIds, discountRate } = req.body;
  
      if (!Array.isArray(bookIds) || typeof discountRate !== "number") {
        return res.status(400).json({ message: "Invalid input data" });
      }
  
      const updates = [];
  
      for (const id of bookIds) {
        const book = await BookModel.findById(id);
        if (!book) continue;
  
        const originalPrice = book.price;
        const newPrice = Number((originalPrice * (1 - discountRate / 100)).toFixed(2));
        book.price = newPrice;
        await book.save();
  
        updates.push({ id, title: book.title, originalPrice, newPrice });
      }
  
      // Yanıtı hemen gönder
      res.json({ message: "Discount applied successfully", updates });
  
      // E-postaları arkada gönder
      (async () => {
        try {
          const wishlistEntries = await WishlistModel.find({
            bookId: { $in: bookIds }
          }).populate("userId").populate("bookId");
  
          for (const entry of wishlistEntries) {
            if (entry.userId?.email && entry.bookId?.title && entry.bookId?.price) {
              await sendDiscountNotification({
                to: entry.userId.email,
                name: entry.userId.name,
                title: entry.bookId.title,
                newPrice: entry.bookId.price
              });
            }
          }
        } catch (emailError) {
          console.error("Error sending discount emails:", emailError);
        }
      })();
  
    } catch (err) {
      console.error("Error applying discount:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
});
// DELETE /api/books/:id
router.delete("/:id", async (req, res) => {
    try {
      const deleted = await BookModel.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json({ message: "Book deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting book", error: err.message });
    }
  });

router.post("/categories", async (req, res) => {
  const { name } = req.body;
  try {
    const exists = await CategoryModel.findOne({ name });
    if (exists) return res.status(400).json({ message: "Category already exists" });

    const newCategory = new CategoryModel({ name });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ message: "Error adding category", error: err.message });
  }
});
  
// DELETE /api/categories/:name
router.delete("/categories/:name", async (req, res) => {
    try {
      const result = await CategoryModel.findOneAndDelete({ name: req.params.name });
      if (!result) return res.status(404).json({ message: "Category not found" });
      res.json({ message: "Category deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting category", error: err.message });
    }
  });
  
module.exports = router;
