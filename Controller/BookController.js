const express = require("express");
const router = express.Router();
const BookModel = require("../Models/BookModel");
const CategoryModel = require("../Models/CategoryModel");
const Wishlist = require("../Models/WishListModel");
const UserModel = require("../Models/UserModel");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'store26order@gmail.com',
    pass: 'eaic gidj ilup hori' // App password
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
        
        const books = await BookModel.find(filter).populate('category');
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: "Books could not be retrieved", error: err.message });
    }
});

// Apply discount to a book and notify users who have it in their wishlists
router.put("/discount", async (req, res) => {
    try {
        const { bookId, originalPrice, discountRate, newPrice, sendNotifications } = req.body;
        
        if (!bookId || !originalPrice || !discountRate || !newPrice) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        // Update the book with the new price
        const updatedBook = await BookModel.findByIdAndUpdate(
            bookId,
            { price: newPrice },
            { new: true }
        ).populate('category');
        
        if (!updatedBook) {
            return res.status(404).json({ message: "Book not found" });
        }
        
        // If sendNotifications is true, notify users who have this book in their wishlist
        if (sendNotifications) {
            // Find all wishlist entries for this book
            const wishlistEntries = await Wishlist.find({ bookId }).populate('userId');
            
            if (wishlistEntries.length > 0) {
                const notifiedUsers = [];
                
                // Send emails to each user
                for (const entry of wishlistEntries) {
                    if (entry.userId && entry.userId.email) {
                        const user = entry.userId;
                        
                        // Prevent duplicate emails to the same user
                        if (notifiedUsers.includes(user.email)) {
                            continue;
                        }
                        
                        // Send discount notification email
                        await transporter.sendMail({
                            from: '"STORE 26" <store26order@gmail.com>',
                            to: user.email,
                            subject: `Special Discount on ${updatedBook.title}!`,
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                                    <h2 style="color: #4a4a4a; text-align: center;">Special Discount Alert!</h2>
                                    <p>Hello ${user.name || 'Valued Customer'},</p>
                                    <p>Good news! A book in your wishlist is now on sale:</p>
                                    
                                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; display: flex; align-items: center;">
                                        <div style="margin-right: 15px;">
                                            <img src="${updatedBook.image}" alt="${updatedBook.title}" style="width: 80px; height: 120px; object-fit: cover; border-radius: 3px;">
                                        </div>
                                        <div>
                                            <h3 style="margin: 0 0 10px 0; color: #333;">${updatedBook.title}</h3>
                                            <p style="margin: 0; color: #666;">by ${updatedBook.author}</p>
                                            <p style="margin: 10px 0 0 0; font-size: 1.1em;">
                                                <span style="text-decoration: line-through; color: #999;">$${originalPrice.toFixed(2)}</span>
                                                <span style="color: #e53935; font-weight: bold; margin-left: 10px;">$${newPrice.toFixed(2)}</span>
                                                <span style="background-color: #e53935; color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.8em; margin-left: 10px;">${discountRate}% OFF</span>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <p>Don't miss out on this limited-time offer! Visit your wishlist to purchase this book at its discounted price.</p>
                                    
                                    <div style="text-align: center; margin-top: 25px;">
                                        <a href="http://localhost:3000/wishlist" style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Your Wishlist</a>
                                    </div>
                                    
                                    <p style="margin-top: 30px; font-size: 0.9em; color: #666; text-align: center;">
                                        Thank you for shopping with STORE 26!
                                    </p>
                                </div>
                            `
                        });
                        
                        notifiedUsers.push(user.email);
                    }
                }
                
                res.json({ 
                    message: "Discount applied and notifications sent", 
                    book: updatedBook,
                    notifiedUsers: notifiedUsers.length
                });
            } else {
                res.json({ 
                    message: "Discount applied, but no users to notify", 
                    book: updatedBook 
                });
            }
        } else {
            res.json({ 
                message: "Discount applied successfully", 
                book: updatedBook 
            });
        }
    } catch (err) {
        console.error("Error applying discount:", err);
        res.status(500).json({ message: "Error applying discount", error: err.message });
    }
});

// Apply bulk discount to multiple books at once
router.put("/bulk-discount", async (req, res) => {
    try {
        const { bookIds, discountRate, sendNotifications } = req.body;
        
        if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0 || !discountRate) {
            return res.status(400).json({ message: "Book IDs array and discount rate are required" });
        }
        
        const updatedBooks = [];
        const failedBooks = [];
        const notifiedUsers = new Set();
        const discountRateNum = parseInt(discountRate, 10);
        
        console.log(`Processing discount of ${discountRateNum}% for ${bookIds.length} books`);
        
        // Process each book
        for (const bookId of bookIds) {
            try {
                console.log(`Processing book ID: ${bookId}`);
                
                // Validate bookId is a valid MongoDB ObjectId
                if (!mongoose.Types.ObjectId.isValid(bookId)) {
                    console.log(`Invalid book ID format: ${bookId}`);
                    failedBooks.push({ bookId, reason: "Invalid book ID format" });
                    continue;
                }
                
                // Get the book to calculate the new price
                const book = await BookModel.findById(bookId);
                
                if (!book) {
                    console.log(`Book not found: ${bookId}`);
                    failedBooks.push({ bookId, reason: "Book not found" });
                    continue;
                }
                
                if (!book.price) {
                    console.log(`Book has no price set: ${bookId}`);
                    failedBooks.push({ bookId, reason: "No price set" });
                    continue;
                }
                
                const originalPrice = book.price;
                const discountAmount = (originalPrice * discountRateNum) / 100;
                const newPrice = parseFloat((originalPrice - discountAmount).toFixed(2));
                
                console.log(`Book ${book.title}: Original price: $${originalPrice}, New price: $${newPrice}`);
                
                // Update the book with the new price using findOneAndUpdate for better error handling
                try {
                    // Use save method directly on the book document
                    book.price = newPrice;
                    await book.save();
                    
                    // Fetch the updated book with populated category
                    const updatedBook = await BookModel.findById(bookId).populate('category');
                    
                    updatedBooks.push({
                        book: updatedBook,
                        originalPrice,
                        newPrice
                    });
                    
                    console.log(`Successfully updated price for book: ${book.title}`);
                } catch (updateError) {
                    console.error(`Error updating book ${bookId}:`, updateError);
                    failedBooks.push({ bookId, reason: `Update error: ${updateError.message}` });
                    continue;
                }
                
                // If sendNotifications is true, notify users who have this book in their wishlist
                if (sendNotifications) {
                    try {
                        // Get the updated book with all fields
                        const updatedBookData = await BookModel.findById(bookId);
                        
                        console.log(`Finding users with book ${updatedBookData.title} in their wishlist`);
                        
                        // Use a simpler approach - get all wishlist entries directly from MongoDB
                        const wishlistEntries = await mongoose.connection.collection('wishlists').find({
                            bookId: new mongoose.Types.ObjectId(bookId)
                        }).toArray();
                        
                        console.log(`Found ${wishlistEntries.length} wishlist entries for book ${bookId}`);
                        
                        if (wishlistEntries && wishlistEntries.length > 0) {
                            // Get unique user IDs
                            const userIds = [...new Set(wishlistEntries.map(entry => entry.userId))];
                            console.log(`Found ${userIds.length} unique users with this book in their wishlist`);
                            
                            // Get user details
                            for (const userId of userIds) {
                                try {
                                    const user = await UserModel.findById(userId);
                                    
                                    if (!user || !user.email) {
                                        console.log(`No valid user found for ID: ${userId}`);
                                        continue;
                                    }
                                    
                                    // Prevent duplicate emails to the same user
                                    if (notifiedUsers.has(user.email)) {
                                        console.log(`User ${user.email} already notified about a discount`);
                                        continue;
                                    }
                                    
                                    console.log(`Sending discount notification to ${user.email} for book ${updatedBookData.title}`);
                                    
                                    // Send discount notification email
                                    await transporter.sendMail({
                                        from: '"STORE 26" <store26order@gmail.com>',
                                        to: user.email,
                                        subject: `Special Discount on ${updatedBookData.title}!`,
                                        html: `
                                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                                                <h2 style="color: #4a4a4a; text-align: center;">Special Discount Alert!</h2>
                                                <p>Hello ${user.name || 'Valued Customer'},</p>
                                                <p>Good news! A book in your wishlist is now on sale:</p>
                                                
                                                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; display: flex; align-items: center;">
                                                    <div style="margin-right: 15px;">
                                                        <img src="${updatedBookData.image}" alt="${updatedBookData.title}" style="width: 80px; height: 120px; object-fit: cover; border-radius: 3px;">
                                                    </div>
                                                    <div>
                                                        <h3 style="margin: 0 0 10px 0; color: #333;">${updatedBookData.title}</h3>
                                                        <p style="margin: 0; color: #666;">by ${updatedBookData.author}</p>
                                                        <p style="margin: 10px 0 0 0; font-size: 1.1em;">
                                                            <span style="text-decoration: line-through; color: #999;">$${originalPrice.toFixed(2)}</span>
                                                            <span style="color: #e53935; font-weight: bold; margin-left: 10px;">$${newPrice.toFixed(2)}</span>
                                                            <span style="background-color: #e53935; color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.8em; margin-left: 10px;">${discountRateNum}% OFF</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <p>Don't miss out on this limited-time offer! Visit your wishlist to purchase this book at its discounted price.</p>
                                                
                                                <div style="text-align: center; margin-top: 25px;">
                                                    <a href="http://localhost:3000/wishlist" style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Your Wishlist</a>
                                                </div>
                                                
                                                <p style="margin-top: 30px; font-size: 0.9em; color: #666; text-align: center;">
                                                    Thank you for shopping with STORE 26!
                                                </p>
                                            </div>
                                        `
                                    });
                                    
                                    notifiedUsers.add(user.email);
                                } catch (userError) {
                                    console.error(`Error processing user ${userId}:`, userError);
                                }
                            }
                        } else {
                            console.log(`No users have book ${updatedBookData.title} in their wishlist`);
                        }
                    } catch (notifyError) {
                        console.error(`Error sending notifications for book ${bookId}:`, notifyError);
                        // We'll continue processing other books even if notifications fail for one book
                    }
                }
            } catch (error) {
                console.error(`Error processing book ${bookId}:`, error);
                failedBooks.push({ bookId, reason: error.message });
            }
        }
        
        res.json({
            success: true,
            message: `Discount of ${discountRateNum}% applied to ${updatedBooks.length} books`,
            updatedBooks,
            failedBooks,
            notifiedUsers: notifiedUsers.size
        });
    } catch (err) {
        console.error("Error applying bulk discount:", err);
        res.status(500).json({ 
            success: false,
            message: "Error applying bulk discount", 
            error: err.message 
        });
    }
});

// Get a Single Book by ID
router.get("/:id", async (req, res) => {
    try {
        const book = await BookModel.findById(req.params.id).populate('category');
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
        ).populate('category');
        if (!updatedBook) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.json({ message: "Book updated successfully", book: updatedBook });
    } catch (err) {
        res.status(500).json({ message: "Error updating book", error: err.message });
    }
});

// Delete a book by ID
router.delete("/:id", async (req, res) => {
    try {
        console.log(`Attempting to delete book with ID: ${req.params.id}`);
        const deletedBook = await BookModel.findByIdAndDelete(req.params.id);
        
        if (!deletedBook) {
            console.log(`Book with ID ${req.params.id} not found`);
            return res.status(404).json({ message: "Book not found" });
        }
        
        console.log(`Book deleted successfully: ${deletedBook.title}`);
        res.json({ 
            message: "Book deleted successfully", 
            book: deletedBook 
        });
    } catch (err) {
        console.error(`Error deleting book: ${err.message}`);
        res.status(500).json({ message: "Error deleting book", error: err.message });
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

// Add a new POST endpoint for applying discounts
router.post("/apply-discount", async (req, res) => {
    try {
        const { bookIds, discountRate, sendNotifications } = req.body;
        
        if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0 || !discountRate) {
            return res.status(400).json({ message: "Book IDs array and discount rate are required" });
        }
        
        const updatedBooks = [];
        const failedBooks = [];
        const notifiedUsers = new Set();
        const discountRateNum = parseInt(discountRate, 10);
        
        console.log(`Processing discount of ${discountRateNum}% for ${bookIds.length} books`);
        
        // Process each book
        for (const bookId of bookIds) {
            try {
                console.log(`Processing book ID: ${bookId}`);
                
                // Validate bookId is a valid MongoDB ObjectId
                if (!mongoose.Types.ObjectId.isValid(bookId)) {
                    console.log(`Invalid book ID format: ${bookId}`);
                    failedBooks.push({ bookId, reason: "Invalid book ID format" });
                    continue;
                }
                
                // Get the book to calculate the new price
                const book = await BookModel.findById(bookId);
                
                if (!book) {
                    console.log(`Book not found: ${bookId}`);
                    failedBooks.push({ bookId, reason: "Book not found" });
                    continue;
                }
                
                if (!book.price) {
                    console.log(`Book has no price set: ${bookId}`);
                    failedBooks.push({ bookId, reason: "No price set" });
                    continue;
                }
                
                const originalPrice = book.price;
                const discountAmount = (originalPrice * discountRateNum) / 100;
                const newPrice = parseFloat((originalPrice - discountAmount).toFixed(2));
                
                console.log(`Book ${book.title}: Original price: $${originalPrice}, New price: $${newPrice}`);
                
                // Update the book with the new price using findOneAndUpdate for better error handling
                try {
                    // Use save method directly on the book document
                    book.price = newPrice;
                    await book.save();
                    
                    // Fetch the updated book with populated category
                    const updatedBook = await BookModel.findById(bookId).populate('category');
                    
                    updatedBooks.push({
                        book: updatedBook,
                        originalPrice,
                        newPrice
                    });
                    
                    console.log(`Successfully updated price for book: ${book.title}`);
                } catch (updateError) {
                    console.error(`Error updating book ${bookId}:`, updateError);
                    failedBooks.push({ bookId, reason: `Update error: ${updateError.message}` });
                    continue;
                }
                
                // If sendNotifications is true, notify users who have this book in their wishlist
                if (sendNotifications) {
                    try {
                        // Get the updated book with all fields
                        const updatedBookData = await BookModel.findById(bookId);
                        
                        console.log(`Finding users with book ${updatedBookData.title} in their wishlist`);
                        
                        // Use a simpler approach - get all wishlist entries directly from MongoDB
                        const wishlistEntries = await mongoose.connection.collection('wishlists').find({
                            bookId: new mongoose.Types.ObjectId(bookId)
                        }).toArray();
                        
                        console.log(`Found ${wishlistEntries.length} wishlist entries for book ${bookId}`);
                        
                        if (wishlistEntries && wishlistEntries.length > 0) {
                            // Get unique user IDs
                            const userIds = [];
                            for (const entry of wishlistEntries) {
                                if (entry.userId && !userIds.includes(entry.userId.toString())) {
                                    userIds.push(entry.userId.toString());
                                }
                            }
                            console.log(`Found ${userIds.length} unique users with this book in their wishlist`);
                            
                            // Get user details
                            for (const userId of userIds) {
                                try {
                                    const user = await UserModel.findById(userId);
                                    
                                    if (!user || !user.email) {
                                        console.log(`No valid user found for ID: ${userId}`);
                                        continue;
                                    }
                                    
                                    // Prevent duplicate emails to the same user
                                    if (notifiedUsers.has(user.email)) {
                                        console.log(`User ${user.email} already notified about a discount`);
                                        continue;
                                    }
                                    
                                    console.log(`Sending discount notification to ${user.email} for book ${updatedBookData.title}`);
                                    
                                    // Send discount notification email
                                    await transporter.sendMail({
                                        from: '"STORE 26" <store26order@gmail.com>',
                                        to: user.email,
                                        subject: `Special Discount on ${updatedBookData.title}!`,
                                        html: `
                                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                                                <h2 style="color: #4a4a4a; text-align: center;">Special Discount Alert!</h2>
                                                <p>Hello ${user.name || 'Valued Customer'},</p>
                                                <p>Good news! A book in your wishlist is now on sale:</p>
                                                
                                                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; display: flex; align-items: center;">
                                                    <div style="margin-right: 15px;">
                                                        <img src="${updatedBookData.image}" alt="${updatedBookData.title}" style="width: 80px; height: 120px; object-fit: cover; border-radius: 3px;">
                                                    </div>
                                                    <div>
                                                        <h3 style="margin: 0 0 10px 0; color: #333;">${updatedBookData.title}</h3>
                                                        <p style="margin: 0; color: #666;">by ${updatedBookData.author}</p>
                                                        <p style="margin: 10px 0 0 0; font-size: 1.1em;">
                                                            <span style="text-decoration: line-through; color: #999;">$${originalPrice.toFixed(2)}</span>
                                                            <span style="color: #e53935; font-weight: bold; margin-left: 10px;">$${newPrice.toFixed(2)}</span>
                                                            <span style="background-color: #e53935; color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.8em; margin-left: 10px;">${discountRateNum}% OFF</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <p>Don't miss out on this limited-time offer! Visit your wishlist to purchase this book at its discounted price.</p>
                                                
                                                <div style="text-align: center; margin-top: 25px;">
                                                    <a href="http://localhost:3000/wishlist" style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Your Wishlist</a>
                                                </div>
                                                
                                                <p style="margin-top: 30px; font-size: 0.9em; color: #666; text-align: center;">
                                                    Thank you for shopping with STORE 26!
                                                </p>
                                            </div>
                                        `
                                    });
                                    
                                    notifiedUsers.add(user.email);
                                } catch (userError) {
                                    console.error(`Error processing user ${userId}:`, userError);
                                }
                            }
                        } else {
                            console.log(`No users have book ${updatedBookData.title} in their wishlist`);
                        }
                    } catch (notifyError) {
                        console.error(`Error sending notifications for book ${bookId}:`, notifyError);
                        // We'll continue processing other books even if notifications fail for one book
                    }
                }
            } catch (error) {
                console.error(`Error processing book ${bookId}:`, error);
                failedBooks.push({ bookId, reason: error.message });
            }
        }
        
        res.json({
            success: true,
            message: `Discount of ${discountRateNum}% applied to ${updatedBooks.length} books`,
            updatedBooks,
            failedBooks,
            notifiedUsers: notifiedUsers.size
        });
    } catch (err) {
        console.error("Error applying bulk discount:", err);
        res.status(500).json({ 
            success: false,
            message: "Error applying bulk discount", 
            error: err.message 
        });
    }
});

module.exports = router;
