const express = require("express");
const router = express.Router();
const CartModel = require("../Models/CartModel");

// Get cart for a specific user
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        let cart = await CartModel.findOne({ userId });
        
        if (!cart) {
            // Create empty cart if none exists
            cart = { userId, items: [] };
        }
        
        res.json(cart.items || []);
    } catch (err) {
        console.error("Error retrieving cart:", err);
        res.status(500).json({ message: "Error retrieving cart", error: err.message });
    }
});

// Update or create a user's cart
router.post("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { items } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        // Check if cart exists for this user
        let cart = await CartModel.findOne({ userId });
        
        if (cart) {
            // Update existing cart
            cart.items = items;
            cart.updatedAt = new Date();
            await cart.save();
        } else {
            // Create new cart
            cart = new CartModel({
                userId,
                items,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await cart.save();
        }
        
        res.status(200).json(cart.items);
    } catch (err) {
        console.error("Error updating cart:", err);
        res.status(500).json({ message: "Error updating cart", error: err.message });
    }
});

// Delete a user's cart
router.delete("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        await CartModel.findOneAndDelete({ userId });
        
        res.status(200).json({ message: "Cart deleted successfully" });
    } catch (err) {
        console.error("Error deleting cart:", err);
        res.status(500).json({ message: "Error deleting cart", error: err.message });
    }
});

module.exports = router; 