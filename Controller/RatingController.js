const express = require("express");
const router = express.Router();
const RatingModel = require("../Models/RatingModel");
const OrderModel = require("../Models/OrderModel");

// POST a new rating
router.post("/:bookId", async (req, res) => {
    try {
        const { userId, rating, orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ message: "OrderId is required" });
        }

        // Check order status
        const order = await OrderModel.findOne({ orderId: orderId });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.status.toLowerCase() !== "delivered") {
            return res.status(400).json({ 
                message: "You can only rate items from delivered orders" 
            });
        }

        // Check if user has already rated this book with this orderId
        const existingRating = await RatingModel.findOne({
            book: req.params.bookId,
            user: userId,
            orderId: orderId
        });

        if (existingRating) {
            return res.status(400).json({ 
                message: "You have already submitted a rating for this book with this order" 
            });
        }

        // Create new rating only if no existing rating found
        const newRating = new RatingModel({
            book: req.params.bookId,
            user: userId,
            rating,
            orderId
        });

        const savedRating = await newRating.save();
        res.status(201).json(savedRating);
    } catch (err) {
        console.error("Error adding rating:", err);
        res.status(400).json({ message: "Error adding rating", error: err.message });
    }
});

// GET average rating for a specific book
router.get("/book/:bookId", async (req, res) => {
    try {
        const ratings = await RatingModel.find({ 
            book: req.params.bookId 
        });
        
        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

        res.json({
            averageRating,
            totalRatings: ratings.length
        });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving ratings", error: err.message });
    }
});

// GET ratings for a specific order
router.get("/book/:bookId/order/:orderId", async (req, res) => {
    try {
        const rating = await RatingModel.findOne({
            book: req.params.bookId,
            orderId: req.params.orderId
        });
        res.json(rating);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving rating", error: err.message });
    }
});

// GET user's rating for a specific book
router.get("/user/:userId/book/:bookId", async (req, res) => {
    try {
        const rating = await RatingModel.findOne({
            book: req.params.bookId,
            user: req.params.userId
        });
        res.json(rating || { rating: 0 });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving rating", error: err.message });
    }
});

module.exports = router; 