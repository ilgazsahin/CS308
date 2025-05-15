const express = require("express");
const router = express.Router();
const CommentModel = require("../Models/CommentModel");
const RatingModel = require("../Models/RatingModel");
const OrderModel = require("../Models/OrderModel");
const UserModel  = require("../Models/UserModel"); 
const Book = require("../Models/BookModel"); 

router.get("/pending", async (req, res) => {
    try {
      const pending = await CommentModel.find({ status: false })
        .populate("user", "name email")
        .populate("book", "title"); 
  
      res.json(pending);
    } catch (err) {
      console.error("Error fetching pending comments:", err);
      res.status(500).json({ message: "Failed to fetch pending comments", error: err.message });
    }
  });
  router.get("/all", async (req, res) => {
    try {
      const allComments = await CommentModel.find()
        .populate("user", "name email")
        .populate("book", "title")
        .sort({ createdAt: -1 });
      res.json(allComments);
    } catch (err) {
      console.error("Error fetching all comments:", err);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
router.get("/:bookId", async (req, res) => {
  try {
    const comments = await CommentModel.find({
      book: req.params.bookId,
      status: true
    })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

    const ratings = await RatingModel.find({
      book: req.params.bookId
    })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

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

    const allReviews = [...reviews, ...standaloneRatings].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

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

router.post("/:bookId", async (req, res) => {
  try {
    const { userId, text, orderId } = req.body;

    if (!orderId || !userId || !text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = await OrderModel.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status.toLowerCase() !== "delivered") {
      return res.status(400).json({
        message: "You can only comment on delivered orders"
      });
    }

    const existingComment = await CommentModel.findOne({
      book: req.params.bookId,
      user: userId,
      orderId
    });

    if (existingComment) {
      return res.status(400).json({
        message: "You have already commented on this book with this order"
      });
    }

    const newComment = new CommentModel({
      book: req.params.bookId,
      user: userId,
      text,
      orderId,
      status: false
    });

    await newComment.save();
    const populated = await newComment.populate("user", "name email");

    res.status(201).json(populated);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Error adding comment", error: err.message });
  }
});

router.patch("/:commentId/status", async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await CommentModel.findByIdAndUpdate(
      req.params.commentId,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!updated) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating comment status:", err);
    res.status(500).json({ message: "Error updating comment", error: err.message });
  }
});


router.delete("/:id", async (req, res) => {
    try {
      const comment = await CommentModel.findById(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
  
      await CommentModel.findByIdAndDelete(req.params.id);
  
      const deletedRating = await RatingModel.findOneAndDelete({
        book: comment.book,
        user: comment.user,
        orderId: comment.orderId?.toString() 
      });
  
      res.json({
        message: "Comment deleted",
        ratingDeleted: !!deletedRating
      });
    } catch (err) {
      console.error("Error deleting comment and rating:", err);
      res.status(500).json({ message: "Failed to delete comment and rating", error: err.message });
    }
  });
  
  
  
module.exports = router;
