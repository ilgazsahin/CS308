const express = require("express");
const router = express.Router();
const CommentModel = require("../Models/CommentModel");
const RatingModel = require("../Models/RatingModel");
const OrderModel = require("../Models/OrderModel");

// GET all approved comments with their ratings for a specific book
router.get("/:bookId", async (req, res) => {
    try {
        // Get approved comments
        const comments = await CommentModel.find({ 
            book: req.params.bookId,
            status: true
        }).populate("user", "name email")
        .sort({ createdAt: -1 });

        // Get all ratings
        const ratings = await RatingModel.find({
            book: req.params.bookId
        }).populate("user", "name email")
        .sort({ createdAt: -1 });

        // Calculate average rating
        const averageRating = ratings.length > 0 
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
            : 0;

        // Combine comments with their corresponding ratings by orderId
        const reviews = comments.map(comment => {
            const matchingRating = ratings.find(r => 
                r.user._id.toString() === comment.user._id.toString() &&
                r.orderId === comment.orderId
            );

            return {
                _id: comment._id,
                user: comment.user,
                text: comment.text,
                rating: matchingRating ? matchingRating.rating : null,
                createdAt: comment.createdAt,
                orderId: comment.orderId
            };
        });

        // Add standalone ratings (without comments or with unapproved comments)
        const standaloneRatings = ratings
            .filter(rating => !comments.some(
                comment => 
                    comment.user._id.toString() === rating.user._id.toString() &&
                    comment.orderId === rating.orderId
            ))
            .map(rating => ({
                _id: rating._id,
                user: rating.user,
                text: null,
                rating: rating.rating,
                createdAt: rating.createdAt,
                orderId: rating.orderId
            }));

        const allReviews = [...reviews, ...standaloneRatings]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            reviews: allReviews,
            averageRating,
            totalRatings: ratings.length
        });
    } catch (err) {
        console.error("Error retrieving reviews:", err);
        res.status(500).json({ message: "Error retrieving reviews", error: err.message });
    }
});

// POST a new comment
router.post("/:bookId", async (req, res) => {
    try {
        const { userId, text, orderId } = req.body;
        
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
                message: "You can only review items from delivered orders" 
            });
        }

        // Check if user has already commented on this book with this orderId
        const existingComment = await CommentModel.findOne({
            book: req.params.bookId,
            user: userId,
            orderId: orderId
        });

        if (existingComment) {
            return res.status(400).json({ 
                message: "You have already submitted a comment for this book with this order" 
            });
        }

        // Create new comment only if no existing comment found
        const newComment = new CommentModel({
            book: req.params.bookId,
            user: userId,
            text,
            orderId,
            status: false
        });

        await newComment.save();
        const populatedComment = await newComment.populate("user", "name email");
        res.status(201).json(populatedComment);
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(400).json({ message: "Error adding comment", error: err.message });
    }
});

// Check if user has reviewed a specific book for a specific order
router.get("/check-review-status", async (req, res) => {
    try {
        const { userId, bookId, orderId } = req.query;

        const hasComment = await CommentModel.findOne({
            user: userId,
            book: bookId,
            orderId: orderId
        });

        const hasRating = await RatingModel.findOne({
            user: userId,
            book: bookId,
            orderId: orderId
        });

        res.json({
            hasReviewed: !!(hasComment || hasRating),
            hasComment: !!hasComment,
            hasRating: !!hasRating
        });
    } catch (err) {
        res.status(500).json({ message: "Error checking review status", error: err.message });
    }
});

// Update comment status (for admin)
router.patch("/:commentId/status", async (req, res) => {
    try {
        const { status } = req.body;
        const updatedComment = await CommentModel.findByIdAndUpdate(
            req.params.commentId,
            { status },
            { new: true }
        ).populate("user", "name email");
        
        if (!updatedComment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        
        res.json(updatedComment);
    } catch (err) {
        res.status(500).json({ message: "Error updating comment status", error: err.message });
    }
});

module.exports = router;
