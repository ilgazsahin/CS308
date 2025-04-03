const express = require("express");
const router = express.Router();
const CommentModel = require("../Models/CommentModel");

// GET all comments for a specific book
router.get("/:bookId", async (req, res) => {
    try {
        const comments = await CommentModel.find({ book: req.params.bookId })
            .populate("user", "name email");
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving comments", error: err.message });
    }
});

// POST a new comment for a specific book
router.post("/:bookId", async (req, res) => {
    try {
        const { userId, text, rating } = req.body;
        const newComment = await CommentModel.create({
            book: req.params.bookId,
            user: userId,
            text,
            rating
        });
        const populatedComment = await newComment.populate("user", "name email");
        res.status(201).json(populatedComment);
    } catch (err) {
        res.status(400).json({ message: "Error adding comment", error: err.message });
    }
});

module.exports = router;
