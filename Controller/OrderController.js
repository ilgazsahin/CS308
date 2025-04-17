const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Define Order Schema if not already defined in models
const OrderSchema = new mongoose.Schema({
    orderId: {
        type: Number,
        required: true
    },
    orderNumber: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: String,
        required: true
    },
    items: [{
        _id: String,
        title: String,
        author: String,
        price: Number,
        image: String,
        quantity: Number
    }],
    shippingInfo: {
        name: String,
        email: String,
        address: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        phone: String
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Pending'
    }
}, { timestamps: true });

// Create Order model if not exists
let OrderModel;
try {
    OrderModel = mongoose.model('Order');
} catch (error) {
    OrderModel = mongoose.model('Order', OrderSchema);
}

// Create a new order
router.post("/", async (req, res) => {
    try {
        const orderData = req.body;
        const newOrder = await OrderModel.create(orderData);
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ message: "Error creating order", error: err.message });
    }
});

// Get all orders for a user
router.get("/user/:userId", async (req, res) => {
    try {
        const orders = await OrderModel.find({ userId: req.params.userId })
            .sort({ orderDate: -1 }); // Sort by date, newest first
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving orders", error: err.message });
    }
});

// Check if a user has purchased a specific book
router.get("/check-purchase", async (req, res) => {
    try {
        const { userId, bookId } = req.query;
        
        if (!userId || !bookId) {
            return res.status(400).json({ 
                message: "Missing required parameters", 
                hasPurchased: false 
            });
        }

        // Find orders for this user that contain the specified book
        const orders = await OrderModel.find({
            userId,
            'items._id': bookId,
            status: 'Paid' // Only count completed orders
        });

        // User has purchased if at least one matching order exists
        const hasPurchased = orders.length > 0;
        
        res.json({ hasPurchased });
    } catch (err) {
        console.error("Error checking purchase status:", err);
        res.status(500).json({ 
            message: "Error checking purchase status", 
            error: err.message,
            hasPurchased: false
        });
    }
});

module.exports = router; 